import { IncomingMessage, Server, ServerResponse } from "http";

export type TIoServerRunnerArgs = {
  httpServer: Server<typeof IncomingMessage, typeof ServerResponse>;
};
