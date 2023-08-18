import dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import { errorHandler } from "./utils/errorHandler";
import { providerListener } from "./datafeed/providerListener";
import { corsCheck } from "./utils/corsCheck";
import { v1router } from "./routes/v1";
import { newSubscriberListener } from "./datafeed/newSubscriberListener";
import { logStream } from "./utils/logStream";

if (process.env.NODE_ENV === "development") {
  logStream();
}

const app = express();
corsCheck(app);
const httpServer = createServer(app);
const io = new Server(httpServer, {
  path: "/api/datafeed",
});



app.use(express.json());
app.use("/api/v1", v1router);
errorHandler(app);

newSubscriberListener({
  io,
});

providerListener({
  io,
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server is running in http://localhost:${PORT}`);
});
