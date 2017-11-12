import { create } from "./direct";
import { connection } from "../db";
import { Check } from "../entity/Check";
import { Receive } from "../entity/Receive";

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
    this._proc(id, begin, end);
  }

  private _proc(id: string, begin: Date, end: Date) {
    connection
      .then(async conn => {
        const check = await conn.getRepository(Check).findOneById(id);
        if (!check) {
          throw `Check entity not found: id = ${id}`
        }
        const r = new Receive(check, end);
        await conn.manager.save(r);
      })
      .catch(console.error);
  }

  start(): void {
    this.api.on("TextMessage", this._handle);
    this.api.listen();
  }

  stop(): void {
    // TODO
  }
}