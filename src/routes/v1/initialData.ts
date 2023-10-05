import { Request, Response, NextFunction } from "express";
import { predValDataHolder } from "../../datafeed/dataHolder";

export const initialData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Send a JSON response
    if (predValDataHolder.theFixedMessage) {
      res.status(200).json(predValDataHolder.theFixedMessage);
      return;
    }
    next(new Error("No data available"));
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
};
