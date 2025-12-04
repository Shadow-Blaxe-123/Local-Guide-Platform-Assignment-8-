import z from "zod";

const loginSchema = z.object({
  email: z.email({ error: "Email is required" }),
  password: z.string({ error: "Password is required" }),
});

export const AuthValidation = {
  loginSchema,
};
