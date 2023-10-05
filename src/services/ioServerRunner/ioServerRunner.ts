import { Server } from "socket.io";
import { TIoServerRunnerArgs } from "./ioServerRunner.types";
import { newSubscriberListener } from "../../datafeed/newSubscriberListener";
import { providerListener } from "../../datafeed/providerListener";
import { currentConfig } from "../../utils/appconstants";
import { EEpochEmitterNames, TOpfProvidedPredictions, epochEmitters } from "../../metadata/config";

export const ioServerRunner = ({ httpServer }: TIoServerRunnerArgs) => {
  const io = new Server(httpServer, {
    path: "/api/datafeed",
  });

  newSubscriberListener({
    io,
  });

  Object.entries(epochEmitters).forEach(
    ([key, epochEmitterName]: [keyof TOpfProvidedPredictions, EEpochEmitterNames]) => {
      const contractAddresses = currentConfig.opfProvidedPredictions[key];
      if (!contractAddresses) return;

      providerListener({
        io,
        contractAddresses,
        epochEmitterName,
      });
    }
  );
};
