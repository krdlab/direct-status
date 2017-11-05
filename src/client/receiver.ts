import { create } from "./direct";

export class Receiver {
  api: any;
  private readonly targetTalkId: string;

  constructor(role: string, token: string, talkId: string) {
    this.api = create(role, token);
    this.targetTalkId = talkId;
    this._handle = this._handle.bind(this);
    this._decimalStrToHLStr = this._decimalStrToHLStr.bind(this);
  }

  private _decimalStrToHLStr(s: string): string {
    const i = this.api.parseInt64(s); // input decimal string
    return `_${i.high}_${i.low}`;
  }

  private _handle(talk: any, author: any, msg: any): void {
    if (talk.room != this._decimalStrToHLStr(this.targetTalkId)) {
      return;
    }

    const m = /\$check: (\d+), (.+)$/.exec(msg.content);
    if (!m) {
      return;
    }

    const id = m[1];
    const begin = new Date(m[2]);
    const end = new Date();
    console.log(`TODO receiver: id = ${id}, time = ${end.getTime() - begin.getTime()}`);
  }

  start(): void {
    this.api.on("TextMessage", this._handle);
    this.api.listen();
  }

  stop(): void {
    // TODO
  }
}