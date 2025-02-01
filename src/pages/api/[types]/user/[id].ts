import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../../../lib/mongo";
import User from '../../../../modal/user.modal'
import { updateUserSchema } from "@/dto/user.dto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { id, types } = req.query;

  if (req.method === "GET") {
    if (types === "fetchUserById") {
      return fetchUserById(req, res, id as string);
    } else {
      return res.status(400).json({ message: "Invalid action type" });
    }
  }

  if (req.method === 'PUT') {
    if(types === 'updateUser') {
      return updateUser(req, res, id as string);
    } else {
      return res.status(400).json({ message: "Invalid action type" });
    }
  }

  if (req.method === "DELETE") {
    if (types === "deleteUserById") {
      return deleteUserById(req, res, id as string);
    } else {
      return res.status(400).json({ message: "Invalid action type" });
    }
  }

  res.status(405).json({ message: "Method not allowed" });
}

async function fetchUserById(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Check if user already exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({success: false,  message: "User is not exists" });
    }

    return res.status(200).json({
      message: "User get successfully",
      user: existingUser,
      success: true
    });
  } catch (error) {
    return res.status(400).json({ message: "Validation error", errors: error, success: false });
  }
}

async function updateUser(req: NextApiRequest, res: NextApiResponse, id:string) {
  try {
    const validatedData = updateUserSchema.parse(req.body);
    const { name, email } = validatedData;

    // Check if user already exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "User is not exists" });
    }

    // Create user
    await User.findByIdAndUpdate(id, { name: name, email: email });

    return res.status(200).json({
      message: "User is udpated successfully",
      success: true,
    });
  } catch (error) {
    return res.status(400).json({ message: "Validation error", errors: error });
  }
}

async function deleteUserById(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Check if user already exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({success: false,  message: "User is not exists" });
    }

    await User?.findByIdAndDelete(id);

    return res.status(200).json({
      message: "User deleted successfully",
      success: true
    });
  } catch (error) {
    return res.status(400).json({ message: "Validation error", errors: error, success: false });
  }
}