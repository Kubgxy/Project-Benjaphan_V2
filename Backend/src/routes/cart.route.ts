import express from 'express';
import { addToCart, getCartUser, getAllCarts, updateCartItem, removeCartItem, changeItemSize } from '../controllers/cart.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { verifyAdmin } from '../middlewares/verifyAdmin';

const cart = express.Router();

// For User
cart.post("/addToCart", verifyToken, addToCart);
cart.post("/removeCartItem", verifyToken, removeCartItem);
cart.get("/getCart", verifyToken, getCartUser);
cart.post("/updateCartItem", verifyToken, updateCartItem);
cart.post("/changeItemSize", verifyToken, changeItemSize);

// For Admin
cart.get("/getAllCarts", verifyAdmin, getAllCarts);

export default cart;
