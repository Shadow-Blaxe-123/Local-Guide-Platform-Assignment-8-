import z from "zod";

const createTouristZodSchema = z.object({
  email: z.email("Invalid email address").min(1, "Email is required"),
  password: z.string("Password is required"),
  name: z.string("Name is required").min(1, "Name is required"),
  bio: z.string().optional(),
  languagesSpoken: z.array(z.string()).default(["English"]),
  contactNumber: z.string().optional(),
  travelPreferences: z.array(z.string()).default([]),
});

export const UserValidation = { createTouristZodSchema };
