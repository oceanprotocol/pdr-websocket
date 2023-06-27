import { NextFunction, Request, Response } from "express";

export const secretKeyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const secretKey = req.headers["x-secret-key"];

  if (!secretKey || secretKey !== process.env.SECRET_KEY) {
    return res
      .status(403)
      .json({ message: "Forbidden. Invalid or missing secret key." });
  }

  next();
};
