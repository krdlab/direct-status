import * as cluster from "cluster";
import { Worker } from "cluster";
import { SenderProxy, ReceiverProxy, WORKER_SCRIPT } from "./client-proxy";
import { connection } from "./db";
import { Check } from "./entity/Check";
import { Send } from "./entity/Send";
import { Receive } from "./entity/Receive";

cluster.setupMaster({ exec: WORKER_SCRIPT });

enum ServiceStatus {
  Normally  = 0,
  Degrading = 1,
}

export interface ServiceStats {
  sendReceive: Array<{time: number, timestamp: string}>;
}

export class DirectObserverOptions {
  readonly talkId: string;
  readonly senderToken: string;
  readonly receiverToken: string;

  constructor(env: NodeJS.ProcessEnv) {
    this.talkId = env.DIRECT_TALK_ID || "";
    this.senderToken = env.DIRECT_SENDER_TOKEN || "";
    this.receiverToken = env.DIRECT_RECEIVER_TOKEN || "";
  }

  validate(): boolean {
    return this.talkId != "" && this.senderToken != "" && this.receiverToken != "";
  }
}

export class DirectObserver {
  private sender: SenderProxy;
  private receiver: ReceiverProxy;

  constructor(options: DirectObserverOptions) {
    this.sender = new SenderProxy(cluster.fork(), options.senderToken, options.talkId);
    this.receiver = new ReceiverProxy(cluster.fork(), options.receiverToken, options.talkId);
  }

  start(): Promise<[string, string]> {
    return Promise.all([this.sender.start(), this.receiver.start()]);
  }

  getServiceStatus(): any {
    return { service: ServiceStatus.Normally }; // TODO
  }

  // FIXME: this method is not good enough yet. hmm...
  async getServiceStats(count: number): Promise<ServiceStats> {
    const diff = "(strftime('%s', r.timestamp) + strftime('%f', r.timestamp) - strftime('%S', r.timestamp)) - (strftime('%s', s.timestamp) + strftime('%f', s.timestamp) - strftime('%S', s.timestamp))";
    const conn = await connection;
    const times = await conn.createQueryBuilder()
      .from(Check, "c")
      .innerJoin(Receive, "r", "r.id = c.id")
      .innerJoin(Send, "s", "s.id = c.id")
      .orderBy("c.id", "DESC")
      .limit(count)
      .select(`(${diff}) * 1000`, "time")
      .addSelect("strftime('%Y-%m-%dT%H:%M:%SZ', c.timestamp)", "timestamp")
      .getRawMany();
    const stats: ServiceStats = {
      sendReceive: times.reverse()
    };
    return stats;
  }

  stop(): Promise<[string, string]> {
    return Promise.all([this.sender.close(), this.receiver.close()]);
  }
}