// import mongoose, { Schema, Document } from 'mongoose'

// export interface IOrder extends Document {
//   orderId: string
//   userId: mongoose.Types.ObjectId
//   items: {
//     productId: string;
//     name: string;
//     price: number;
//     quantity: number;
//     size: string;
//     images: string[]; 
//   }[];
//   subtotal: number
//   shippingFee: number
//   tax: number
//   total: number
//   shippingInfo: {
//     firstName: string
//     lastName: string
//     phone: string
//     address: string
//     city: string
//     state: string
//     postalCode: string
//     country: string
//   }
//   paymentMethod: string
//   paymentStatus: 'pending' | 'paid' | 'failed'
//   orderStatus: 'pending' | 'preparing' | 'shipped' | 'delivered' | 'canceled'
//   createdAt: Date
//   updatedAt: Date
// }

// const orderSchema: Schema = new Schema<IOrder>(
//   {
//     orderId: { type: String, required: true, unique: true }, // รหัสคำสั่งซื้อ (เช่น UUID)
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ผู้สั่งซื้อ
//     items: [
//       {
//         productId: { type: String, required: true },
//         name: { type: String },
//         price: { type: Number },
//         quantity: { type: Number },
//         size: { type: String },
//         images: [{ type: String }],
//       },
//     ],

//     subtotal: { type: Number },
//     shippingFee: { type: Number },
//     tax: { type: Number },
//     total: { type: Number },

//     shippingInfo: {
//       firstName: { type: String },
//       lastName: { type: String },
//       phone: { type: String },
//       address: { type: String },
//       city: { type: String },
//       state: { type: String },
//       postalCode: { type: String },
//       country: { type: String },
//     },

//     paymentMethod: { type: String }, // เช่น QR, โอน, COD
//     paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
//     orderStatus: {
//       type: String,
//       enum: ['pending', 'preparing', 'shipped', 'delivered', 'canceled'],
//       default: 'pending',
//     },
//   },
//   { collection: 'Orders', timestamps: true } // ⭐ ให้ mongoose สร้าง createdAt, updatedAt ให้อัตโนมัติ
// )

// export default mongoose.model<IOrder>('Order', orderSchema)
