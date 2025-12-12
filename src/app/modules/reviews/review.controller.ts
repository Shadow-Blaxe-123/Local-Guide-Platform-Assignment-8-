import type { Request, Response } from "express";
import catchAsync from "../../helper/catchAsync";

import sendResponse from "../../helper/sendResponse";
import status from "http-status";

import type { IJWTPayload } from "../../interfaces";
import pick from "../../helper/pick";

import { ReviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.createReview(
    req.user as IJWTPayload,
    req.body
  );
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Review created successfully!",
    data: result,
  });
});
const updateReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.updateReview(
    req.user as IJWTPayload,
    req.params.id as string,
    req.body
  );
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Review updated successfully!",
    data: result,
  });
});
const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["page", "limit", "sortBy", "sort"]);
  const filters = pick(req.query, ["rating", "searchTerm"]);

  const result = await ReviewService.getAllReviews(
    filters,
    options,
    req.user as IJWTPayload
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reviews retrieved successfully!",
    data: result.data,
    meta: result.meta,
  });
});
const getSingleReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getSingleReview(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review retrieved successfully!",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.deleteReview(
    req.user as IJWTPayload,
    req.params.id as string
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Review deleted successfully!",
    data: result,
  });
});

export const ReviewController = {
  createReview,
  updateReview,
  getAllReviews,
  getSingleReview,
  deleteReview,
};
