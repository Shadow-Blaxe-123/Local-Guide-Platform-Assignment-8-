import z from "zod";

const createReviewZodSchema = z.object({
  tourId: z.string(),
  rating: z.number().max(5).min(0),
  comment: z.string().optional(),
});
const updateReviewZodSchema = z.object({
  rating: z.number().max(5).min(0).optional(),
  comment: z.string().optional(),
});

export const ReviewValidation = {
  createReviewZodSchema,
  updateReviewZodSchema,
};
