import * as cluster from "cluster";
import { Worker } from "cluster";
import { SenderProxy, ReceiverProxy, WORKER_SCRIPT } from "./client-proxy";

cluster.setupMaster({ exec: WORKER_SCRIPT });

enum ServiceStatus {
  Normally  = 0,
  Degrading = 1,
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

  getServiceStats(count: number): any { // TODO
    const stats = {
      sendReceive: [500, 400, 800, 1000, 200, 300, 450]
    };
    return stats;
  }

  stop(): Promise<[string, string]> {
    return Promise.all([this.sender.close(), this.receiver.close()]);
  }
}