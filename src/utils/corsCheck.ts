import { Express } from "express";
import cors from "cors";

export const corsCheck = (app: Express) => {
  if (process.env.ENVIRONMENT === "staging") {
    app.use(
      cors({
        origin: '*'
      })
    );
  }
};
