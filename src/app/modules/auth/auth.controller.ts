import httpStatus from "http-status";
import { AuthService } from "./auth.service";
import sendResponse from "../../helper/sendResponse";
import catchAsync from "../../helper/catchAsync";
import type { Request, Response } from "express";
import type { IJWTPayload } from "../../interfaces";

const login = catchAsync(async (req: Request, res: Response) => {
  const { accessToken, refreshToken } = await AuthService.login(req.body);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User logged in successfully!",
    data: { accessToken, refreshToken },
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IJWTPayload;

  const result = await AuthService.changePassword(user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password Changed successfully",
    data: result,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const userSession = req.cookies;
  const result = await AuthService.getMe(userSession);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User data fetched successfully!",
    data: result,
  });
});

export const AuthController = {
  login,
  changePassword,
  getMe,
};
