import z from "zod";

const createTouristZodSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  password: z.string("Password is required"),
  name: z.string("Name is required").min(1, "Name is required"),
  bio: z.string().optional(),
  languagesSpoken: z.array(z.string()).default(["English"]),
  contactNumber: z.string().optional(),
  travelPreferences: z.array(z.string()).default([]),
});

const createGuideZodSchema = z.object({
  email: z.email("Email is required"),
  password: z.string(),
  name: z.string().nonempty("Name is required"),
  bio: z.string().optional(),
  languagesSpoken: z.array(z.string()).default(["English"]),
  contactNumber: z.string().optional(),
  expertise: z.array(z.string()).default([]), // ["History", "Food", ...]
  dailyRate: z.number().min(0).optional(),
});

// Admin schema
const createAdminZodSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string(),
  name: z.string().nonempty("Name is required"),
  bio: z.string().optional(),
  languagesSpoken: z.array(z.string()).default(["English"]),
  contactNumber: z.string().optional(),
});

export const updateUserSchema = z.object({
  // Base user fields
  email: z.string().email().optional(),
  name: z.string().optional(),
  pic: z.string().optional(),
  bio: z.string().optional(),
  contactNumber: z.string().optional(),
  languagesSpoken: z.array(z.string()).optional(),

  // Role-specific fields
  travelPreferences: z.array(z.string()).optional(), // tourist
  expertise: z.array(z.string()).optional(), // guide
  dailyRate: z.number().optional(), // guide
});

export const UserValidation = {
  createTouristZodSchema,
  createGuideZodSchema,
  createAdminZodSchema,
  updateUserSchema,
};
