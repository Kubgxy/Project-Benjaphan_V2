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
import {
  ShippingInfo,
  Address,
  District,
  Province,
  Zipcode,
  SubDistrict,
} from "@/lib/types";
import Swal from "sweetalert2";

const defaultShippingInfo: ShippingInfo = {
  Name: "",
  label: "",
  addressLine: "",
  subdistrict: "",
  district: "",
  province: "",
  postalCode: "",
  country: "Thailand",
  phone: "",
};

export function CheckoutForm() {
  const router = useRouter();
  const suggestRef = useRef<HTMLDivElement>(null);
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
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    Name: "",
    label: "",
    addressLine: "",
    subdistrict: "",
    district: "",
    province: "",
    postalCode: "",
    country: "Thailand",
    phone: "",
  });
  const [allAddresses, setAllAddresses] = useState<Address[]>([]);
  const [suggestions, setSuggestions] = useState<Address[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [checkoutBankInfo, setCheckoutBankInfo] = useState<{
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    qrImage?: string;
  }>({});
  const [isQRPreviewOpen, setIsQRPreviewOpen] = useState(false);

  useEffect(() => {
    const loadAddressData = async () => {
      try {
        const [districts, provinces, subDistricts, zipcodes] =
          await Promise.all([
            fetch("/data/districts.json").then((res) => res.json()) as Promise<
              District[]
            >,
            fetch("/data/provinces.json").then((res) => res.json()) as Promise<
              Province[]
            >,
            fetch("/data/subDistricts.json").then((res) =>
              res.json()
            ) as Promise<SubDistrict[]>,
            fetch("/data/zipcodes.json").then((res) => res.json()) as Promise<
              Zipcode[]
            >,
          ]);

        const merged: Address[] = subDistricts
          .map((sub) => {
            const district = districts.find(
              (d) => d.DISTRICT_ID === sub.DISTRICT_ID
            );
            const province = provinces.find(
              (p) => p.PROVINCE_ID === sub.PROVINCE_ID
            );
            const zip = zipcodes.find(
              (z) => z.SUB_DISTRICT_CODE === sub.SUB_DISTRICT_CODE
            );

            if (district && province && zip) {
              return {
                subdistrict: sub.SUB_DISTRICT_NAME,
                district: district.DISTRICT_NAME,
                province: province.PROVINCE_NAME,
                zipcode: zip.ZIPCODE,
              };
            }
            return null;
          })
          .filter((a): a is Address => a !== null);

        setAllAddresses(merged);
      } catch (err) {
        console.error("❌ โหลดข้อมูลที่อยู่ไม่สำเร็จ", err);
      }
    };

    loadAddressData();
  }, []);

  useEffect(() => {
    const fetchCheckoutContent = async () => {
      try {
        const res = await axios.get(`${getBaseUrl()}/api/setting/getCheckout`);
        const data = res.data.checkout;
        setCheckoutBankInfo(data); // สร้าง state ใหม่ไว้เก็บ
      } catch (err) {
        console.error("❌ โหลดข้อมูลบัญชีไม่สำเร็จ", err);
      }
    };

    fetchCheckoutContent();
  }, []);

  const fetchAddressList = async (preferredId?: string) => {
    try {
      const res = await axios.get(`${getBaseUrl()}/api/user/getAddress`, {
        withCredentials: true,
      });

      const addresses: any[] = res.data.addresses || [];
      setAddressList(addresses);

      // ✅ หา address ที่ match กับ preferredId
      let selected = addresses[0];
      if (preferredId) {
        const matched = addresses.find(
          (a) => a._id?.toString() === preferredId
        );
        if (matched) selected = matched;
      }

      if (selected) {
        setSelectedAddressId(selected._id?.toString() || null);
        setShippingInfo({
          _id: selected._id?.toString() || "",
          Name: selected.Name,
          label: selected.label,
          addressLine: selected.addressLine,
          subdistrict: selected.subdistrict,
          district: selected.district,
          province: selected.province,
          postalCode: selected.postalCode,
          country: selected.country,
          phone: selected.phone,
        });
      }
    } catch (error: any) {
      if (error.response?.status === 401) return;
      console.error("❌ Failed to load addresses:", error);
    }
  };

  useEffect(() => {
    const fetchCheckoutSummary = async () => {
      try {
        const res = await axios.get(
          `${getBaseUrl()}/api/order/checkoutSummary`,
          { withCredentials: true }
        );
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

    fetchCheckoutSummary();
    fetchAddressList();
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestRef.current &&
        !suggestRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSaveShipping = async () => {
    try {
      let res;

      if (selectedAddressId) {
        // แก้ไข
        res = await axios.patch(
          `${getBaseUrl()}/api/user/updateAddress/${selectedAddressId}`,
          shippingInfo,
          { withCredentials: true }
        );
        toast({ title: "✅ แก้ไขที่อยู่เรียบร้อยแล้ว", duration: 3000 });

        // แค่ reload ด้วย id เดิม
        fetchAddressList(selectedAddressId);
      } else {
        // เพิ่มใหม่
        res = await axios.post(
          `${getBaseUrl()}/api/user/addAddress`,
          shippingInfo,
          { withCredentials: true }
        );
        toast({ title: "✅ เพิ่มที่อยู่เรียบร้อยแล้ว", duration: 3000 });

        const newId = res.data?.address?._id;
        if (newId) {
          fetchAddressList(newId); // ❗ ปล่อยให้ function นี้จัดการทั้ง selected + shippingInfo
          modalRef.current?.close();
        } else {
          fetchAddressList(); // fallback
          modalRef.current?.close();
        }
      }

      modalRef.current?.close();
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
      toast({ title: "❌ กรุณาแนบสลิปก่อนยืนยันการชำระเงิน", duration: 3000 });
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
      toast({ title: "❌ เกิดข้อผิดพลาด กรุณาลองใหม่" });
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-12">กำลังโหลด...</div>;
  if (checkoutItems.length === 0)
    return <div className="text-center py-12">ไม่มีสินค้าในตะกร้า</div>;

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

        {/* ✅ Autocomplete พร้อม addressData */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ชื่อผู้รับ */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              ชื่อผู้รับ
            </label>
            <input
              value={shippingInfo.Name}
              onChange={(e) =>
                setShippingInfo({ ...shippingInfo, Name: e.target.value })
              }
              className="border rounded px-3 py-2 w-full focus:outline-yellow-500"
            />
          </div>

          {/* เบอร์ติดต่อ */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              เบอร์ติดต่อ
            </label>
            <input
              type="tel"
              pattern="[0-9]{10}"
              maxLength={10}
              value={shippingInfo.phone}
              onChange={(e) =>
                setShippingInfo({
                  ...shippingInfo,
                  phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                })
              }
              className="border rounded px-3 py-2 w-full focus:outline-yellow-500"
            />
          </div>

          {/* สถานที่ */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              สถานที่
            </label>
            <input
              value={shippingInfo.label}
              onChange={(e) =>
                setShippingInfo({ ...shippingInfo, label: e.target.value })
              }
              placeholder="บ้าน, ออฟฟิศ ฯลฯ"
              className="border rounded px-3 py-2 w-full focus:outline-yellow-500"
            />
          </div>

          {/* ที่อยู่ */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              ที่อยู่
            </label>
            <input
              value={shippingInfo.addressLine}
              onChange={(e) =>
                setShippingInfo({
                  ...shippingInfo,
                  addressLine: e.target.value,
                })
              }
              placeholder="บ้านเลขที่ ซอย ถนน ฯลฯ"
              className="border rounded px-3 py-2 w-full focus:outline-yellow-500"
            />
          </div>

          {/* แขวง/ตำบล + Suggest */}
          <div className="col-span-2 flex flex-col relative" ref={suggestRef}>
            <label className="text-sm font-medium text-gray-700 mb-1">
              แขวง/ตำบล
            </label>
            <input
              type="text"
              value={shippingInfo.subdistrict}
              onChange={(e) => {
                const val = e.target.value;
                setShippingInfo({ ...shippingInfo, subdistrict: val });

                if (val.length > 1) {
                  const filtered = allAddresses.filter((addr) =>
                    addr.subdistrict.toLowerCase().includes(val.toLowerCase())
                  );
                  setSuggestions(filtered.slice(0, 10));
                } else {
                  setSuggestions([]);
                }
              }}
              className="border rounded px-3 py-2 w-full focus:outline-yellow-500"
            />
            {suggestions.length > 0 && (
              <ul className="absolute top-full left-0 w-full z-30 bg-white border border-gray-300 mt-1 rounded shadow max-h-40 overflow-auto">
                {suggestions.map((addr, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      setShippingInfo({
                        ...shippingInfo,
                        subdistrict: addr.subdistrict,
                        district: addr.district,
                        province: addr.province,
                        postalCode: addr.zipcode,
                      });
                      setSuggestions([]);
                    }}
                    className="p-2 hover:bg-yellow-100 cursor-pointer text-sm"
                  >
                    {addr.subdistrict}, {addr.district}, {addr.province},{" "}
                    {addr.zipcode}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* เขต / จังหวัด / รหัสไปรษณีย์ */}
          {(["district", "province", "postalCode"] as const).map((key) => (
            <div key={key} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                {key === "district"
                  ? "เขต/อำเภอ"
                  : key === "province"
                  ? "จังหวัด"
                  : "รหัสไปรษณีย์"}
              </label>
              <input
                type="text"
                value={shippingInfo[key]}
                readOnly
                className="border rounded px-3 py-2 w-full bg-gray-100"
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

      {/* ✅ แก้จุดที่ยังใช้ city → เปลี่ยนเป็น district */}
      <div className="bg-white p-4 rounded shadow mb-4 border border-yellow-400 relative">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="flex items-center text-lg font-semibold text-yellow-600 mb-1">
              <MapPinHouse className="w-5 h-5 mr-2" />
              ที่อยู่ในการจัดส่ง
            </h2>
          </div>
          <div className="flex flex-col items-end gap-2 mb-4">
            <button
              onClick={() => {
                setSelectedAddressId(null);
                setShippingInfo(defaultShippingInfo);
                modalRef.current?.showModal();
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-4 py-1 rounded"
            >
              เพิ่มที่อยู่ใหม่
            </button>
          </div>
        </div>

        {showAddressModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg w-full max-w-xl p-6 max-h-[80vh] overflow-y-auto relative shadow-lg">
              <h3 className="text-lg font-semibold text-brown-800 mb-4">
                เลือกที่อยู่ของคุณ
              </h3>

              <div className="space-y-4">
                {addressList.map((addr) => (
                  <label
                    key={addr._id}
                    className={`border rounded-lg p-3 flex justify-between items-start cursor-pointer transition
                    ${
                      selectedAddressId === addr._id
                        ? "border-yellow-500 bg-yellow-50"
                        : "hover:border-yellow-300"
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-brown-800">
                        {addr.Name}{" "}
                        <span className="text-gray-600">({addr.phone})</span>
                      </p>
                      <p className="text-sm text-gray-700">
                        {addr.addressLine}, {addr.subdistrict}, {addr.district},{" "}
                        {addr.province} {addr.postalCode}
                      </p>
                    </div>
                    <input
                      type="radio"
                      checked={selectedAddressId === addr._id}
                      onChange={() => {
                        setSelectedAddressId(addr._id);
                        setShippingInfo({ ...addr });
                      }}
                      className="accent-yellow-500 mt-1"
                    />
                  </label>
                ))}
              </div>

              <div className="flex justify-between items-center mt-6">
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowAddressModal(false)}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-5 py-2 rounded"
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        )}

        {addressList.length === 0 ? (
          <p className="text-red-500 text-sm">
            ⚠ กรุณาเพิ่มที่อยู่ก่อนทำการสั่งซื้อ
          </p>
        ) : (
          <div className="space-y-3">
            {addressList.map((addr) => (
              <label
                key={addr._id}
                className={`border rounded-lg p-3 cursor-pointer flex justify-between items-start transition 
                ${
                  selectedAddressId === addr._id
                    ? "border-yellow-500 bg-yellow-50"
                    : "hover:border-yellow-300"
                }`}
              >
                <div className="flex-1">
                  <p className="font-semibold text-brown-800">{addr.Name}</p>
                  <p className="text-sm text-gray-600">
                    {addr.addressLine}, {addr.subdistrict}, {addr.district},{" "}
                    {addr.province} {addr.postalCode}
                  </p>
                  <p className="text-sm text-gray-500">เบอร์: {addr.phone}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <input
                    type="radio"
                    name="selectedAddress"
                    checked={selectedAddressId === addr._id}
                    onChange={() => {
                      setSelectedAddressId(addr._id);
                      setShippingInfo({ ...addr });
                    }}
                    className="accent-yellow-500 mt-1"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedAddressId(addr._id);
                        setShippingInfo({ ...addr });
                        modalRef.current?.showModal();
                      }}
                      className="text-yellow-600 hover:underline text-xs"
                    >
                      แก้ไข
                    </button>
                    <p>/</p>
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        const result = await Swal.fire({
                          title: "ยืนยันการลบที่อยู่",
                          text: "คุณต้องการลบที่อยู่นี้ใช่หรือไม่?",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonColor: "#ef4444",
                          cancelButtonColor: "#6b7280",
                          confirmButtonText: "ลบที่อยู่",
                          cancelButtonText: "ยกเลิก",
                        });

                        if (result.isConfirmed) {
                          try {
                            await axios.delete(
                              `${getBaseUrl()}/api/user/deleteAddress/${
                                addr._id
                              }`,
                              {
                                withCredentials: true,
                              }
                            );
                            setAddressList((prev) =>
                              prev.filter((a) => a._id !== addr._id)
                            );
                            toast({
                              title: "✅ ลบที่อยู่เรียบร้อยแล้ว",
                              duration: 3000,
                            });
                          } catch (error) {
                            toast({
                              title: "❌ ไม่สามารถลบที่อยู่ได้",
                              duration: 3000,
                            });
                          }
                        }
                      }}
                      className="text-red-600 hover:underline text-xs"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              </label>
            ))}
          </div>
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
              <p className="font-medium text-lg text-brown-800">
                ธนาคาร: {checkoutBankInfo.bankName}
              </p>
              <p>
                เลขบัญชี:{" "}
                <span className="font-medium text-lg">
                  {checkoutBankInfo.accountNumber}
                </span>
              </p>
              <p>
                ชื่อบัญชี:{" "}
                <span className="font-medium text-lg">
                  {checkoutBankInfo.accountName}
                </span>
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
                  if (e.target.files?.length) setSlipFile(e.target.files[0]);
                }}
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-yellow-500 file:text-white file:font-semibold hover:file:bg-yellow-600"
              />
            </div>
             <p className="text-red-500 text-md">
              กรุณาตรวจสอบความถูกต้องของชื่อบัญชี และ ยอดชำระทั้งหมด ก่อนทำรายการ !
            </p>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <div
              onClick={() => setIsQRPreviewOpen(true)}
              className="cursor-pointer inline-block"
            >
              <Image
                src={
                  checkoutBankInfo.qrImage
                    ? `${getBaseUrl()}/${checkoutBankInfo.qrImage}`
                    : "/placeholder.svg"
                }
                alt="QR Code"
                width={260}
                height={260}
                className="mx-auto rounded shadow hover:scale-105 transition"
              />
            </div>
            <p className="text-gray-500 text-lg">
              สามารถคลิกที่รูปเพื่อดู QR Code
            </p>
            <p className="text-red-500 text-md">
              กรุณาตรวจสอบความถูกต้องของชื่อบัญชี และ ยอดชำระทั้งหมด ก่อนทำรายการ !
            </p>
          </div>
        )}
      </div>

      {isQRPreviewOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
          onClick={() => setIsQRPreviewOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-4 rounded-lg shadow-lg max-w-3xl w-full"
          >
            <h3 className="text-center font-semibold mb-4">QR Code ชำระเงิน</h3>
            <Image
              src={`${getBaseUrl()}/${checkoutBankInfo.qrImage}`}
              alt="QR Code Preview"
              width={700}
              height={700}
              className="mx-auto rounded"
            />
            <button
              className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded w-full"
              onClick={() => setIsQRPreviewOpen(false)}
            >
              ปิด
            </button>
          </div>
        </div>
      )}

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
