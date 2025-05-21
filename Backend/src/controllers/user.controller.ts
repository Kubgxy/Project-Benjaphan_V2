import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Model
// import User from "../Models/User";
import User from "../Models_GPT/User";
import Cart from "../Models_GPT/Cart";
import Wishlist from "../Models_GPT/Wishlist";
import Member from "../Models_GPT/Member";

// Register
export const registerUser = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const { firstName, lastName, email, password, phoneNumber, addresses } =
    req.body;

  // ✅ ตรวจว่ากรอกข้อมูลขั้นต่ำ
  if (!firstName || !lastName || !email || !password || !phoneNumber) {
    res.status(400).json({
      message: "❌ Please provide name, email, phone number, and password",
    });
    return;
  }

  try {
    // ✅ ตรวจอีเมลซ้ำ
    const existingEmail = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingEmail) {
      res.status(400).json({ message: "❌ Email already exists" });
      return;
    }

    // ✅ ตรวจเบอร์โทรศัพท์ซ้ำ
    const existingPhone = await User.findOne({
      phoneNumber: phoneNumber.trim(),
    });
    if (existingPhone) {
      res.status(400).json({ message: "❌ Phone number already exists" });
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phoneNumber: phoneNumber.trim(),
      addresses,
      provider: "local",
    });
    await newUser.save();

    // ✅ สร้างตะกร้าและ Wishlist
    const cart = new Cart({ userId: newUser._id });
    const wishlist = new Wishlist({ userId: newUser._id });
    await cart.save();
    await wishlist.save();

    newUser.cartId = cart._id;
    newUser.wishlistId = wishlist._id;
    await newUser.save();

    res.status(201).json({
      message: "✅ User registered successfully",
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
        addresses: newUser.addresses,
        cartId: newUser.cartId,
        wishlistId: newUser.wishlistId,
      },
    });
  } catch (error) {
    console.error("❌ Register error:", error);
    res.status(500).json({ message: "❌ Server error", error });
  }
};

// Login
export const loginUser = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "❌ Please provide email and password" });
    return;
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "❌ User not found" });
      return;
    }

    if (!user.password) {
      res.status(500).json({ message: "❌ Server error: Password is missing" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password as string
    );
    if (!isPasswordValid) {
      res.status(401).json({ message: "❌ Invalid password" });
      return;
    }

    // ✅ สร้าง token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );
    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    console.log("🔐 SIGNING PAYLOAD:", {
      userId: user._id.toString(),
      role: user.role,
    });
    console.log("🔐 JWT_SECRET used for signing:", process.env.JWT_SECRET);
    console.log("🔐 TOKEN after sign:", token);
    // ✅ ส่ง token ผ่าน cookie
    res
      .cookie("token", token, {
        httpOnly: true, // Client-side JS อ่านไม่ได้
        secure: process.env.NODE_ENV === "production", // ใช้ secure เฉพาะ production (HTTPS)
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 วัน
      })
      .status(200)
      .json({
        message: "✅ User logged in successfully",
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
        token,
      });
  } catch (error) {
    res.status(500).json({ message: "❌ Server error", error });
  }
};

// Logout
export const logoutUser = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    res
      .clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .status(200)
      .json({ message: "✅ Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "❌ Server error", error });
  }
};

// Get user profile
export const getUserProfile = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update user and Upload avatar
export const updateMe = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const { firstName, lastName, email, phoneNumber } = req.body;

    // ✅ ตรวจ phone format ก่อนเลย
    if (phoneNumber && !/^\d{9,10}$/.test(phoneNumber)) {
      res.status(400).json({ message: "เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องมี 9–10 หลัก)" });
      return;
    }

    // ✅ ตรวจ email format
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ message: "รูปแบบอีเมลไม่ถูกต้อง" });
      return;
    }

    // ✅ ตรวจ email ซ้ำ (ยกเว้นของตัวเอง)
    const existingEmail = await User.findOne({
      email: email.toLowerCase().trim(),
      _id: { $ne: req.user?.userId },
    });
    if (existingEmail) {
      res.status(400).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });
      return;
    }

    // ✅ ตรวจ phoneNumber ซ้ำ (ยกเว้นของตัวเอง)
    if (phoneNumber) {
      const existingPhone = await User.findOne({
        phoneNumber: phoneNumber.trim(),
        _id: { $ne: req.user?.userId },
      });
      if (existingPhone) {
        res.status(400).json({ message: "เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว" });
        return;
      }
    }

    // ✅ เตรียมข้อมูลอัปเดต
    const avatar = req.file
      ? `/uploads/avatars/${req.file.filename}`
      : undefined;

    const updateData: any = {
      firstName,
      lastName,
      email: email?.toLowerCase().trim(),
      phoneNumber: phoneNumber?.trim(),
    };

    if (avatar) {
      updateData.avatar = avatar;
    }

    // ✅ อัปเดตข้อมูล
    const updatedUser = await User.findByIdAndUpdate(
      req.user?.userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
      return;
    }

    res.status(200).json({
      message: "อัปเดตข้อมูลสำเร็จ",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Update error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ", error });
  }
};


//Get Address
export const getAddress = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId).select("addresses");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const addAddress = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const {
      Name,
      label,
      addressLine,
      city,
      province,
      postalCode,
      country,
      phone,
    } = req.body;
    const userId = req.user?.userId;

    if (
      !Name ||
      !label ||
      !addressLine ||
      !city ||
      !province ||
      !postalCode ||
      !country ||
      !phone
    ) {
      res.status(400).json({ message: "❌ Please provide all address fields" });
      return;
    }

    const newAddress = {
      Name,
      label,
      addressLine,
      city,
      province,
      postalCode,
      country,
      phone,
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { addresses: newAddress } },
      { new: true, runValidators: true }
    ).select("addresses");

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "✅ Address added successfully",
      addresses: updatedUser.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: "❌ Server error", error });
  }
};

// Update Address
export const updateAddress = async (req: Request, res: Response) => {
  try {
    const {
      Name,
      addressLine,
      city,
      province,
      postalCode,
      country,
      label,
      phone,
    } = req.body;
    const userId = req.user?.userId;
    const addressId = req.params.addressId;

    if (
      !Name ||
      !label ||
      !addressLine ||
      !city ||
      !province ||
      !postalCode ||
      !country ||
      !phone
    ) {
      res.status(400).json({ message: "❌ Please provide all address fields" });
      return;
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, "addresses._id": addressId },
      {
        $set: {
          "addresses.$": {
            _id: addressId,
            Name,
            label,
            addressLine,
            city,
            province,
            postalCode,
            country,
            phone,
          },
        },
      },
      { new: true }
    ).select("addresses");

    if (!updatedUser) {
      res.status(404).json({ message: "User or address not found" });
      return;
    }

    res.status(200).json({
      message: "✅ Address updated successfully",
      addresses: updatedUser.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: "❌ Server error", error });
  }
};

// Delete Address
export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const addressId = req.params.addressId;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    ).select("addresses");

    if (!updatedUser) {
      res.status(404).json({ message: "User or address not found" });
      return;
    }

    res.status(200).json({
      message: "✅ Address deleted successfully",
      addresses: updatedUser.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: "❌ Server error", error });
  }
};

// Get all customers (Admin only)
export const getAllCustomers = async (
  _req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const customers = await User.find({ role: "customer" }).select("-password");
    res.status(200).json({ customers });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Subscribe to newsletter
export const subscribeNewsletter = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const userId = req.user?.userId; // ต้องมี verifyToken middleware

    if (!userId) {
      res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อน" });
      return;
    }

    if (!email) {
      res.status(400).json({ message: "กรุณาระบุอีเมล" });
      return;
    }

    // ✅ ตรวจสอบว่าเคยสมัครแล้วหรือยัง
    const existing = await Member.findOne({ userId });
    if (existing) {
      res.status(409).json({ message: "คุณสมัครรับข่าวสารแล้ว" });
      return;
    }

    // ✅ สมัครใหม่
    const newMember = new Member({
      userId: new mongoose.Types.ObjectId(userId),
      email,
    });
    await newMember.save();

    res.status(201).json({ message: "สมัครรับข่าวสารสำเร็จ" });
  } catch (error) {
    console.error("สมัครสมาชิกล้มเหลว:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error });
  }
};

// 🧠 Admin Only
export const getAllNewsletterMembers = async (req: Request, res: Response) => {
  try {
    const role = req.user?.role;
    if (role !== "admin") {
      res.status(403).json({ message: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้" });
      return;
    }

    const members = await Member.find()
      .populate("userId", "firstName lastName email avatar role ") // แสดงเฉพาะบาง field
      .sort({ subscribedAt: -1 }); // เรียงจากล่าสุด

    res.status(200).json({ members });
  } catch (error) {
    console.error("ไม่สามารถดึงรายชื่อสมาชิกได้:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error });
  }
};
