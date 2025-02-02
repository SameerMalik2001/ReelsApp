import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import User from "../../../../modal/user.modal";
import { CreateUserSchema, loginUserSchema } from "@/dto/user.dto";
import { connectDB } from "../../../../../lib/mongo";
import jwt from "jsonwebtoken";
import { MESSAGES } from "@/utils/ErrorMessage";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB(); // Ensure DB connection

  if (req.method === "POST") {
    const { types } = req.query;

    if (types === "register") {
      return registerUser(req, res);
    } else if (types === "login") {
      return loginUser(req, res);
    } else {
      return res.status(400).json({ msg: MESSAGES?.INVALID_ACTION_TYPE });
    }
  }

  res.status(405).json({ message: MESSAGES?.METHOD_NOT_ALLOWD });
}

export async function registerUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const validatedData = CreateUserSchema.parse(req.body);
    const { name, email, password } = validatedData;
    const EmailInLowerCase = email.toLowerCase();

    const existingUser = await User.findOne({ email: EmailInLowerCase });
    if (existingUser) {
      return { msg: MESSAGES?.EMAIL_ALREADY_EXISTS } // emailis exist
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ name, email: EmailInLowerCase, password: hashedPassword });
    await User.findById(newUser.id).select('-password');

    return { msg: MESSAGES?.USER_CREATED_SUCCESSFULLY }
  } catch (error) {
    return { msg: MESSAGES?.USER_CREATED_FAILED }
  }
}

export async function loginUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const validatedData = loginUserSchema.parse(req.body);
    const { email, password } = validatedData;
    const SECRET_KEY = process.env.JWT_SECRET!
    const EmailInLowerCase = email.toLowerCase();

    const existingUser = await User.findOne({ email: EmailInLowerCase });
    if (!existingUser) {
      return MESSAGES?.EMAIL_NOT_EXISTS //Email is not valid
    }

    const hashedPassword = await bcrypt.compare(password, existingUser.password);

    if (!hashedPassword) {
      return { msg: MESSAGES?.INVALID_PASSWORD } //Password is invalid
    }

    const freshUser = await User.findById(existingUser._id).select('-password')

    const token = jwt.sign(
      { id: freshUser.id },
      SECRET_KEY,
      { expiresIn: "7DAY" }
    );

    return {
      message: MESSAGES?.LOGIN_SUCCESSFULLY,
      user: freshUser,
      token: token
    }
  } catch (error) {
    return { msg: MESSAGES?.LOGIN_FAILED }
  }
}