import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMember extends Document {
  userId: Types.ObjectId;
  email: string;
  subscribedAt: Date;
}

const memberSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    email: { type: String, required: true },
    subscribedAt: { type: Date, default: Date.now },
  },
  {
    collection: "Members",
  }
);

export default mongoose.model<IMember>("Member", memberSchema);
