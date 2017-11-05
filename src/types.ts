
export enum Role {
  Sender = "sender",
  Receiver = "receiver",
}

export enum ClientMethod {
  Start = "start",
  Stop = "stop",
}

export interface IStart {
  method: ClientMethod.Start;
  role: Role;
  accessToken: string;
  talkId: string;
}

export interface IStop {
  method: ClientMethod.Stop;
}

export type IpcMessage = IStart | IStop;