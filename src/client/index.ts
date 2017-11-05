import * as cluster from "cluster";
import * as t from "../types";
import { Sender } from "./sender";
import { Receiver } from "./receiver";

type Client = { start: () => void, stop: () => void };
let client: Client | null = null;

process.on("message", msg => { dispatch(msg); });

const dispatch = (msg: t.IpcMessage) => {
  switch (msg.method) {
    case t.ClientMethod.Start:
      start(msg);
      break;
    case t.ClientMethod.Stop:
      stop(msg);
      break;
    default:
      console.error(`Not implemented: ${JSON.stringify(msg)}`);
  }
};

function start(msg: t.IStart): void {
  client = create(msg);
  client.start();
  process.send!({method: msg.method, result: "OK"});
};

function create(msg: t.IStart): Client {
  switch (msg.role) {
    case t.Role.Sender:
      return new Sender(msg.role, msg.accessToken, msg.talkId);
    case t.Role.Receiver:
      return new Receiver(msg.role, msg.accessToken, msg.talkId);
  }
  throw Error("not implemented");
}

function stop(msg: t.IStop): void {
  client ? client.stop() : undefined;
  process.send!({method: msg.method, result: "OK"});
}