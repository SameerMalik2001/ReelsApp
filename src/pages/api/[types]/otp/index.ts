import { NextApiRequest, NextApiResponse } from "next";
import Otp from "../../../../modal/otp.modal";
import { connectDB } from "../../../../../lib/mongo";
import { CreateOtpSchema, validateOtpSchema } from "@/dto/otp.dto";
import { sendEmail } from "@/utils/OtpService";
import { loginUser, registerUser } from "../user";
import { MESSAGES } from "@/utils/ErrorMessage";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB(); // Ensure DB connection

  if (req.method === "POST") {
    const { types } = req.query;

    if (types === "sendOtp") {
      return sendOtp(req, res);
    } else if (types === "validateOtp") {
      return validateOtp(req, res);
    } else {
      return res.status(400).json({ msg: MESSAGES?.INVALID_ACTION_TYPE });
    }
  }

  res.status(405).json({ msg: MESSAGES?.METHOD_NOT_ALLOWD });
}

async function sendOtp(req: NextApiRequest, res: NextApiResponse) {
  try {
    const validatedData = CreateOtpSchema.parse(req.body);
    const { email } = validatedData;
    const EmailInLowerCase = email.toLowerCase();

    const otp = Math.floor(100000 + Math.random() * 900000);

    const mailOptions: any = {
      from: `"ReelsApp" <${process.env.EMAIL_ADDRESS}>`,
      to: EmailInLowerCase,
      subject: "Your OTP Code",
      template: "otp", // Refers to otp.hbs inside /templates
      context: {
        otp,
      },
    };


    // check if the email is present in otp collection
    const existingOtp = await Otp.findOne({ email: EmailInLowerCase });
    if (existingOtp) {
      if (existingOtp.attempt < 3) {
        await existingOtp.updateOne({ otp: otp, attempt: existingOtp.attempt + 1 });
        await sendEmail(mailOptions);
      } else {
        return res.status(403).json({ msg: MESSAGES?.EXCEED_OTP_LIMIT });
      }
    } else {
      await Otp.create({ email: EmailInLowerCase, otp: otp });
      await sendEmail(mailOptions);
    }

    return res.status(200).json({
      msg: MESSAGES?.OTP_SEND_SUCCESSFULLY,
      success: true,
    });
  } catch (error) {
    return res.status(400).json({ msg: MESSAGES?.FAIL_TO_SEND_OTP, errors: error });
  }
}

async function validateOtp(req: NextApiRequest, res: NextApiResponse) {
  try {
    const validatedData = validateOtpSchema.parse(req.body);
    const { email, otp } = validatedData;
    const EmailInLowerCase = email.toLowerCase();

    // check if the email is present in otp collection
    const existingOtp = await Otp.findOne({ email: EmailInLowerCase });
    if (!existingOtp) {
      return res.status(404).json({ msg: MESSAGES?.EMAIL_NOT_EXISTS });
    }

    // check if otp is valid and less then 15 minutes ago
    const currentTime = new Date();
    const otpTime = new Date(existingOtp.createdAt);
    const diffTime = Math.abs(currentTime.getTime() - otpTime.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));

    if (diffMinutes > 15) {
      return res.status(403).json({ msg: MESSAGES?.OTP_EXPIRED });
    }

    if (otp === existingOtp.otp) {
      //delete existing document
      await Otp.findByIdAndDelete(existingOtp.id);

      // create new user
      await registerUser(req, res);
      const result = await loginUser(req, res);

      return res.status(200).json({
        message: MESSAGES?.OTP_VALID,
        success: true,
        result
      });
    }

    return res.status(401).json({
      message: MESSAGES?.OTP_NOT_VALID,
      success: false
    });
  } catch (error) {
    return res.status(400).json({ message: MESSAGES?.OPT_VALIDATION_FAIL, errors: error });
  }
}