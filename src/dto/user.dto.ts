import { z } from "zod";

export const CreateUserSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"), // Minimum length validation
  email: z.string().email("Invalid email format"), // Built-in email validation
  password: z.string().min(6, "Password must be at least 6 characters"), // Password must be strong
});

export const updateUserSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"), // Minimum length validation
  email: z.string().email("Invalid email format"), // Built-in email validation
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>; // TypeScript type from Zod schema
