import { create } from "./direct";

// TODO: DB
let __id = 0;
function next(): number {
  return ++__id;
}

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
    const begin = new Date();
    const id = next();
    this.api.send({room}, `$check: ${id}, ${begin.toISOString()}`);
    //  onread: () => {
    //    console.log(`TODO sender: id = ${id}, time = ${new Date().getTime() - begin.getTime()}`);
    //  }
  }

  stop(): void {
    // TODO
  }
}

