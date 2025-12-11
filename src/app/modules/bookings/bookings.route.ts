import { Router } from "express";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";
import { BookingController } from "./bookings.controller";
import validateRequest from "../../middlewares/validateRequest";
import { BookingsValidation } from "./bookings.validation";

const router = Router();

router.post(
  "/",
  auth(Role.TOURIST),
  validateRequest(BookingsValidation.createBookingZodSchema),
  BookingController.createBooking
);

router.patch(
  "/guide/:id",
  auth(Role.GUIDE),
  validateRequest(BookingsValidation.updateBookingGuideZodSchema),
  BookingController.updateBookingStatusGuide
);

router.patch(
  "/tourist/:id",
  auth(Role.TOURIST),
  validateRequest(BookingsValidation.updateBookingTouristZodSchema),
  BookingController.updateBookingStatusTourist
);

export const BookingsRoutes = router;
