import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true                          // ต้องมี product อ้างอิง
  },
  dateAdded: { type: Date, default: Date.now } // วันเวลาที่เพิ่มเข้ามา
}, { _id: false });

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true                           // หนึ่ง user มีหนึ่ง wishlist
  },
  products: [wishlistItemSchema]           // สินค้าใน wishlist (array)
}, { collection: 'Wishlist', timestamps: true });                  // createdAt, updatedAt

export default mongoose.model('Wishlist', wishlistSchema);
