import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { predValDataHolder } from "./dataHolder";

type TNewSubscriberListenerArgs = {
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
};

export const newSubscriberListener = async ({
  io,
}: TNewSubscriberListenerArgs) => {
  io.on("connection", function (socket) {
    io.to(socket.id).emit("newEpoch", 'hello', 
    //JSON.stringify(predValDataHolder.theFixedMessage)
    );

    socket.on("disconnect", () => {
      //console.log(`Client disconnected: ${socket.id}`);
    });
  });
};
