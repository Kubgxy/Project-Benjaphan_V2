import express from "express";
import { addReview, deleteReview, getReviewsByProduct, getUserRating, getAverageRating } from "../controllers/review.controller";
import { verifyToken } from "../middlewares/verifyToken";

const review = express.Router();

review.post("/addReview", verifyToken, addReview);
review.delete("/deleteReview/:id", verifyToken, deleteReview);
review.get("/getReviews/:productId", getReviewsByProduct);
review.get("/user-rating/:productId", getUserRating);
review.get("/average/:productId", getAverageRating);

export default review;
