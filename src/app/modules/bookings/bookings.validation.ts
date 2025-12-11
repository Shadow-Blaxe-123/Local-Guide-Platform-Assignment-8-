import { z } from "zod";

const createBookingZodSchema = z.object({
  tourId: z.string(),
  scheduledAt: z.string().refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date > new Date();
    },
    { message: "scheduledAt must be a future date and time" }
  ),
});

const updateBookingGuideZodSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED"]),
});
const updateBookingTouristZodSchema = z.object({
  status: z.enum(["COMPLETED", "CANCELLED"]),
});
export const BookingsValidation = {
  createBookingZodSchema,
  updateBookingGuideZodSchema,
  updateBookingTouristZodSchema,
};
