// import { Schema, model, Document } from "mongoose";

// export interface IProduct extends Document {
//   id_product: string; // ต้องไม่ซ้ำ (unique)
//   name: string; // จำเป็นต้องมี (required)
//   category: string; // จำเป็นต้องมี (required)
//   price: number; // จำเป็นต้องมี (required)
//   description: string; // จำเป็นต้องมี (required)
//   details: string[]; // ค่าเริ่มต้นเป็น [] (default: [])
//   images: string[]; // ค่าเริ่มต้นเป็น [] (default: [])
//   rating: number; // ค่าเริ่มต้นเป็น 0 (default: 0)
//   reviews: number; // ค่าเริ่มต้นเป็น 0 (default: 0)
//   isNewArrival: boolean; // ค่าเริ่มต้นเป็น false (default: false)
//   isBestseller: boolean; // ค่าเริ่มต้นเป็น false (default: false)
//   isOnSale: boolean; // ค่าเริ่มต้นเป็น false (default: false)
//   availableSizes: { // ต้องมี size และ quantity (required)
//     size: string;
//     quantity: number;
//   }[];
// }

// const productSchema = new Schema<IProduct>(
//   {
//     id_product: { type: String, required: true, unique: true }, // ควร unique ป้องกัน id ซ้ำ
//     name: { type: String, required: true },
//     category: { type: String, required: true },
//     price: { type: Number, required: true },
//     description: { type: String, required: true },
//     details: { type: [String], default: [] },
//     images: { type: [String], required: true , default: [] },
//     rating: { type: Number, default: 0 },
//     reviews: { type: Number, default: 0 },
//     isNewArrival: { type: Boolean, default: false }, // Default value for new products
//     isBestseller: { type: Boolean, default: false },
//     isOnSale: { type: Boolean, default: false },
//     availableSizes: [{
//       size: { type: String, required: true },
//       quantity: { type: Number, required: true }
//     }],
//   },
//   { collection: "Products", timestamps: true }
// );

// const Product = model<IProduct>("Product", productSchema);
// export default Product;