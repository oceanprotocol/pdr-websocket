import { NextFunction, Request, Response } from "express";

import { currentConfig } from "../../utils/appconstants";
import { networkProvider } from "../../utils/networkProvider";
import { predictoorWallet } from "../../utils/appconstants";
import { updatePredictoorSubscriptions } from "../../services/updatePredictorSubscriptions";

export const initialData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const results = await updatePredictoorSubscriptions({
      config: currentConfig,
      user: predictoorWallet,
      provider: networkProvider.getProvider(),
    });

    // Send a JSON response
    res.status(200).json({
      results: results,
    });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
};
