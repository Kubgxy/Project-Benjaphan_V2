import { Request, Response, RequestHandler } from "express";
import mongoose from "mongoose";
import { Types } from "mongoose";
import Cart from "../Models_GPT/Cart";
import Order from "../Models_GPT/Order";
import Notification from "../Models_GPT/Notification";

// ✅ POST /api/order/selectItems
export const selectItemsForCheckout = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: "❌ No items provided" });
      return;
    }

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $set: { items } }, // อัปเดต array ทั้งชุดที่เลือก
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "✅ Selected items saved for checkout",
      cart,
    });
  } catch (error) {
    console.error("❌ Error selecting items for checkout:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ GET /api/order/checkoutSummary
export const getCheckoutSummary = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      res.status(404).json({ message: "❌ No items found for checkout" });
      return;
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + (item.priceAtAdded || 0) * item.quantity,
      0
    );

    const shipping = 50; // หรือ logic คำนวณจริง
    const total = subtotal + shipping;

    res.status(200).json({
      success: true,
      message: "✅ Checkout summary retrieved",
      items: cart.items,
      subtotal,
      shipping,
      total,
    });
  } catch (error) {
    console.error("❌ Error fetching checkout summary:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ POST /api/createOrder
export const createOrder = async (req: Request, res: Response) => {
  const userId = req.user?.userId; // <-- ดึงจาก Auth middleware

  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const { items, shippingInfo, total, couponApplied, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    res.status(400).json({ success: false, message: "No items provided" });
    return;
  }

  try {
    // ✅ Validate ข้อมูลสินค้าเบื้องต้น (optional)
    const formattedItems = items.map((item: any) => ({
      productId: new mongoose.Types.ObjectId(item.productId),
      name: item.name,
      size: item.size,
      quantity: item.quantity,
      priceAtPurchase: item.priceAtPurchase,
      images: item.images,
    }));

    // ✅ เตรียมออเดอร์ใหม่
    const newOrder = new Order({
      userId: new mongoose.Types.ObjectId(userId),
      items: formattedItems,
      shippingInfo: {
        Name: shippingInfo.Name,
        phone: shippingInfo.phone,
        label: shippingInfo.label,
        addressLine: shippingInfo.addressLine,
        city: shippingInfo.city,
        province: shippingInfo.province,
        postalCode: shippingInfo.postalCode,
        country: shippingInfo.country || "Thailand",
      },
      payment: {
        method: paymentMethod || "online", // ถ้า default ใช้ 'online'
        status: "pending",
      },
      orderStatus: "pending",
      couponApplied: couponApplied || null,
      total: total,
    });

    await newOrder.save();

    // ✅ เพิ่ม Notification ไปที่ DB
    await Notification.create({
      userId: userId,
      type: 'order',
      title: 'New Order Received',
      message: `Order #${newOrder._id.toString().slice(-6)} has been placed for ฿${total.toLocaleString()}.`,
      link: `/dashboard/orders`,
    });


    res.status(201).json({
      success: true,
      message: "Order created successfully",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Server error" });
    return;
  }
};

// ✅ GET /api/order/getOrderById/:id
  export const getOrderById = async (req: Request, res: Response) => {
    const userId = req.user?.userId; // <-- ดึงจาก Auth middleware
    const orderId = req.params.id;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!orderId) {
      res.status(400).json({ success: false, message: "Order ID is required" });
      return;
    }

    try {
      const order = await Order.findOne({
        _id: new Types.ObjectId(orderId),
        userId: new Types.ObjectId(userId),
      })
        .populate({
          path: "userId",
          select: "firstName lastName phoneNumber", // ✅ แก้ตรงนี้
        })

        .lean();

      if (!order) {
        res.status(404).json({ success: false, message: "Order not found" });
        return;
      }

      res.status(200).json({
        success: true,
        order,
      });
    } catch (error) {
      console.error("Error fetching order by ID:", error);
      res.status(500).json({ success: false, message: "Server error", error });
    }
  };

// ✅ GET /api/order/getOrdersByUser
export const getOrdersByUser: RequestHandler = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean(); // ✅ เรียงล่าสุดก่อน

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ POST /api/order/uploadSlip/:orderId
export const uploadSlip: RequestHandler = async (req, res) => {
  const { orderId } = req.params;
  const slipFile = req.file; // ✅ multer จัดการ file ให้อยู่ใน req.file

  if (!slipFile) {
    res.status(400).json({ success: false, message: "No slip file uploaded" });
    return;
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      console.log("[❌] Order not found:", orderId);
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    console.log("[✅] Found order:", order._id);
    console.log("[📂] File info:", slipFile);

    if (!order.payment) {
      order.payment = {
        method: "online",
        status: "pending",
        slipImage: `/uploads/slips/${slipFile.filename}`,
      };
    } else {
      order.payment.slipImage = `/uploads/slips/${slipFile.filename}`;
      order.payment.status = "pending";
    }

    await order.save();
    console.log("[✅] Order updated & saved");

    res.status(200).json({
      success: true,
      message: "Slip uploaded successfully",
      slipPath: order.payment.slipImage,
    });
  } catch (error) {
    console.error("Error uploading slip:", error); // 🔥 log error เต็ม ๆ
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ✅ PATCH /api/order/cancel/:orderId
export const cancelOrder: RequestHandler = async (req, res) => {
  const userId = req.user?.userId; // auth token
  const { orderId } = req.params;

  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    const order = await Order.findOne({
      _id: orderId,
      userId: userId, // ให้มั่นใจว่าเป็น order ของ user คนนั้นจริง ๆ
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    // ✅ อัปเดต status เป็น cancelled
    order.orderStatus = "cancelled";

    // 📝 (Optional) อัปเดต status payment ด้วย ถ้าอยาก reset
    if (order.payment) {
      order.payment.status = "failed"; // หรือจะไม่ทำก็ได้
    }

    await order.save();

    await Notification.create({
      userId: userId,
      type: 'cancel',
      title: 'Order Cancelled',
      message: `Order #${order._id.toString().slice(-6)} has been cancelled.`,
      link: `/dashboard/orders`,
    });

    res.status(200).json({
      success: true,
      message: "Order has been cancelled successfully",
      orderStatus: order.orderStatus,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ GET /api/admin/getAllOrders
export const getAllOrders: RequestHandler = async (_req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "userId",
        select: "firstName lastName email phoneNumber",
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ✅ PATCH /api/order/updateStatus/:orderId
export const updateOrderStatus = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { status, trackingNumber, carrier } = req.body;

  if (
    !["pending", "confirmed", "shipped", "delivered", "cancelled"].includes(
      status
    )
  ) {
    res.status(400).json({ success: false, message: "Invalid status" });
    return;
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      res
        .status(404)
        .json({ success: false, message: "Order not found" });
      return;
    }

    const validTransitions: Record<string, string[]> = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: [],
      cancelled: [],
    };

    const currentStatus = order.orderStatus;
    const nextValidStatuses = validTransitions[currentStatus];

    if (!nextValidStatuses || !nextValidStatuses.includes(status)) {
      res
        .status(400)
        .json({ success: false, message: "Invalid status transition" });
      return;
    }

    // ✅ เปลี่ยนสถานะหลัก
    order.orderStatus = status;

    // ✅ อัปเดตข้อมูลพัสดุถ้ามี
    if (status === "shipped" && trackingNumber && carrier) {
      order.deliveryTracking = {
        trackingNumber,
        carrier,
        status: "shipped",
      };
    }

    // ✅ จัดการ payment สัมพันธ์กัน
    if (!order.payment) {
      order.payment = { method: "online", status: "pending" };
    }

    if (status === "confirmed") {
      order.payment.status = "paid";
      order.payment.paidAt = new Date();
    } else if (status === "cancelled") {
      order.payment.status = "failed";
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
};


// controllers/orderController.ts
export const getPendingOrderCount = async (req: Request, res: Response) => {
  try {
    const count = await Order.countDocuments({ orderStatus: 'pending' });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err });
  }
};

export const getMonthlyRevenue = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ orderStatus: "delivered" });

    const summary = Array(12).fill(0); // สรุปรายได้ 12 เดือน

    for (const order of orders) {
      const month = new Date(order.createdAt).getMonth(); // 0 = Jan
      summary[month] += order.total;
    }

    const months = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
    ];

    const data = summary.map((value, index) => ({
      name: months[index],
      value,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error generating revenue summary:", error);
    res.status(500).json({ success: false, message: "ไม่สามารถสรุปยอดขายรายเดือนได้" });
  }
};

// ✅ API: รายได้ตามหมวดหมู่
export const getRevenueByCategory = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ orderStatus: "delivered" }).populate("items.productId");

    const categoryMap: Record<string, number> = {};

    const categoryNameMap: Record<string, string> = {
      bencharm: "น้ำหอม",
      chaloms: "ชะลอม",
      bracelets: "กำไลข้อมือ",
      jakkraphat: "พระบูชา",
    };

    for (const order of orders) {
      for (const item of order.items) {
        const product = item?.productId as any;

        if (!product) continue; // กันพัง

        const categoryCode = product.category || "unknown";
        const categoryName = categoryNameMap[categoryCode] || "ไม่ระบุหมวดหมู่";

        const price = item?.priceAtPurchase ?? 0;
        const quantity = item?.quantity ?? 0;
        const total = price * quantity;

        if (!categoryMap[categoryName]) categoryMap[categoryName] = 0;
        categoryMap[categoryName] += total;
      }
    }

    const result = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error calculating revenue by category:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
};



