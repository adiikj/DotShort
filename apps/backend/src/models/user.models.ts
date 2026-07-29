import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  refreshToken?: string;
  links: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    links: [{ type: mongoose.Schema.Types.ObjectId, ref: "Url" }],
  },
  { timestamps: true }
);

// Pre-save hook to hash password before saving
userSchema.pre("save", async function (this: IUser, next) {
  if (!this.isModified("password")) return next();

  try {
    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(this.password, 10);
    console.log("Hashed Password: ", hashedPassword);

    this.password = hashedPassword; // Replace the plain password with the hashed password
    next();
  } catch (error) {
    next(error as Error); // Pass error to the next middleware if any
  }
});

// Method to check if entered password matches the hashed password
userSchema.methods.isPasswordCorrect = async function (
  this: IUser,
  password: string
): Promise<boolean> {
  try {
    // Compare entered password with stored hashed password
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    console.error("Error comparing password:", error);
    throw new Error("Password verification failed");
  }
};

userSchema.methods.generateAccessToken = function (this: IUser): string {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      name: this.name,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    } as jwt.SignOptions
  );
};

userSchema.methods.generateRefreshToken = function (this: IUser): string {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    } as jwt.SignOptions
  );
};

// Create and export the User model
export const User = mongoose.model<IUser>("User", userSchema);
