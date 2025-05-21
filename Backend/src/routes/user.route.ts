import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getAddress,
  addAddress,
  updateAddress,
  deleteAddress,
  getAllCustomers,
  subscribeNewsletter,
  getAllNewsletterMembers,
} from "../controllers/user.controller";
import { updateMe, getUserProfile } from "../controllers/user.controller";
import { verifyToken } from "../middlewares/verifyToken";
import { upload } from "../middlewares/avatarUpload.middleware";
import { verifyAdmin } from "../middlewares/verifyAdmin";

const user = Router();

// 🟢 Protected Route (เฉพาะคนที่ login แล้ว)
user.get("/me", verifyToken, (req, res) => {
  res.status(200).json({
    message: "👋 Hello, you are authenticated!",
    user: req.user, // 🟢 แสดง user จาก token ที่ decode แล้ว
  });
});

user.post("/registerUser", registerUser);
user.post("/loginUser", loginUser);
user.post("/logoutUser", logoutUser);
user.get("/getUserProfile", verifyToken,  getUserProfile);
user.patch("/updateUser", verifyToken,  upload.single("avatar"), updateMe);
user.get("/getAddress", verifyToken, getAddress);
user.post("/addAddress", verifyToken, addAddress);
user.patch("/updateAddress/:addressId", verifyToken, updateAddress);
user.delete("/deleteAddress/:addressId", verifyToken, deleteAddress);
user.post("/subscribeNewsletter", verifyToken, subscribeNewsletter);

// Admin Route (เฉพาะ admin)
user.get("/getAllCustomers", verifyToken, verifyAdmin, getAllCustomers); // Get all customers
user.get("/getAllNewsletterMembers", verifyToken, verifyAdmin, getAllNewsletterMembers); // Get all newsletter members

export default user;
