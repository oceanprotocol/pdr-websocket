import { Express } from "express";
import cors from "cors";

export const corsCheck = (app: Express) => {
  if (process.env.ENVIRONMENT === "staging" || process.env.ENVIRONMENT === "production" || process.env.ENVIRONMENT === "barge") {
    app.use(
      cors({
        origin: '*'
      })
    );
  }
};
