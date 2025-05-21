import express from "express";
import { addToWishlist, removeFromWishlist, getWishlist } from "../controllers/wishlist.controller";
import { verifyToken } from "../middlewares/verifyToken";

const wishlist = express.Router();

wishlist.post("/addToWishlist", verifyToken, addToWishlist);
wishlist.post("/removeFromWishlist", verifyToken, removeFromWishlist);
wishlist.get("/getWishlist", verifyToken, getWishlist);

export default wishlist;
