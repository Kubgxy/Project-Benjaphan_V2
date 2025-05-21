import express from "express";
import {
  selectItemsForCheckout,
  getCheckoutSummary,
  createOrder,
  getOrderById,
  uploadSlip,
  cancelOrder,
  getOrdersByUser,
  getAllOrders,
  updateOrderStatus,
  getPendingOrderCount,
  getMonthlyRevenue,
  getRevenueByCategory,
} from "../controllers/order.controller";
import { verifyToken } from "../middlewares/verifyToken";
import { verifyAdmin } from "../middlewares/verifyAdmin";

import { slipUpload } from "../middlewares/slipUpload.middleware";

const order = express.Router();

// POST /api/order/selectItems
order.post("/selectItems", verifyToken, selectItemsForCheckout);
// GET /api/order/checkoutSummary
order.get("/checkoutSummary", verifyToken, getCheckoutSummary);

// POST /api/order/createOrder
order.post("/createOrder", verifyToken, createOrder);
// GET /api/order/getOrderById/:id
order.get("/getOrderById/:id", verifyToken, getOrderById);
// GET /api/order/getOrdersByUser
order.get("/getOrdersByUser", verifyToken, getOrdersByUser);

// POST /api/order/uploadSlip/:orderId
order.post(
  "/uploadSlip/:orderId",
  verifyToken,
  slipUpload.single("slip"), // ✅ ชื่อ field ที่ Frontend ส่งมาต้องเป็น 'slip'
  uploadSlip
);

// PATCH /api/order/cancel/:orderId
order.patch("/cancelOrder/:orderId", verifyToken, cancelOrder);

// GET /api/order/getAllOrders
order.get("/getAllOrders", verifyToken, verifyAdmin, getAllOrders);

// PATCH /api/order/updateStatus/:orderId
order.patch("/updateStatus/:orderId", verifyToken, verifyAdmin, updateOrderStatus);

// GET /api/order/getPendingOrderCount
order.get("/getPendingOrderCount", verifyToken, verifyAdmin, getPendingOrderCount);

// GET /api/order/getMonthlyRevenue
order.get("/getMonthlyRevenue", verifyToken, verifyAdmin, getMonthlyRevenue);

// GET /api/order/getRevenueByCategory
order.get("/getRevenueByCategory", verifyToken, verifyAdmin, getRevenueByCategory);

export default order;
