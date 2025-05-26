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
  Save,
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

  // โหลดข้อมูล
  useEffect(() => {
    const fetchCheckoutSummary = async () => {
      try {
        const res = await axios.get(`${getBaseUrl()}/api/order/checkoutSummary`, {
          withCredentials: true,
        });
        setCheckoutItems(res.data.items);
        setSubtotal(res.data.subtotal);
        setShipping(res.data.shipping);
        setTotal(res.data.total);
      } catch (err) {
        console.error("❌ Failed to load checkout summary:", err);
        router.push("/cart");
      } finally {
        setLoading(false);
      }
    };

    const fetchAddressList = async () => {
      try {
        const res = await axios.get(`${getBaseUrl()}/api/user/getAddress`, {
          withCredentials: true,
        });
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
      } catch (error: any) {
        if (error.response?.status === 401) {
          return;
        }
        console.error("❌ Failed to load addresses:", error);
      }
    };

    fetchCheckoutSummary();
    fetchAddressList();
  }, [router]);

  const handleSaveShipping = async () => {
    try {
      if (selectedAddressId) {
        await axios.patch(
          `${getBaseUrl()}/api/user/updateAddress/${selectedAddressId}`,
          shippingInfo,
          { withCredentials: true }
        );
        toast({
          title: "✅ แก้ไขที่อยู่เรียบร้อยแล้ว",
          description: "กรุณาเลือกที่อยู่เพื่อทำการสั่งซื้อ",
          duration: 3000,
        });
      } else {
        await axios.post(
          `${getBaseUrl()}/api/user/addAddress`,
          shippingInfo,
          { withCredentials: true }
        );
        toast({
          title: "✅ เพิ่มที่อยู่เรียบร้อยแล้ว",
          description: "กรุณาเลือกที่อยู่เพื่อทำการสั่งซื้อ",
          duration: 3000,
        });
      }
      modalRef.current?.close();
      window.location.reload();
    } catch {
      toast({
        title: "❌ เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกที่อยู่ได้",
        duration: 3000,
      });
    }
  };

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

      const orderRes = await createOrder({
        items: formattedItems,
        subtotal,
        shipping,
        total,
        shippingInfo,
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
        className="rounded-lg p-6 w-full max-w-3xl z-50 bg-white shadow-xl mt-10"
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
          onClick={() => modalRef.current?.close()}
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="flex items-center gap-2 text-xl font-semibold mb-6 text-brown-800">
          <MapPinHouse className="w-6 h-6 text-yellow-500" />
          {selectedAddressId ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่ใหม่"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "ชื่อผู้รับ", value: shippingInfo.Name, key: "Name" },
            { label: "เบอร์ติดต่อ", value: shippingInfo.phone, key: "phone", type: "tel", maxLength: 10 },
            { label: "สถานที่ (บ้าน / บริษัท / โรงงาน)", value: shippingInfo.label, key: "label" },
            { label: "ที่อยู่", value: shippingInfo.addressLine, key: "addressLine" },
            { label: "เขต / อำเภอ", value: shippingInfo.city, key: "city" },
            { label: "จังหวัด", value: shippingInfo.province, key: "province" },
            { label: "รหัสไปรษณีย์", value: shippingInfo.postalCode, key: "postalCode", type: "number" },
          ].map(({ label, value, key, type = "text", maxLength }) => (
            <div key={key} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                maxLength={maxLength}
                value={value}
                onChange={(e) =>
                  setShippingInfo({
                    ...shippingInfo,
                    [key]: key === "phone" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value,
                  })
                }
                className="border rounded px-3 py-2 w-full focus:outline-yellow-500"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSaveShipping}
          className="mt-6 w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded flex items-center justify-center gap-2 font-semibold"
        >
          <Save className="w-5 h-5" />
          บันทึกที่อยู่
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
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-lg font-semibold text-brown-800 mb-4 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-yellow-500" />
          เลือกวิธีการชำระเงิน
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            className={`border rounded-lg p-4 transition shadow-sm ${
              paymentMethod === "online"
                ? "bg-yellow-100 border-yellow-500"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
            onClick={() => setPaymentMethod("online")}
          >
            <div className="flex items-center gap-3">
              <Banknote className="w-6 h-6 text-yellow-500" />
              โอนผ่านบัญชีธนาคาร
            </div>
          </button>
          <button
            className={`border rounded-lg p-4 transition shadow-sm ${
              paymentMethod === "qr"
                ? "bg-yellow-100 border-yellow-500"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
            onClick={() => setPaymentMethod("qr")}
          >
            <div className="flex items-center gap-3">
              <QrCode className="w-6 h-6 text-yellow-500" />
              สแกน QR Code
            </div>
          </button>
        </div>

        {paymentMethod === "online" ? (
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <p className="font-medium text-brown-800">ธนาคารไทยพาณิชย์</p>
              <p>เลขบัญชี: <span className="font-medium">123-456-7890</span></p>
              <p>ชื่อบัญชี: <span className="font-medium">บริษัท เบญจภัณฑ์๕ จำกัด</span></p>
              <p className="text-gray-500 text-xs mt-1">แนบสลิปแล้วกด “ยืนยันการชำระเงิน”</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                แนบสลิปการโอนเงิน
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.length) setSlipFile(e.target.files[0]);
                }}
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-yellow-500 file:text-white file:font-semibold hover:file:bg-yellow-600"
              />
            </div>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <Image
              src="/qrcode-sample.png"
              alt="QR Code"
              width={160}
              height={160}
              className="mx-auto rounded shadow"
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
