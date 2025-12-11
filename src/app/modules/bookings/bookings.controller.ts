import type { Request, Response } from "express";
import catchAsync from "../../helper/catchAsync";
import sendResponse from "../../helper/sendResponse";
import { BookingsService } from "./bookings.service";
import type { IJWTPayload } from "../../interfaces";
import pick from "../../helper/pick";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingsService.createBooking(
    req.user as IJWTPayload,
    req.body
  );
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Booking created successfully!",
    data: result,
  });
});
const updateBookingStatusGuide = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BookingsService.updateBookingStatusGuide(
      req.user as IJWTPayload,
      req.params.id as string,
      req.body
    );
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Booking updated successfully!",
      data: result,
    });
  }
);
const updateBookingStatusTourist = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BookingsService.updateBookingStatusTourist(
      req.user as IJWTPayload,
      req.params.id as string,
      req.body
    );
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Booking updated successfully!",
      data: result,
    });
  }
);
const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingsService.getSingleBooking(
    req.params.id as string,
    req.user as IJWTPayload
  );
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Booking retrieved successfully!",
    data: result,
  });
});
const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["page", "limit", "sortBy", "sort"]);
  const filters = pick(req.query, [
    "status",
    "paymentStatus",
    "scheduledAt",
    "minPrice",
    "maxPrice",
    "minDateTime",
    "maxDateTime",
  ]);

  const result = await BookingsService.getAllBookings(
    filters,
    options,
    req.user as IJWTPayload
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bookings retrieved successfully!",
    data: result.data,
    meta: result.meta,
  });
});

export const BookingController = {
  createBooking,
  updateBookingStatusGuide,
  updateBookingStatusTourist,
  getSingleBooking,
  getAllBookings,
};
