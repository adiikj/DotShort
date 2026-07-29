import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcrypt";

export interface IUrl extends Document {
  longUrl: string;
  shortCode: string;
  shortUrl: string;
  qrCode?: string;
  password?: string | null;
  expiresAt?: Date | null;
  createdAt: Date;
  user?: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const urlSchema = new Schema<IUrl>({
  longUrl: {
    type: String,
    required: true,
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
  },
  shortUrl: {
    type: String,
    required: true,
  },
  qrCode: {
    type: String,
  },
  password: {
    type: String,
  },
  expiresAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    // Reference to the user who created the URL
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
});

urlSchema.methods.comparePassword = async function (
  this: IUrl,
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const Url = mongoose.model<IUrl>("Url", urlSchema);
