import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string; // Optional field
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, minlength: 3 }, // Minimum length validation
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"], // Regex validation
    },
    password: { type: String, required: true, minlength: 6 }, // Minimum length validation
  },
  { timestamps: true }
);

UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;      // Remove _id (MongoDB ObjectId)
    delete ret.__v;      // Remove __v (MongoDB version key)
    return ret;
  },
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
