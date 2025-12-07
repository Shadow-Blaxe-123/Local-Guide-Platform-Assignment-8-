import type { Request, Response } from "express";
import catchAsync from "../../helper/catchAsync";
import sendResponse from "../../helper/sendResponse";
import { BookingsService } from "./bookings.service";
import type { IJWTPayload } from "../../interfaces";

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

export const BookingController = {
  createBooking,
};
