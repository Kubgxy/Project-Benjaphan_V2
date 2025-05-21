import axios from "axios";
import { getBaseUrl } from "@/lib/api";

export async function createOrder(orderData: any) {
  try {
    const response = await axios.post(`${getBaseUrl()}/api/order/createOrder`, orderData, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ API createOrder error:", error);
    return { success: false, error: "Failed to create order." };
  }
}

export async function getOrderById(orderId: string) {
  try {
    const response = await axios.get(`${getBaseUrl()}/api/order/getOrderById/${orderId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("❌ API getOrderById error:", error);
    return { success: false, error: "Failed to fetch order." };
  }
}