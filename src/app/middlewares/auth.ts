import ApiError from "../errors/ApiError";
import status from "http-status";
import type { NextFunction, Request, Response } from "express";
import { jwtHelper } from "../helper/jwtHelper";
import config from "../../config";
import type { IJWTPayload } from "../interfaces";

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies.accessToken || req.headers.authorization;
      if (!token) {
        throw new ApiError(status.UNAUTHORIZED, "You are not logged in!");
      }
      const verifiedUser = jwtHelper.verifyToken(
        token,
        config.jwt.access_token_secret
      );
      req.user = verifiedUser as IJWTPayload;
      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(status.UNAUTHORIZED, "You are not authorized!");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
