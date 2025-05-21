import express from "express";
import {
  createContact,
  createContactByMember,
  getAllContacts,
  markContactAsRead,
  deleteContact,
  getUnreadContactCount
} from "../controllers/contact.controller";
import { verifyToken } from "../middlewares/verifyToken";
import { verifyAdmin } from "../middlewares/verifyAdmin";

const contact = express.Router();

// สำหรับผู้ใช้ทั่วไปที่ไม่ต้องล็อคอิน
contact.post("/createContact", createContact);
// สำหรับสมาชิกที่ล็อคอินแล้ว
contact.post("/createContactByMember", verifyToken, createContactByMember); // สำหรับสมาชิกที่ล็อคอินแล้ว

// สำหรับแอดมินที่ล็อคอินแล้ว
contact.get("/getAllContacts", verifyToken, verifyAdmin, getAllContacts); // สำหรับแอดมินไว้ดึงข้อมูลการติดต่อทั้งหมด
contact.patch("/markContactAsRead/:id", verifyToken, verifyAdmin, markContactAsRead); // สำหรับแอดมินไว้อ่านแล้ว
contact.delete("/deleteContact/:id", verifyToken, verifyAdmin, deleteContact);

contact.get("/getUnreadContactCount", verifyToken, verifyAdmin, getUnreadContactCount);

export default contact;
