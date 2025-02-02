import { z } from "zod";

export const CreateOtpSchema = z.object({
  email: z.string().email("Invalid email format"), // Built-in email validation
});

export const validateOtpSchema = z.object({
  email: z.string().email("Invalid email format"), // Built-in email validation
  otp: z.string().min(6, "opt must be 6 characters").max(6, "max length will be 6"), // Password must be strong

  name: z.string().min(3, "Name must be at least 3 characters long"), // Minimum length validation
  password: z.string().min(6, "Password must be at least 6 characters"), // Password must be strong
});

export type CreateOtpDto = z.infer<typeof CreateOtpSchema>; // TypeScript type from Zod schema
export type validateOtpDto = z.infer<typeof validateOtpSchema>; // TypeScript type from Zod schema
