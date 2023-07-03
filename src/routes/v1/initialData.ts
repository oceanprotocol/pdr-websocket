import { Request, Response, NextFunction } from "express";
import { predValDataHolder } from "../../datafeed/dataHolder";

export const initialData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Send a JSON response
    res.status(200).json({
      results: predValDataHolder.theFixedMessage,
    });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
};
