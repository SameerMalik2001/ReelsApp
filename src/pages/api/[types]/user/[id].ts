import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../../../lib/mongo";
import User from '../../../../modal/user.modal'
import { updateUserSchema } from "@/dto/user.dto";
import { MESSAGES } from "@/utils/ErrorMessage";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { id, types } = req.query;

  if (req.method === "GET") {
    if (types === "fetchUserById") {
      return fetchUserById(req, res, id as string);
    } else {
      return res.status(400).json({ msg: MESSAGES?.INVALID_ACTION_TYPE });
    }
  }

  if (req.method === 'PUT') {
    if(types === 'updateUser') {
      return updateUser(req, res, id as string);
    } else {
      return res.status(400).json({ msg: MESSAGES?.INVALID_ACTION_TYPE });
    }
  }

  if (req.method === "DELETE") {
    if (types === "deleteUserById") {
      return deleteUserById(req, res, id as string);
    } else {
      return res.status(400).json({ msg: MESSAGES?.INVALID_ACTION_TYPE });
    }
  }

  res.status(405).json({ message: MESSAGES?.METHOD_NOT_ALLOWD });
}

async function fetchUserById(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Check if user already exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({success: false,  message: MESSAGES?.USER_NOT_FOUND });
    }

    return res.status(200).json({
      message: MESSAGES?.USER_FOUND,
      user: existingUser,
      success: true
    });
  } catch (error) {
    return res.status(400).json({ message: MESSAGES?.FAIL_TO_GET_USER, errors: error, success: false });
  }
}

async function updateUser(req: NextApiRequest, res: NextApiResponse, id:string) {
  try {
    const validatedData = updateUserSchema.parse(req.body);
    const { name, email } = validatedData;

    // Check if user already exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: MESSAGES?.USER_NOT_FOUND });
    }

    // Create user
    await User.findByIdAndUpdate(id, { name: name, email: email });

    return res.status(200).json({
      message: MESSAGES?.USER_UPDATED_SUCCESSFULLY,
      success: true,
    });
  } catch (error) {
    return res.status(400).json({ message: MESSAGES?.USER_UPDATED_FAILED, errors: error });
  }
}

async function deleteUserById(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Check if user already exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({success: false,  message: MESSAGES?.USER_NOT_FOUND });
    }

    await User?.findByIdAndDelete(id);

    return res.status(200).json({
      message: MESSAGES?.USER_DELETED_SUCCESSFULLY,
      success: true
    });
  } catch (error) {
    return res.status(400).json({ message: MESSAGES?.USER_DELETED_FAILED, errors: error, success: false });
  }
}