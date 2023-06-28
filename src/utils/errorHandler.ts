import { Express, NextFunction, Request, Response } from "express";

export const errorHandler = (app: Express) => {
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500).json({
      message: err.message || "An unknown error occurred",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  });
};
