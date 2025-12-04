import type { Request, Response } from "express";
import catchAsync from "../../helper/catchAsync";
import sendResponse from "../../helper/sendResponse";
import status from "http-status";
import { UserService } from "./user.service";
import { uploadImage } from "../../helper/fileUploader";

const createTourist = catchAsync(async (req: Request, res: Response) => {
  if (req.file) {
    const filename = `image_${Date.now()}`;
    const result = await uploadImage(req.file.buffer, filename);
    req.body.pic = result?.secure_url;
  }
  const result = await UserService.createTourist(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Tourist created successfully!",
    data: result,
  });
});
const createAdmin = catchAsync(async (req: Request, res: Response) => {});
const createGuide = catchAsync(async (req: Request, res: Response) => {});
export const UserController = { createTourist, createAdmin, createGuide };
