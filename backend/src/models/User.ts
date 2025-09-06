// src/models/User.ts
import mongoose, { Document, Schema, Model } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
  status: "Active" | "Inactive"; // added
  avatar: string; // added
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  {
    versionKey: false,
    timestamps: true, // adds createdAt & updatedAt
  }
);

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
