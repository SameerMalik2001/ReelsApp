import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import User from "../../../../modal/user.modal";
import { CreateUserSchema, updateUserSchema } from "@/dto/user.dto";
import { connectDB } from "../../../../../lib/mongo";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB(); // Ensure DB connection

  if (req.method === "POST") {
    const { types } = req.query;

    if (types === "register") {
      return registerUser(req, res);
    } else {
      return res.status(400).json({ message: "Invalid action type" });
    }
  }

  res.status(405).json({ message: "Method not allowed" });
}

async function registerUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const validatedData = CreateUserSchema.parse(req.body);
    const { name, email, password } = validatedData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ name, email, password: hashedPassword });

    return res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    return res.status(400).json({ message: "Validation error", errors: error });
  }
}

