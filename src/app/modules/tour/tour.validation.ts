import { z } from "zod";

const TourStatusEnum = z.enum(["ACTIVE", "INACTIVE"]);
const TourCategoryEnum = z.enum([
  "ADVENTURE",
  "CULTURAL",
  "RELIGIOUS",
  "FOOD",
  "NATURE",
  "HISTORICAL",
  "OTHER",
]);

const createTourSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string(),
  itinerary: z.string(),
  category: TourCategoryEnum,
  price: z
    .number("Price must be a number")
    .positive("Price must be a positive integer"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  meetingPoint: z.string().min(3, "Meeting point is required"),
  duration: z.number().int().positive("Duration must be a positive integer"),
  maxGroupSize: z
    .number()
    .int()
    .positive("Max group size must be greater than 0")
    .default(1),
  status: TourStatusEnum.optional().default("ACTIVE"),
});
const updateTourSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(5).optional(),
  itinerary: z.string().min(5).optional(),
  category: TourCategoryEnum.optional(),
  price: z.number().int().positive().optional(),
  city: z.string().min(2).optional(),
  country: z.string().min(2).optional(),
  meetingPoint: z.string().min(3).optional(),
  duration: z.number().int().positive().optional(),
  maxGroupSize: z.number().int().positive().optional(),
  status: TourStatusEnum.optional(),
  deletedImages: z.array(z.string()).optional(),
});

export const TourValidation = {
  createTourSchema,
  updateTourSchema,
};
