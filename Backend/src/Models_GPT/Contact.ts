import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IContact extends Document {
  userId?: Types.ObjectId; 
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: Date;
}

const ContactSchema: Schema = new Schema(
  {
    userId: {    // ✅ เพิ่ม field นี้
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,  // เพราะ Guest ไม่มี userId
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  {
    collection: 'Contacts',
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.model<IContact>('Contact', ContactSchema);
