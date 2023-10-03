import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { predValDataHolder } from "./dataHolder";
import { EEpochEmitterNames } from "../metadata/config";
import { Maybe } from "graphql/jsutils/Maybe";

type TNewSubscriberListenerArgs = {
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
};

export const newSubscriberListener = async ({
  io,
}: TNewSubscriberListenerArgs) => {
  io.on("connection", function (socket) {
    const timeframe: Maybe<EEpochEmitterNames> = socket.handshake.query
      .timeframe as EEpochEmitterNames;
    if (
      !timeframe ||
      ![EEpochEmitterNames.e_1h, EEpochEmitterNames.e_5m].includes(timeframe)
    )
      return;

    io.to(socket.id).emit(
      "newEpoch",
      predValDataHolder.getFixedMessage(timeframe)
    );

    socket.on("disconnect", () => {
      //console.log(`Client disconnected: ${socket.id}`);
    });
  });
};
