import type { Request, Response } from "express";
import catchAsync from "../../helper/catchAsync";
import sendResponse from "../../helper/sendResponse";
import status from "http-status";
import { UserService } from "./user.service";
import { uploadImage } from "../../helper/fileUploader";
import pick from "../../helper/pick";
import type { IJWTPayload } from "../../interfaces";

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
const createGuide = catchAsync(async (req: Request, res: Response) => {
  if (req.file) {
    const filename = `image_${Date.now()}`;
    const result = await uploadImage(req.file.buffer, filename);
    req.body.pic = result?.secure_url;
  }
  const result = await UserService.createGuide(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Guide created successfully!",
    data: result,
  });
});
const createAdmin = catchAsync(async (req: Request, res: Response) => {
  if (req.file) {
    const filename = `image_${Date.now()}`;
    const result = await uploadImage(req.file.buffer, filename);
    req.body.pic = result?.secure_url;
  }
  const result = await UserService.createAdmin(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Admin created successfully!",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["page", "limit", "sortBy", "sort"]);
  const filters = pick(req.query, [
    "role",
    "email",
    "searchTerm",
    "travelPreferences",
    "expertise",
    "dailyRate",
  ]);

  const result = await UserService.getAllUsers(filters, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully!",
    data: result.data,
    meta: result.meta,
  });
});
const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getSingleUser(req.params.id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully!",
    data: result,
  });
});
const updateUser = catchAsync(async (req: Request, res: Response) => {
  if (req.file) {
    const filename = `image_${Date.now()}`;
    const result = await uploadImage(req.file.buffer, filename);
    req.body.pic = result?.secure_url;
  }
  const result = await UserService.updateUser(
    req.params.id as string,
    req.user as IJWTPayload,
    req.body
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User updated successfully!",
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.deleteUser(
    req.params.id as string,
    req.user as IJWTPayload
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User deleted successfully!",
    data: result,
  });
});

export const UserController = {
  createTourist,
  createAdmin,
  createGuide,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
};
