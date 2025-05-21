 
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import bodyParser from 'body-parser';
import { IncomingMessage } from 'http';

// โหลดค่า .env
dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const mongoURI = process.env.MONGODB_URI as string;

// Middleware
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

  // Connect MongoDB
  mongoose.connect(mongoURI)
    .then(() => console.log('✅ Connected to MongoDB successfully'))
    .catch((error) => console.error('❌ MongoDB connection error:', error));

  // Test route
  app.get('/', (_req, res) => {
    res.send('🎉 Hello from E-commerce Backend with Yarn + MongoDB!');
  });

  // Import routes
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

  // Use routes
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
  


  // Serve static files
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Start server
  app.listen(port, '0.0.0.0',() => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
  });
