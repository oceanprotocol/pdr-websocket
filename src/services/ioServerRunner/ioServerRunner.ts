import { Server } from "socket.io";
import { TIoServerRunnerArgs } from "./ioServerRunner.types";
import { newSubscriberListener } from "../../datafeed/newSubscriberListener";
import { providerListener } from "../../datafeed/providerListener";
import { currentConfig } from "../../utils/appconstants";
import { TOpfProvidedPredictions, dataFeedPaths } from "../../metadata/config";

export const ioServerRunner = ({ httpServer }: TIoServerRunnerArgs) => {
  Object.entries(dataFeedPaths).forEach(
    ([key, dataFeedPath]: [keyof TOpfProvidedPredictions, string]) => {
      const contractAddresses = currentConfig.opfProvidedPredictions[key];
      if (!contractAddresses) return;

      const io = new Server(httpServer, {
        path: dataFeedPath,
      });

      newSubscriberListener({
        io,
      });

      providerListener({
        io,
        contractAddresses,
        timeframe: key,
      });
    }
  );
};
