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

export const BookingsValidation = {
  createBookingZodSchema,
};
