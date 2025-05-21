import { Request, Response } from "express";
import Contact from "../Models_GPT/Contact";
import User from "../Models_GPT/User"; // ✅ โหลดโมเดล User
import Notification from "../Models_GPT/Notification";

// ✅ สำหรับผู้ใช้ทั่วไปที่ไม่ต้องล็อคอิน
export const createContact = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400).json({ message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" });
      return;
    }

    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
    });

    await newContact.save();

    await Notification.create({
      type: 'message',
      title: 'New Message from Guest',
      message: `${name} sent a message: "${subject}"`,
      link: '/dashboard/messages',
      isRead: false,
    });


    res.status(201).json({ message: "ส่งข้อความสำเร็จ ขอบคุณที่ติดต่อเรา!" });
    return;
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการส่งข้อความ" });
    return;
  }
};

// ✅ สำหรับสมาชิกที่ล็อคอินแล้ว
export const createContactByMember = async (req: Request, res: Response) => {
  try {
    const { subject, message } = req.body;

    // 🛑 ตรวจสอบว่ามี user (ต้องล็อคอิน)
    if (!req.user) {
      res.status(401).json({ message: "กรุณาล็อคอินก่อนส่งข้อความ" });
      return;
    }

    // ✅ ดึงข้อมูลจาก token
    const { userId } = req.user;

    // ✅ โหลดข้อมูลโปรไฟล์ของ user จากฐานข้อมูล
    const user = await User.findById(userId).select(
      "firstName lastName email phoneNumber"
    );

    if (!user) {
      res.status(404).json({ message: "ไม่พบข้อมูลผู้ใช้" });
      return;
    }

    if (!subject || !message) {
      res.status(400).json({ message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" });
      return;
    }

    const newContact = new Contact({
      userId: user._id, // ✅ เราบันทึกว่าใครส่ง
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phoneNumber,
      subject,
      message,
    });

    await newContact.save();

    await Notification.create({
      userId: user._id,
      type: 'message',
      title: 'New Message from Member',
      message: `${user.firstName} ${user.lastName} sent a message: "${subject}"`,
      link: '/dashboard/messages',
      isRead: false,
    });


    res.status(201).json({ message: "ส่งข้อความสำเร็จ ขอบคุณที่ติดต่อเรา!" });
    return;
  } catch (error) {
    console.error("❌ Error creating contact by member:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการส่งข้อความ" });
    return;
  }
};

// สำหรับแอดมินไว้ดึงข้อมูลการติดต่อทั้งหมด
export const getAllContacts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 7;
    const type = req.query.type as string; // 👈 ดึง type มาจาก query param

    const filter: any = {};

    if (type === "member") {
      filter.userId = { $exists: true }; // ✅ มี userId = คนมีบัญชี
    } else if (type === "guest") {
      filter.userId = { $exists: false }; // ✅ ไม่มี userId = บุคคลทั่วไป
    }

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Contact.countDocuments(filter);
    const totalUnread = await Contact.countDocuments({
      ...filter,
      isRead: false,
    });
    const totalRead = await Contact.countDocuments({ ...filter, isRead: true });
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      message: "ดึงข้อมูลการติดต่อทั้งหมดสำเร็จ",
      data: {
        contacts,
        totalPages,
        total,
        totalUnread,
        totalRead,
      },
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
};

// สำหรับแอดมินที่กดอ่านข้อความแล้ว
export const markContactAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!updatedContact) {
      res.status(404).json({ message: "ไม่พบข้อความ" });
      return;
    }

    res.status(200).json({
      message: "อัปเดตสถานะเป็นอ่านแล้วเรียบร้อย",
      data: updatedContact,
    });
  } catch (error) {
    console.error("Error updating contact status:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตสถานะ" });
  }
};

// สำหรับแอดมินทไว้ลบข้อความ
export const deleteContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      res.status(404).json({ message: "ไม่พบข้อความที่จะลบ" });
      return;
    }

    res.status(200).json({ message: "ลบข้อความสำเร็จแล้ว" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบข้อความ" });
  }
};

// ✅ ดึงจำนวนข้อความที่ยังไม่อ่าน
export const getUnreadContactCount = async (req: Request, res: Response) => {
  try {
    const count = await Contact.countDocuments({ isRead: false });
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
};

