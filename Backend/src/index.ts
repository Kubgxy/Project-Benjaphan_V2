import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import bodyParser from 'body-parser';
import fs from 'fs';
import { IncomingMessage } from 'http';

// โหลดค่า .env
dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const mongoURI = process.env.MONGODB_URI as string;

// ========================================================
// 🧠 Step 1: ตรวจสอบ & Copy รูปจาก image → volume ถ้ายังไม่เคยมี
// ========================================================
const volumePath = path.join(__dirname, '../uploads');            // ที่ mount volume จริง
const backupPath = path.join(__dirname, '../uploads-backup');    // ที่อยู่ใน image
const checkFolder = path.join(volumePath, 'products');
const isFolderEmpty = fs.existsSync(checkFolder) && fs.readdirSync(checkFolder).length === 0;

if (!fs.existsSync(checkFolder) || isFolderEmpty) {
  console.log('📦 uploads/ ยังไม่มีข้อมูลหรือว่างเปล่า → Copy รูปตั้งต้นจาก uploads-backup...');
  try {
    fs.cpSync(backupPath, volumePath, { recursive: true });
    console.log('✅ Copy รูปสินค้าตั้งต้นสำเร็จแล้ว');
  } catch (err) {
    console.error('❌ Copy uploads failed:', err);
  }
} else {
  console.log('✅ พบ uploads แล้ว → ข้ามการ Copy');
}

// ========================================================
// 🌐 Middleware
// ========================================================
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://benjaphan5.com',
    'https://admin-dashboard.benjaphan5.com',
  ],
  credentials: true              
}));
app.use(cookieParser());
app.use(bodyParser.json({
  type: (req: IncomingMessage) =>
    req.headers['content-type']?.includes('application/json') || false
}));
app.set('trust proxy', true);

// ========================================================
// 🔌 Connect MongoDB
// ========================================================
mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch((error) => console.error('❌ MongoDB connection error:', error));

// ========================================================
// 🧪 Test route
// ========================================================
app.get('/', (_req, res) => {
  res.send('🎉 Hello from E-commerce Backend with Yarn + MongoDB!');
});

// ========================================================
// 🧩 Import & Use Routes
// ========================================================
import auth from './routes/auth.route';
import user from './routes/user.route';
import product from './routes/product.route';
import article from './routes/article.route';
import cart from './routes/cart.route';
import wishlist from './routes/wishlist.route';
import review from './routes/review.route';
import order from './routes/order.route';
import contact from './routes/contact.route';
import notification from './routes/notification.route';
import setting from './routes/setting.route';

app.use('/api/auth', auth);
app.use('/api/user', user);
app.use('/api/product', product);
app.use('/api/article', article);
app.use('/api/cart', cart);
app.use('/api/wishlist', wishlist);
app.use('/api/review', review);
app.use('/api/order', order);
app.use('/api/contact', contact);
app.use('/api/notifications', notification);
app.use('/api/setting', setting);

// ========================================================
// 📂 Serve Static Files
// ========================================================
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ========================================================
// 🚀 Start Server
// ========================================================
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});
