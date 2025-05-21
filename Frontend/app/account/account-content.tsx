"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User,
  Package,
  Heart,
  CreditCard,
  Settings,
  ShoppingBag,
  MapPinHouse,
  MapPinCheck,
  LogIn,
  Trash,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { LoginForm } from "../../components/login-form";
import { RegisterForm } from "./register-form";
import { ProfileForm } from "./profile-form";
import Swal from "sweetalert2";
import { useToast } from "@/components/ui/use-toast";
import { getBaseUrl } from "@/lib/api";
import axios from "axios";

type AccountTab =
  | "profile"
  | "orders"
  | "wishlist"
  | "addresses"
  | "payment"
  | "settings";

interface OrderItem {
  productId: string;
  name: string;
  images: string[];
  priceAtPurchase: number; // ✅ แก้ตรงนี้
  quantity: number;
  size: string;
}

interface PaymentInfo {
  method: string;
  status: string;
  transactionId?: string;
  paidAt?: string;
  slipImage?: string;
}

interface Order {
  _id: string; // ✅ แก้ตรงนี้
  createdAt: string;
  orderStatus: string;
  payment?: PaymentInfo; // ✅ เพิ่ม payment object
  total: number;
  items: OrderItem[];
}

interface Address {
  _id: string;
  Name: string;
  label: string;
  addressLine: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface WishlistItem {
  _id: string;
  id_product: string;
  name: string;
  price: number;
  images: string[];
  availableSizes: {
    size: string;
    quantity: number;
  }[];
  size: string;
  quantity: number;
}

export function AccountContent() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState<AccountTab>("profile");
  const [showLoginForm, setShowLoginForm] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>(
    {}
  );
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState({
    _id: "",
    Name: "",
    label: "",
    addressLine: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Thailand",
    phone: "",
  });
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeTab === "profile" && isAuthenticated) {
      refreshUser();
    }
  }, [activeTab, isAuthenticated]);

  const refreshUser = async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/user/getUserProfile`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) return console.error("Failed to fetch user profile");
      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await fetch(`${getBaseUrl()}/api/user/updateuser`, {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) return console.error("Upload failed");
      await refreshUser();
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "ยืนยันการออกจากระบบ",
      text: "คุณต้องการออกจากระบบหรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ตกลง",
      cancelButtonText: "ยกเลิก",
    });
    if (result.isConfirmed) {
      logout();
    }
  };

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchWishlist = async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/wishlist/getWishlist`, {
        credentials: "include",
      });
      const data = await res.json();
      console.log("✅ wishlist response", data);

      if (data.success || data.wishlist) {
        const flatWishlist =
          data.wishlist?.products
            ?.filter((item: any) => item.productId !== null) // 🛠 กรอง null
            .map((item: any) => ({
              ...item.productId,
              // ✅ populate result
              id_product: item.productId?.id_product,
              size: item.size,
              quantity: item.quantity,
            })) || [];

        console.log("✅ cleaned wishlist:", flatWishlist);
        setWishlist(flatWishlist);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "wishlist") {
      fetchWishlist();
    }
  }, [activeTab]);

  const handleSelectSize = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: size,
    }));
  };

  const handleAddToCart = async (product: any) => {
    const size = selectedSizes[product.id_product];
    if (!size) {
      toast({
        title: "⚠️ กรุณาเลือกขนาด",
        description: "ต้องเลือกขนาดสินค้าก่อนเพิ่มลงตะกร้า",
        variant: "destructive",
      });
      return;
    }

    try {
      await axios.post(
        `${getBaseUrl()}/api/cart/addToCart`,
        {
          productId: product.id_product,
          quantity: 1,
          size,
        },
        { withCredentials: true }
      );

      setAddedToCart(product.id_product);
      toast({
        title: "✅ เพิ่มสินค้าลงตะกร้าแล้ว",
        description: `${product.name} ไซส์ ${size} ถูกเพิ่มลงตะกร้า`,
      });
    } catch (error) {
      console.error("❌ Error adding to cart:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มสินค้าลงตะกร้าได้",
        variant: "destructive",
      });
    }
  };

  const handleRemoveWishlist = async (productId: string) => {
    try {
      await axios.post(
        `${getBaseUrl()}/api/wishlist/removeFromWishlist`,
        { productId },
        { withCredentials: true }
      );
      toast({ title: "💔 ลบออกจากรายการโปรดแล้ว", duration: 3000 });
      fetchWishlist();
    } catch (error) {
      console.error("❌ Error removing wishlist item:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบออกจากรายการโปรดได้",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/order/getOrdersByUser`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const fetchAddresses = async () => {
    const res = await fetch(`${getBaseUrl()}/api/user/getAddress`, {
      credentials: "include",
    });
    const data = await res.json();
    setAddresses(data.addresses);
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAdd = async () => {
    await fetch(`${getBaseUrl()}/api/user/addAddress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(newAddress),
    });
    setNewAddress({
      _id: "",
      Name: "",
      label: "",
      addressLine: "",
      city: "",
      province: "",
      postalCode: "",
      country: "Thailand",
      phone: "",
    });
    toast({
      title: "เพิ่มที่อยู่เรียบร้อย",
      description: "ที่อยู่ถูกเพิ่มเข้าระบบแล้ว",
      duration: 3000,
    });
    fetchAddresses();
  };

  const handleUpdate = async (addressId: string) => {
    await fetch(`${getBaseUrl()}/api/user/updateAddress/${addressId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(newAddress), // ต้องส่ง field ใหม่ๆ ที่จะ update
    });
    toast({
      title: "แก้ไขที่อยู่เรียบร้อย",
      description: "ที่อยู่ถูกแก้ไขเข้าระบบแล้ว",
      duration: 3000,
    });
    fetchAddresses();
  };

  const handleDelete = async (addressId: string) => {
    await fetch(`${getBaseUrl()}/api/user/deleteAddress/${addressId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    toast({
      title: "ลบที่อยู่เรียบร้อย",
      description: "ที่อยู่ถูกลบออกจากระบบแล้ว",
      variant: "destructive",
      duration: 3000,
    });
    fetchAddresses();
  };

  const handleCancelOrder = async (orderId: string) => {
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
        toast({
          title: "ยกเลิกคำสั่งซื้อแล้ว",
          description: "คำสั่งซื้อถูกยกเลิกสำเร็จ",
          duration: 3000,
        });
        fetchOrders(); // 🔄 รีโหลด orders อีกครั้ง
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: data.message || "ไม่สามารถยกเลิกได้",
          duration: 3000,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถยกเลิกได้ กรุณาลองใหม่",
        duration: 3000,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 border-4 border-gold-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex border-b border-gray-200">
              <button
                className={`px-4 py-2 font-medium ${
                  showLoginForm
                    ? "text-gold-600 border-b-2 border-gold-600"
                    : "text-gray-500"
                }`}
                onClick={() => setShowLoginForm(true)}
              >
                เข้าสู่ระบบ
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  !showLoginForm
                    ? "text-gold-600 border-b-2 border-gold-600"
                    : "text-gray-500"
                }`}
                onClick={() => setShowLoginForm(false)}
              >
                สมัครสมาชิก
              </button>
            </div>
            <div className="mt-6">
              {showLoginForm ? (
                <LoginForm />
              ) : (
                <RegisterForm onSuccess={() => setShowLoginForm(true)} />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl sm:text-3xl font-display font-semibold text-brown-800 mb-6 text-center sm:text-left">
        ข้อมูลบัญชีผู้ใช้
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-[280px]">
        {/* Sidebar */}
        <div className="lg:col-span-1 lg:w-[330px]">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col items-center lg:flex-row lg:items-start">
                <div
                  className="relative w-16 h-16 rounded-full overflow-hidden mb-4 lg:mb-0 lg:mr-4 group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image
                    src={
                      user?.avatar
                        ? user.avatar.startsWith("http") // ถ้าเป็น full URL แล้ว
                          ? user.avatar
                          : `${getBaseUrl()}/${user.avatar.replace(/^\/+/, "")}` // ลบ / ซ้ำออก
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user?.firstName || "User"
                          )}`
                    }
                    alt={user?.firstName || "User"}
                    fill
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs">
                    เปลี่ยนรูป
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <div className="text-center lg:text-left">
                  <h2 className="font-medium text-lg text-brown-800">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-sm text-brown-900">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="p-4">
              <nav className="space-y-1">
                {[
                  { tab: "profile", icon: <User />, label: "Profile" },
                  { tab: "orders", icon: <Package />, label: "Orders" },
                  { tab: "wishlist", icon: <Heart />, label: "Wishlist" },
                  {
                    tab: "addresses",
                    icon: <MapPinHouse />,
                    label: "Addresses",
                  },
                ].map(({ tab, icon, label }) => (
                  <button
                    key={tab}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                      activeTab === tab
                        ? "bg-gold-50 text-gold-600"
                        : "text-brown-800 hover:text-brown-900 hover:bg-gray-50"
                    }`}
                    onClick={() => setActiveTab(tab as AccountTab)}
                  >
                    {icon}
                    <span className="ml-3">{label}</span>
                  </button>
                ))}
                <button
                  type="button"
                  className="w-full flex items-center px-3 py-2 gap-4 text-sm rounded-md text-brown-800 hover:text-brown-900 hover:bg-gray-50"
                  onClick={handleLogout}
                >
                  <LogIn />
                  Logout
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-xl font-medium mb-6">ข้อมูลส่วนตัว</h2>
                  <ProfileForm />
                </div>
              )}
              {activeTab === "orders" && (
                <div>
                  <h2 className="text-xl font-medium mb-6">
                    ประวัติการสั่งซื้อ
                  </h2>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 mb-4">
                        คุณยังไม่มีคำสั่งซื้อ
                      </p>
                      <Button variant="luxury" asChild>
                        <a href="/product">ซื้อสินค้าเลย</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order._id}
                          className="border rounded p-4 shadow-sm"
                        >
                          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                            <div>
                              <p className="font-medium">
                                เลขการสั่งซื้อ : {order._id}
                              </p>
                              <p className="text-sm text-gray-500">
                                วันที่สั่งซื้อ :{" "}
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-500">
                                สถานะ : {order.orderStatus} | Payment:{" "}
                                {order.payment?.status}
                              </p>
                            </div>

                            <div className="flex flex-col gap-2 mt-4 lg:mt-0">
                              <Button
                                variant="outline"
                                onClick={() =>
                                  router.push(
                                    `/order-tracking?orderId=${order._id}`
                                  )
                                }
                              >
                                ดูรายละเอียด
                              </Button>

                              {/* ✅ ปุ่มยกเลิก (เฉพาะ pending) */}
                              {order.orderStatus === "pending" && (
                                <Button
                                  variant="destructive"
                                  onClick={() => handleCancelOrder(order._id)}
                                >
                                  ยกเลิกคำสั่งซื้อ
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* รายการสินค้า */}
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                            {order.items.map((item) => (
                              <div
                                key={`${order._id}-${item.productId}`}
                                className="flex items-center"
                              >
                                <Image
                                  src={`${getBaseUrl()}${item.images[0]}`}
                                  alt={item.name}
                                  width={48}
                                  height={48}
                                  className="rounded mr-2 object-cover"
                                />
                                <div className="text-sm">
                                  <p>{item.name}</p>
                                  <p className="text-gray-500">
                                    {item.quantity} ชิ้น | ราคา{" "}
                                    {item.priceAtPurchase} บาท
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <p className="mt-2 font-bold text-right">
                            รวม {order.total.toLocaleString()} บาท
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {activeTab === "addresses" && (
                <div>
                  {showForm ? (
                    <div className="space-y-2">
                      <h3 className="flex items-center gap-2 text-lg font-medium mb-2 text-brown-800">
                        <MapPinCheck />
                        {newAddress._id ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่ใหม่"}
                      </h3>
                      <input
                        type="text"
                        placeholder="ชื่อผู้รับ"
                        value={newAddress.Name}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            Name: e.target.value,
                          })
                        }
                        className="w-full border rounded px-3 py-2"
                      />
                      <input
                        type="text"
                        placeholder="เบอร์โทรศัพท์"
                        value={newAddress.phone}
                        onChange={(e) => {
                          const value = e.target.value;
                          // ✅ อนุญาตเฉพาะตัวเลข และไม่เกิน 10 ตัว
                          if (/^\d{0,10}$/.test(value)) {
                            setNewAddress({
                              ...newAddress,
                              phone: value,
                            });
                          }
                        }}
                        className="w-full border rounded px-3 py-2"
                        inputMode="numeric"
                        pattern="\d*"
                      />

                      <input
                        type="text"
                        placeholder="สถานที่ (บ้าน, ออฟฟิศ)"
                        value={newAddress.label}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            label: e.target.value,
                          })
                        }
                        className="w-full border rounded px-3 py-2"
                      />

                      <input
                        type="text"
                        placeholder="ที่อยู่ (เลขที่, ถนน)"
                        value={newAddress.addressLine}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            addressLine: e.target.value,
                          })
                        }
                        className="w-full border rounded px-3 py-2"
                      />
                      <input
                        type="text"
                        placeholder="อำเภอ / เขต / ตำบล"
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            city: e.target.value,
                          })
                        }
                        className="w-full border rounded px-3 py-2"
                      />
                      <input
                        type="text"
                        placeholder="จังหวัด"
                        value={newAddress.province}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            province: e.target.value,
                          })
                        }
                        className="w-full border rounded px-3 py-2"
                      />
                      <input
                        type="text"
                        placeholder="รหัสไปรษณีย์"
                        value={newAddress.postalCode}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            postalCode: e.target.value,
                          })
                        }
                        className="w-full border rounded px-3 py-2"
                      />
                      <input
                        type="text"
                        placeholder="ประเทศ"
                        value={newAddress.country}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            country: e.target.value,
                          })
                        }
                        className="w-full border rounded px-3 py-2"
                      />

                      <div className="flex space-x-2">
                        <Button
                          variant="luxury"
                          onClick={() => {
                            if (newAddress._id) {
                              handleUpdate(newAddress._id);
                            } else {
                              handleAdd();
                            }
                            setShowForm(false);
                          }}
                        >
                          {newAddress._id
                            ? "บันทึกการแก้ไข"
                            : "เพิ่มที่อยู่ใหม่"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowForm(false)}
                        >
                          ยกเลิก
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="flex items-center gap-2 text-xl font-medium mb-6 text-brown-800">
                        <MapPinHouse />
                        ที่อยู่ของคุณ
                      </h2>

                      {addresses.length === 0 ? (
                        <div className="text-center">
                          <p className="text-gray-600 mb-4">
                            คุณยังไม่มีที่อยู่
                          </p>
                          <Button
                            variant="luxury"
                            onClick={() => {
                              setNewAddress({
                                _id: "",
                                label: "",
                                Name: "",
                                addressLine: "",
                                city: "",
                                province: "",
                                postalCode: "",
                                country: "Thailand",
                                phone: "",
                              });
                              setShowForm(true);
                            }}
                          >
                            เพิ่มที่อยู่ใหม่
                          </Button>
                        </div>
                      ) : (
                        <>
                          {addresses.map((addr, index) => (
                            <div
                              key={index}
                              className="border rounded p-4 shadow-sm mb-4 flex flex-col lg:flex-row justify-between items-start lg:items-center"
                            >
                              <div>
                                <p className="font-medium">{addr.label}</p>
                                <p className="text-sm text-gray-500">
                                  {addr.addressLine}, {addr.city},{" "}
                                  {addr.province}, {addr.postalCode},{" "}
                                  {addr.country}
                                </p>
                              </div>
                              <div className="space-x-2 mt-4 lg:mt-0">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setNewAddress(addr);
                                    setShowForm(true);
                                  }}
                                >
                                  แก้ไข
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDelete(addr._id)}
                                >
                                  ลบ
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button
                            className="mt-4"
                            variant="luxury"
                            onClick={() => {
                              setNewAddress({
                                _id: "",
                                Name: "",
                                label: "",
                                addressLine: "",
                                city: "",
                                province: "",
                                postalCode: "",
                                country: "Thailand",
                                phone: "",
                              });
                              setShowForm(true);
                            }}
                          >
                            เพิ่มที่อยู่ใหม่
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
              {activeTab === "wishlist" && (
                <div>
                  <h2 className="text-xl font-medium mb-6">รายการโปรด</h2>

                  {wishlist.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">
                        คุณยังไม่มีรายการโปรด
                      </p>
                      <Button variant="luxury" asChild>
                        <a href="/product">เลือกสินค้าเลย</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {wishlist
                        .filter((item) => item && item.name && item.images) // ✅ กรอง null / ไม่สมบูรณ์
                        .map((item, index) => (
                          <div
                            key={item._id || index}
                            className="border rounded p-4 shadow-sm flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <Image
                                src={
                                  item?.images?.length > 0
                                    ? `${getBaseUrl()}${item.images[0]}`
                                    : "/placeholder.jpg"
                                }
                                alt={item.name}
                                width={64}
                                height={64}
                                className="rounded mr-4 object-cover"
                              />
                              <div>
                                <p className="font-medium">{item.name}</p>
                                {item.availableSizes?.length > 0 && (
                                  <div className="text-sm text-gray-500 flex gap-2 mt-1">
                                    {item.availableSizes.map((s) => (
                                      <button
                                        key={s.size}
                                        onClick={() =>
                                          handleSelectSize(
                                            item.id_product,
                                            s.size
                                          )
                                        }
                                        className={`px-2 py-1 rounded border text-xs transition-all ${
                                          selectedSizes[item.id_product] ===
                                          s.size
                                            ? "bg-gold-500 text-white"
                                            : "bg-white text-gray-700 border-gray-300"
                                        }`}
                                      >
                                        {s.size}
                                      </button>
                                    ))}
                                  </div>
                                )}
                                <p className="text-gray-700 font-semibold mt-1">
                                  ฿{item.price}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="luxury"
                                onClick={() => handleAddToCart(item)}
                              >
                                เพิ่มลงตะกร้า
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleRemoveWishlist(item._id)}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
