import { create } from "./direct";
import { connection } from "../db";
import { Check } from "../entity/Check";
import { Send } from "../entity/Send";

// TODO: configuration
const SEND_INTERVAL = 60; // sec

export class Sender {
  api: any;
  private readonly targetTalkId: string;
  private timer?: NodeJS.Timer;

  constructor(role: string, token: string, talkId: string) {
    this.api = create(role, token);
    this.targetTalkId = talkId;
    this._decimalStrToHLStr = this._decimalStrToHLStr.bind(this);
  }

  private _decimalStrToHLStr(s: string): string {
    const i = this.api.parseInt64(s); // input decimal string
    return `_${i.high}_${i.low}`;
  }

  private _clearTimerIfPresent(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  start(): void {
    this._clearTimerIfPresent();

    const job = () => { this.send() }
    this.timer = setInterval(job, SEND_INTERVAL * 1000);
    this.api.listen();
  }

  private send() {
    const room = this._decimalStrToHLStr(this.targetTalkId);
    connection
      .then(async conn => {
        const c = new Check(new Date());
        await conn.manager.save(c);
        const s = new Send(c, new Date());
        this.api.send({room}, `$check: ${s.id}, ${s.timestamp.toISOString()}`);
        await conn.manager.save(s);
      })
      .catch(console.error);
  }

  // TODO: send, receive にそれぞれ時刻を記録しておけば，select (r.timestamp - s.timestamp) time from check c join send s on s.id = c.id join receive r on r.id = c.id で良くなる

  stop(): void {
    // TODO
  }
}

