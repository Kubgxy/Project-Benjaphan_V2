import mongoose, { Document, Schema } from "mongoose";

export interface IOtpToken extends Document {
  email: string;
  otp: string;
  ref: string;
  expiresAt: Date;
  verified: boolean;
  attempts: number;
  requestCount: number;
  lastRequestAt: Date;
}

const OtpTokenSchema: Schema = new Schema<IOtpToken>(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    ref: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
    requestCount: { type: Number, default: 1 },
    lastRequestAt: { type: Date, default: Date.now },
  },
  { collection: "OtpTokens", timestamps: true }
);

export const OtpToken =
  mongoose.models.OtpToken ||
  mongoose.model<IOtpToken>("OtpToken", OtpTokenSchema);
