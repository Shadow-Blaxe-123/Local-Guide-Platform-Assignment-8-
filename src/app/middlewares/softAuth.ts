import jwt from "jsonwebtoken";
import config from "../../config";
import type { NextFunction, Request, Response } from "express";
import type { IJWTPayload } from "../interfaces";

export const softAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    req.user = null; // explicitly set for clarity
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      config.jwt.access_token_secret
    ) as IJWTPayload;

    req.user = decoded;
  } catch (error) {
    console.error("Soft auth token failed:", error);
    req.user = null; // ensure undefined never leaks
  }

  return next();
};
