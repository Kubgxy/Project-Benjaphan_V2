// // src/models/User.ts
// import { Schema, model, Document } from 'mongoose';

// export interface IUser extends Document {
//   firstName: string;
//   lastName: string;
//   email: string;
//   password: string;
//   role: 'customer' | 'admin';  // เพิ่ม role ไว้เผื่อมี admin
//   avatar?: string;
// }

// const userSchema = new Schema<IUser>({
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
//   avatar: { type: String },
// }, { collection: 'Users' , timestamps: true});

// const User = model<IUser>('User', userSchema);
// export default User;
