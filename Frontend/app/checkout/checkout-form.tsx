"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createOrder } from "@/actions/order-actions";
import { formatPrice } from "@/lib/utils";
import {
  ShoppingCart,
  MapPinHouse,
  Package,
  Banknote,
  X,
  QrCode,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { getBaseUrl } from "@/lib/api";

export function CheckoutForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(50);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const modalRef = useRef<HTMLDialogElement>(null);
  const [addressList, setAddressList] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );

  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "qr">("online");
  // ✅ แก้ชื่อ field ให้ตรง backend 100%
  const [shippingInfo, setShippingInfo] = useState({
    Name: "",
    label: "",
    addressLine: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Thailand",
    phone: "",
  });

  // โหลด checkout summary
  useEffect(() => {
    axios
      .get(`${getBaseUrl()}/api/order/checkoutSummary`, {
        withCredentials: true,
      })
      .then((res) => {
        setCheckoutItems(res.data.items);
        setSubtotal(res.data.subtotal);
        setShipping(res.data.shipping);
        setTotal(res.data.total);
      })
      .catch((err) => {
        console.error("❌ Failed to load checkout summary:", err);
        router.push("/cart");
      })
      .finally(() => setLoading(false));
  }, [router]);

  // โหลด address list
  useEffect(() => {
    axios
      .get(`${getBaseUrl()}/api/user/getAddress`, {
        withCredentials: true,
      })
      .then((res) => {
        setAddressList(res.data.addresses || []);
        if (res.data.addresses.length > 0) {
          const defaultAddr = res.data.addresses[0];
          setSelectedAddressId(defaultAddr._id);
          setShippingInfo({
            Name: defaultAddr.Name,
            label: defaultAddr.label,
            addressLine: defaultAddr.addressLine,
            city: defaultAddr.city,
            province: defaultAddr.province,
            postalCode: defaultAddr.postalCode,
            country: defaultAddr.country,
            phone: defaultAddr.phone,
          });
        }
      })
      .catch((err) => {
        console.error("❌ Failed to load addresses:", err);
      });
  }, []);

  const handleSaveShipping = () => {
    if (selectedAddressId) {
      axios
        .patch(
          `${getBaseUrl()}/api/user/updateAddress/${selectedAddressId}`,
          {
            Name: shippingInfo.Name,
            label: shippingInfo.label,
            addressLine: shippingInfo.addressLine,
            city: shippingInfo.city,
            province: shippingInfo.province,
            postalCode: shippingInfo.postalCode,
            country: shippingInfo.country,
            phone: shippingInfo.phone,
          },
          { withCredentials: true }
        )
        .then(() => {
          toast({
            title: "✅ แก้ไขที่อยู่เรียบร้อยแล้ว",
            description: "กรุณาเลือกที่อยู่เพื่อทำการสั่งซื้อ",
            duration: 3000,
          });
          window.location.reload();
        })
        .catch(() =>
          toast({
            title: "❌ แก้ไขที่อยู่ล้มเหลว",
            description: "กรุณาลองใหม่อีกครั้ง",
            duration: 3000,
          })
        );
    } else {
      axios
        .post(
          `${getBaseUrl()}/api/user/addAddress`,
          {
            Name: shippingInfo.Name,
            label: shippingInfo.label,
            addressLine: shippingInfo.addressLine,
            city: shippingInfo.city,
            province: shippingInfo.province,
            postalCode: shippingInfo.postalCode,
            country: shippingInfo.country,
            phone: shippingInfo.phone,
          },
          { withCredentials: true }
        )
        .then(() => {
          toast({
            title: "✅ เพิ่มที่อยู่เรียบร้อยแล้ว",
            description: "กรุณาเลือกที่อยู่เพื่อทำการสั่งซื้อ",
            duration: 3000,
          });
          window.location.reload();
        })
        .catch(() => alert("❌ เพิ่มที่อยู่ล้มเหลว"));
    }
    modalRef.current?.close();
  };

  // const handlePlaceOrder = async () => {
  //   setIsSubmitting(true);
  //   setError(null);

  //   try {
  //     const formattedItems = checkoutItems.map((item) => ({
  //       productId: item.productId || item._id || item.id_product,
  //       name: item.name,
  //       size: item.size,
  //       quantity: item.quantity,
  //       priceAtPurchase: item.priceAtAdded, // mapping ตรงนี้สำคัญ!
  //       images: item.images || [],
  //     }));

  //     const orderData = {
  //       items: formattedItems,
  //       subtotal,
  //       shipping,
  //       total,
  //       shippingInfo: {
  //         Name: shippingInfo.Name, // ✅
  //         label: shippingInfo.label,
  //         addressLine: shippingInfo.addressLine, // ✅
  //         city: shippingInfo.city,
  //         province: shippingInfo.province, // ✅
  //         postalCode: shippingInfo.postalCode, // ✅
  //         country: shippingInfo.country,
  //         phone: shippingInfo.phone,
  //       },
  //       paymentMethod,
  //     };

  //     const result = await createOrder(orderData);

  //     if (result.success) {
  //       router.push(`/payment?orderId=${result.orderId}`);
  //     } else {
  //       setError(result.error || "เกิดข้อผิดพลาด กรุณาลองใหม่");
  //       setIsSubmitting(false);
  //     }
  //   } catch (err) {
  //     console.error("Error placing order:", err);
  //     setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
  //     setIsSubmitting(false);
  //   }
  // };

  const handleConfirmPayment = async () => {
    if (paymentMethod === "online" && !slipFile) {
      toast({
        title: "❌ กรุณาแนบสลิปก่อนยืนยันการชำระเงิน",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formattedItems = checkoutItems.map((item) => ({
        productId: item.productId || item._id || item.id_product,
        name: item.name,
        size: item.size,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtAdded,
        images: item.images || [],
      }));

      // 👉 1️⃣ สร้าง Order ก่อน
      const orderRes = await createOrder({
        items: formattedItems,
        subtotal,
        shipping,
        total,
        shippingInfo: {
          Name: shippingInfo.Name,
          label: shippingInfo.label,
          addressLine: shippingInfo.addressLine,
          city: shippingInfo.city,
          province: shippingInfo.province,
          postalCode: shippingInfo.postalCode,
          country: shippingInfo.country,
          phone: shippingInfo.phone,
        },
        paymentMethod,
      });

      if (!orderRes.success) {
        toast({
          title: "❌ สร้างคำสั่งซื้อไม่สำเร็จ",
          description: orderRes.error || "เกิดข้อผิดพลาด กรุณาลองใหม่",
        });
        setIsSubmitting(false);
        return;
      }

      const orderId = orderRes.orderId;

      // 👉 2️⃣ อัปโหลดสลิปถ้าเป็นการโอน
      if (paymentMethod === "online" && slipFile) {
        const formData = new FormData();
        formData.append("slip", slipFile);

        await axios.post(
          `${getBaseUrl()}/api/order/uploadSlip/${orderId}`,
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }

      toast({
        title: "✅ สั่งซื้อสําเร็จ!",
        description: "ระบบได้รับคำสั่งซื้อและอยู่ระหว่างดําเนินการ",
        duration: 3000,
      });

      router.push(`/order-confirmation?orderId=${orderId}`);
    } catch (err) {
      console.error("Error confirming payment:", err);
      toast({
        title: "❌ เกิดข้อผิดพลาด กรุณาลองใหม่",
      });
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">กำลังโหลด...</div>;
  }

  if (checkoutItems.length === 0) {
    return <div className="text-center py-12">ไม่มีสินค้าในตะกร้า</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="flex items-center gap-2 text-3xl font-display font-medium text-brown-800 mb-8">
        <ShoppingCart className="w-8 h-8 text-yellow-500" />
        ทำการสั่งซื้อ
      </h1>

      {/* MODAL เพิ่ม/แก้ไขที่อยู่ */}
      <dialog
        ref={modalRef}
        className="rounded-lg p-6 w-full max-w-3xl z-50 bg-white shadow-lg"
      >
        <button
          className="absolute top-5 right-5 text-gray-500 hover:text-red-500"
          onClick={() => modalRef.current?.close()}
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="flex gap-2 text-lg font-semibold mb-4 text-brown-800">
          <MapPinHouse className="w-6 h-6 text-yellow-500" />
          {selectedAddressId ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่ใหม่"}
        </h2>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="ชือผู้รับ"
            value={shippingInfo.Name}
            onChange={(e) =>
              setShippingInfo({ ...shippingInfo, Name: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="tel"
            placeholder="เบอร์ติดต่อ"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            value={shippingInfo.phone}
            onChange={(e) => {
              const onlyNumbers = e.target.value
                .replace(/\D/g, "")
                .slice(0, 10);
              setShippingInfo({ ...shippingInfo, phone: onlyNumbers });
            }}
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="text"
            placeholder="สถานที่ บ้าน / บริษัท / โรงงาน "
            value={shippingInfo.label}
            onChange={(e) =>
              setShippingInfo({ ...shippingInfo, label: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="ที่อยู่"
            value={shippingInfo.addressLine}
            onChange={(e) =>
              setShippingInfo({ ...shippingInfo, addressLine: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="เขต/อำเภอ"
            value={shippingInfo.city}
            onChange={(e) =>
              setShippingInfo({ ...shippingInfo, city: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="จังหวัด"
            value={shippingInfo.province}
            onChange={(e) =>
              setShippingInfo({ ...shippingInfo, province: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="รหัสไปรษณีย์"
            value={shippingInfo.postalCode}
            onChange={(e) =>
              setShippingInfo({ ...shippingInfo, postalCode: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          onClick={handleSaveShipping}
          className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded"
        >
          บันทึก
        </button>
      </dialog>

      {/* ส่วนแสดงที่อยู่ */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="flex gap-2 text-lg font-semibold text-brown-800 items-center">
            <MapPinHouse className="w-6 h-6 text-yellow-500" />
            ที่อยู่จัดส่ง
          </h2>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-4 py-2 rounded"
            onClick={() => {
              setSelectedAddressId(null);
              setShippingInfo({
                Name: "",
                label: "",
                addressLine: "",
                city: "",
                province: "",
                postalCode: "",
                country: "Thailand",
                phone: "",
              });
              modalRef.current?.showModal();
            }}
          >
            เพิ่มที่อยู่ใหม่
          </button>
        </div>

        {addressList.length > 0 ? (
          <>
            <select
              value={selectedAddressId || ""}
              onChange={(e) => {
                const addr = addressList.find((a) => a._id === e.target.value);
                if (addr) {
                  setSelectedAddressId(addr._id);
                  setShippingInfo({
                    Name: addr.Name,
                    label: addr.label,
                    addressLine: addr.addressLine,
                    city: addr.city,
                    province: addr.province,
                    postalCode: addr.postalCode,
                    country: addr.country,
                    phone: addr.phone,
                  });
                }
              }}
              className="w-full border rounded px-3 py-2 mb-2"
            >
              {addressList.map((addr) => (
                <option key={addr._id} value={addr._id}>
                  ชื่อผู้รับ : {addr.Name} บ้านเลขที่ : {addr.addressLine} ,{" "}
                  {addr.city} , {addr.province} {addr.postalCode}
                </option>
              ))}
            </select>
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-4 py-2 rounded"
              onClick={() => modalRef.current?.showModal()}
            >
              แก้ไขที่อยู่นี้
            </button>
          </>
        ) : (
          <p className="text-red-500 text-sm">
            ⚠ กรุณาเพิ่มที่อยู่จัดส่งก่อนทำการสั่งซื้อ
          </p>
        )}
      </div>

      {/* รายการสินค้า */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-2 text-brown-800">
          <Package className="w-5 h-5 text-yellow-500" />
          สินค้าที่สั่งซื้อแล้ว
        </h2>
        {checkoutItems.map((item, index) => (
          <div
            key={item._id?.toString() || item.id_product || index}
            className="flex items-center justify-between py-2 border-b"
          >
            <div className="flex items-center">
              <Image
                src={
                  item.images?.[0]
                    ? `${getBaseUrl()}${item.images[0]}`
                    : "/placeholder.svg"
                }
                alt={item.name}
                width={24}
                height={24}
                className="object-cover mr-4 w-[80px] h-[80px]"
                priority
              />
              <div>
                <p className="font-medium text-brown-800">{item.name}</p>
                <p className="text-sm text-gray-500">
                  ขนาด: {item.size} | จำนวน: {item.quantity}
                </p>
              </div>
            </div>
            <p className="font-medium">
              {formatPrice(item.priceAtAdded * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* สรุปยอดสั่งซื้อ */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-brown-800">ราคารวมสินค้า</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-brown-800">ค่าจัดส่ง</span>
          <span>{formatPrice(shipping)}</span>
        </div>
        <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
          <div className="flex items-center gap-2 text-brown-800">
            <Banknote className="w-6 h-6 text-yellow-500" />
            ยอดชำระทั้งหมด
          </div>
          <span className="text-red-500">{formatPrice(total)}</span>
        </div>
      </div>
      {/* วิธีการชำระเงิน */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="text-lg font-semibold text-brown-800 mb-4 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-yellow-500" />
          เลือกวิธีการชำระเงิน
        </h2>

        <div className="flex gap-4 mb-4">
          <button
            className={`flex-1 px-4 py-2 rounded-lg transition ${
              paymentMethod === "online"
                ? "bg-yellow-500 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setPaymentMethod("online")}
          >
            โอนผ่านบัญชีธนาคาร
          </button>
          <button
            className={`flex-1 px-4 py-2 rounded-lg transition ${
              paymentMethod === "qr"
                ? "bg-yellow-500 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setPaymentMethod("qr")}
          >
            สแกน QR Code
          </button>
        </div>

        {paymentMethod === "online" ? (
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <p className="font-medium">ธนาคารไทยพาณิชย์</p>
              <p>
                เลขบัญชี: <span className="font-medium">123-456-7890</span>
              </p>
              <p>
                ชื่อบัญชี:{" "}
                <span className="font-medium">บริษัท เบญจภัณฑ์๕ จำกัด</span>
              </p>
              <p className="text-gray-500 text-xs">
                หลังโอนเสร็จ กรุณาแนบสลิปแล้วกด “ยืนยันการชำระเงิน”
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                แนบสลิปการโอนเงิน
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setSlipFile(e.target.files[0]);
                  }
                }}
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-center">
            <Image
              src="/qrcode-sample.png"
              alt="QR Code"
              width={160}
              height={160}
              className="mx-auto"
            />
            <p className="text-gray-500 text-xs">
              หลังสแกนเสร็จ กรุณากด “ยืนยันการชำระเงิน”
            </p>
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <Button
          onClick={() => router.push("/cart")}
          className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded text-lg font-semibold"
          disabled={isSubmitting}
        >
          ยกเลิก
        </Button>
        <Button
          onClick={handleConfirmPayment}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded text-lg font-semibold"
          disabled={isSubmitting || !selectedAddressId}
        >
          {isSubmitting ? "กำลังประมวลผล..." : "ยืนยันการชำระเงิน"}
        </Button>
      </div>
    </div>
  );
}
