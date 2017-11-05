import { Worker } from "cluster";
import { EventEmitter } from "events";
import * as t from "./types";

export const WORKER_SCRIPT = `${__dirname}/client/index.js`;

abstract class DirectClientProxy {
  private worker: Worker;
  private response: EventEmitter;
  private readonly accessToken: string;
  private readonly talkId: string;

  constructor(worker: Worker, accessToken: string, talkId: string) {
    this.worker = worker;
    this.response = new EventEmitter();
    this.accessToken = accessToken;
    this.talkId = talkId;

    this._handleMessage = this._handleMessage.bind(this);
    this.worker.on("message", this._handleMessage);
  }

  private _handleMessage(msg: any): void {
    this.response.emit(msg.method, msg);
  }

  protected abstract get role(): t.Role;

  protected asyncCall(req: t.IpcMessage): Promise<string> {
    return new Promise((resolve, _) => {
      this.worker.send(req);
      this.response.once(req.method, (res) => {
        resolve(res.result);
      });
    });
  }

  start(): Promise<string> {
    const start: t.IStart = {
      method: t.ClientMethod.Start,
      role: this.role,
      accessToken: this.accessToken,
      talkId: this.talkId,
    };
    return this.asyncCall(start);
  }

  close(): Promise<string> {
    const role = this.role;
    const pid = this.worker.id;
    const worker = this.worker;
    return new Promise((resolve, _) => {
      worker.kill();
      worker.on("exit", (code, signal) => {
        console.log(`${role} killed: pid = ${pid}, code = ${code}, signal = ${signal}`);
        resolve("closed");
      });
    });
  }
}

export class SenderProxy extends DirectClientProxy {
  protected get role(): t.Role {
    return t.Role.Sender;
  }
}

export class ReceiverProxy extends DirectClientProxy {
  protected get role(): t.Role {
    return t.Role.Receiver;
  }
}