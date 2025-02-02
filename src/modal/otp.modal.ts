import mongoose, { Schema, Document } from "mongoose";

export interface OTP extends Document {
  email: string;
  otp: string;
  attempt: number;
}

const OtpSchema = new Schema<OTP>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"], // Regex validation
    },
    otp: { type: String, required: true, minlength: 6, maxlength: 6 },
    attempt: { type: Number, required: true, max: 3, default: 1},
  },
  { timestamps: true }
);

OtpSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;      // Remove _id (MongoDB ObjectId)
    delete ret.__v;      // Remove __v (MongoDB version key)
    return ret;
  },
});

export default mongoose.models.Otp || mongoose.model<OTP>("Otp", OtpSchema);
