import { Express } from "express";
import cors from "cors";

export const corsCheck = (app: Express) => {
  if (process.env.ENVIRONMENT === "staging" || process.env.ENVIRONMENT === "production") {
    app.use(
      cors({
        origin: '*'
      })
    );
  }
};
