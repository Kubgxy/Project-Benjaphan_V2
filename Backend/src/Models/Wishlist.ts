// import { Schema, model, Document, Types } from "mongoose";

// export interface IWishlist extends Document {
//   userID: string;
//   products: Types.ObjectId[]; // 👉 อ้างอิง ObjectId ของ Product
// }

// const wishlistSchema = new Schema<IWishlist>(
//   {
//     userID: { type: String, required: true, unique: true },
//     products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
//   },
//   { collection: "Wishlist", timestamps: true }
// );

// const Wishlist = model<IWishlist>("Wishlist", wishlistSchema);
// export default Wishlist;
