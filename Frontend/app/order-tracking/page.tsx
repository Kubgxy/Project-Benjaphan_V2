"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Check, Package, Truck, Home, Copy } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { getOrderById } from "@/actions/order-actions";
import { formatPrice } from "@/lib/utils";
import Swal from "sweetalert2";
import { getBaseUrl } from "@/lib/api";

export default function OrderTrackingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams?.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ คำนวณราคารวมสินค้า (subtotal)
  const subtotal =
    order?.items?.reduce(
      (sum: number, item: any) => sum + item.priceAtPurchase * item.quantity,
      0
    ) || 0;

  const shippingFee = order?.total ? order.total - subtotal : 50;

  // ✅ แปลงสถานะเป็น Step
  const getTrackingSteps = (status: string) => {
    const steps = [
      { name: "ยืนยันคำสั่งซื้อ", icon: Check },
      { name: "กำลังเตรียมสินค้า", icon: Package },
      { name: "กำลังจัดส่ง", icon: Truck },
      { name: "จัดส่งเรียบร้อยแล้ว", icon: Home },
    ];

    let currentStep = 0;
    switch (status) {
      case "pending":
        currentStep = 0;
        break;
      case "confirmed":
        currentStep = 1;
        break;
      case "shipped":
        currentStep = 2;
        break;
      case "delivered":
        currentStep = 3;
        break;
      default:
        currentStep = 0;
    }

    return steps.map((step, index) => ({
      ...step,
      status:
        index < currentStep
          ? "complete"
          : index === currentStep
          ? "current"
          : "upcoming",
    }));
  };

  useEffect(() => {
    async function fetchOrder() {
      if (orderId) {
        try {
          const res = await getOrderById(orderId);
          if (res?.success) {
            setOrder(res.order);
          }
        } catch (error) {
          console.error("Error fetching order:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  const handleCancelOrder = async () => {
    const result = await Swal.fire({
      title: "ยืนยันการยกเลิก",
      text: "คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อนี้?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ตกลง",
      cancelButtonText: "ยกเลิก",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(
        `${getBaseUrl()}/api/order/cancelOrder/${orderId}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success) {
        Swal.fire("สำเร็จ!", "คำสั่งซื้อถูกยกเลิกแล้ว", "success");
        window.location.reload();
      } else {
        Swal.fire("ผิดพลาด", data.message || "ไม่สามารถยกเลิกได้", "error");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      Swal.fire("ผิดพลาด", "เกิดข้อผิดพลาด กรุณาลองใหม่", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="w-16 h-16 border-4 border-gold-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order information...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!orderId || !order) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-display font-medium text-gray-900 mb-4">
            ไม่พบคำสั่งซื้อ
          </h1>
          <p className="text-gray-600 mb-8">
            เราไม่พบคำสั่งซื้อที่คุณกำลังค้นหา กรุณาตรวจสอบอีกครั้ง
          </p>
          <Button variant="luxury" asChild>
            <Link href="/">กลับสู่หน้าหลัก</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const steps = getTrackingSteps(order.orderStatus);

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container max-w-screen-lg mx-auto px-4 py-10">
        <h1 className="text-2xl sm:text-3xl font-display font-medium text-brown-800 mb-8 text-center sm:text-left">
          ติดตามคำสั่งซื้อ
        </h1>

        <>
          {order.orderStatus === "cancelled" ? (
            // ✅ กรณียกเลิกคำสั่งซื้อ
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="w-24 h-24 rounded-full flex items-center justify-center bg-red-500/80 text-white shadow-lg">
                <span className="text-4xl font-bold">✖</span>
              </div>
              <h2 className="text-xl font-bold text-red-500 mt-4">
                คำสั่งซื้อถูกยกเลิกแล้ว
              </h2>
            </div>
          ) : order.orderStatus === "delivered" ? (
            // ✅ กรณีจัดส่งสำเร็จแล้ว
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="w-24 h-24 rounded-full flex items-center justify-center bg-green-500 text-white shadow-lg">
                <Check className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-green-500 mt-4">
                จัดส่งเรียบร้อยแล้ว
              </h2>
            </div>
          ) : (
            <>
              {/* ✅ Tracking Steps Responsive */}
              <div className="hidden sm:flex items-center justify-center mb-8">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex items-center justify-center w-24 h-24 rounded-full
                  ${
                    step.status === "complete"
                      ? "bg-green-500 text-white"
                      : step.status === "current" &&
                        order.orderStatus === "delivered"
                      ? "bg-green-500 text-white"
                      : step.status === "current"
                      ? "bg-gold-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                      >
                        <step.icon className="w-10 h-10" />
                      </div>
                      <p className="text-sm mt-2 text-center w-24">
                        {step.name}
                      </p>
                      {step.status === "current" &&
                        order.orderStatus !== "delivered" && (
                          <p className="text-xs text-gold-600 mt-1">
                            กำลังดำเนินการ
                          </p>
                        )}
                    </div>

                    {/* เส้นเชื่อม */}
                    {index < steps.length - 1 && (
                      <div className="w-16 h-1 bg-gray-200 mx-2"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* ✅ แสดงแค่ขั้นตอนปัจจุบันบน Mobile */}
              <div className="flex sm:hidden justify-center mb-8">
                {steps
                  .filter((step) => step.status === "current")
                  .map((step, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center ${
                          order.orderStatus === "delivered"
                            ? "bg-green-500 text-white"
                            : "bg-gold-600 text-white"
                        }`}
                      >
                        <step.icon className="w-10 h-10" />
                      </div>

                      <p className="text-sm mt-2 text-center w-24">
                        {step.name}
                      </p>
                      {order.orderStatus !== "delivered" && (
                        <p className="text-xs text-gold-600 mt-1">
                          กำลังดำเนินการ
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </>
          )}
        </>

        <div className="md:col-span-2">
          {/* ✅ ข้อมูลคำสั่งซื้อ */}
          <div className="bg-[#fdfaf5] rounded-xl p-6 shadow mb-6 border border-gold-200">
            <h3 className="text-lg font-semibold text-gold-800 mb-2">
              📦 เลขคำสั่งซื้อ:{" "}
              <span className="text-gray-500  font-semibold">{order._id}</span>
            </h3>
            <p className="text-sm text-gray-700">
              📅 วันที่สั่งซื้อ:{" "}
              {new Date(order.createdAt).toLocaleDateString("th-TH")}
            </p>
            <p className="text-sm text-gray-700">
              💳 การชำระเงิน: {order.payment?.method} | สถานะ:{" "}
              <span className="capitalize">{order.payment?.status}</span>
            </p>
          </div>

          {/* ✅ ข้อมูลที่อยู่ */}
          <div className="bg-[#fdfaf5] rounded-xl p-6 shadow mb-6 border border-gold-200">
            <h3 className="text-lg font-semibold text-gold-800 mb-2">
              📍 ที่อยู่จัดส่ง
            </h3>
            <p className="text-sm text-gray-700">
              <strong>ชื่อผู้รับ:</strong> {order.shippingInfo.Name}
            </p>
            <p className="text-sm text-gray-700">
              <strong>เบอร์โทร:</strong>{" "}
              {order.shippingInfo.phone || "ไม่พบข้อมูล"}
            </p>
            <p className="text-sm text-gray-700">
              <strong>ที่อยู่:</strong> {order.shippingInfo.addressLine},{" "}
              {order.shippingInfo.city}, {order.shippingInfo.province},{" "}
              {order.shippingInfo.postalCode}, {order.shippingInfo.country}
            </p>
          </div>

          {order.deliveryTracking?.trackingNumber && (
            <div className="bg-[#fdfaf5] rounded-xl p-6 shadow mb-6 border border-gold-200">
              <h3 className="text-lg font-semibold text-gold-800 mb-2">
                🚚 ข้อมูลการจัดส่งพัสดุ
              </h3>
              <p className="text-sm text-gray-700">
                <strong>บริษัทขนส่ง:</strong> {order.deliveryTracking.carrier}
              </p>
              <p className="text-sm mt-2 text-gray-700">
                <strong>เลขพัสดุ:</strong>{" "}
                <span className="font-bold text-lg text-green-600 mr-4">
                  {order.deliveryTracking.trackingNumber}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      order.deliveryTracking.trackingNumber
                    );
                    // แจ้งเตือนแบบ toast หรือ alert
                    Swal.fire({
                      toast: true,
                      icon: "success",
                      title: "คัดลอกเลขพัสดุแล้ว",
                      position:
                        window.innerWidth < 640 ? "bottom" : "bottom-end", // 💡 ปรับตำแหน่งตามขนาดจอ
                      showConfirmButton: false,
                      timer: 1500,
                      customClass: {
                        popup: "rounded-lg text-sm px-4 py-2",
                        title: "text-green-800 font-semibold",
                      },
                    });
                  }}
                  className="bg-yellow-300 p-2 rounded-lg text-white  hover:text-black-600 hover:scale-105 hover:bg-yellow-600 transition"
                  title="คัดลอกเลขพัสดุ"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </p>
            </div>
          )}

          {/* ✅ รายการสินค้า */}
          <div className="bg-[#fdfaf5] rounded-xl p-6 shadow border border-gold-200">
            <h3 className="text-lg font-semibold text-gold-800 mb-4">
              🛒 สินค้าที่สั่งซื้อ
            </h3>
            {order.items.map((item: any, index: number) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 border-b pb-4"
              >
                <div className="relative w-full sm:w-[200px] h-[250px] sm:h-[150px] rounded border overflow-hidden">
                  <Image
                    src={`${getBaseUrl()}${item.images[0]}`}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="font-medium text-gray-800">{item.name}</h4>
                  <p className="text-sm text-gray-600">
                    จำนวน: {item.quantity} | ไซส์: {item.size}
                  </p>
                </div>
                <div className="text-right font-semibold text-gray-900">
                  {formatPrice(item.priceAtPurchase * item.quantity)} บาท
                </div>
              </div>
            ))}

            {/* ✅ สรุปยอดรวม */}
            <div className="border-t pt-4 mt-4 space-y-1 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>ราคารวมสินค้า:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>ค่าจัดส่ง:</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg text-gold-800 pt-2 border-t">
                <span>ยอดรวมทั้งหมด:</span>
                <span>{formatPrice(order.total)} บาท</span>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`flex gap-4 mt-4 ${
            order.orderStatus !== "pending" ? "justify-end" : ""
          }`}
        >
          {/* ✅ เงื่อนไขแสดงปุ่มเฉพาะตอน pending */}
          {order.orderStatus === "pending" && (
            <Button
              onClick={handleCancelOrder}
              className="flex-1 bg-gray-300 hover:bg-gray-600 text-white py-3 rounded-lg text-lg font-semibold shadow-md transition"
              disabled={isSubmitting}
            >
              ยกเลิกคำสั่งซื้อ
            </Button>
          )}

          <Button
            className={`${
              order.orderStatus === "pending" ? "flex-1" : ""
            } bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow-md transition`}
          >
            <Link href="/product">เลือกซื้อสินค้าต่อ</Link>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
