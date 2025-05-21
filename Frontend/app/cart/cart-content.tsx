"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Minus, Plus, X, ShoppingBag, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { ShoppingBasket, Banknote } from "lucide-react";
import { getBaseUrl } from "@/lib/api";

interface CartItem {
  productId: string;
  name: string;
  priceAtAdded: number;
  quantity: number;
  size: string;
  images: string[];
  availableSizes: { size: string; quantity: number }[];
}

interface CartResponse {
  cart: {
    items: CartItem[];
  };
}

export function CartContent() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // เพิ่มเหมือนหน้า Wishlist
  const [isLoading, setIsLoading] = useState(true); // เพิ่มเหมือนหน้า Wishlist
  const [selectedItems, setSelectedItems] = useState<{
    [key: string]: boolean;
  }>({});

  const selectedCartItems = cartItems.filter(
    (item) => selectedItems[`${item.productId}-${item.size}`]
  );

  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const subtotal = selectedCartItems.reduce(
    (acc, item) => acc + item.priceAtAdded * item.quantity,
    0
  );

  const shipping = selectedCartItems.length > 0 ? 50 : 0;
  const total = selectedCartItems.length > 0 ? subtotal + shipping : 0;

  const fetchCart = async () => {
    try {
      const response = await axios.get<CartResponse>(
        `${getBaseUrl()}/api/cart/getCart`,
        { withCredentials: true }
      );
      setCartItems(response.data.cart.items);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("❌ Failed to fetch cart:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // ยังไม่ได้ Login
        setIsLoggedIn(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemoveItem = async (productId: string, size: string) => {
    try {
      await axios.post(
        `${getBaseUrl()}/api/cart/removeCartItem`,
        { productId, size },
        { withCredentials: true }
      );
      toast({
        title: "✅ ลบสินค้าสำเร็จ",
        description: "สินค้าถูกลบออกจากตะกร้าแล้ว",
        variant: "default",
        duration: 3000,
      });
      fetchCart(); // รีเฟรช cart หลังจากลบ
    } catch (error) {
      console.error("❌ Failed to remove item:", error);
    }
  };

  const handleUpdateQuantity = async (
    productId: string,
    size: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    try {
      await axios.post(
        `${getBaseUrl()}/api/cart/updateCartItem`,
        {
          productId,
          size,
          quantity: newQuantity,
        },
        { withCredentials: true }
      );
      fetchCart(); // ✅ ดึงข้อมูลตะกร้าใหม่เพื่อ refresh
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "❌ ไม่สามารถอัปเดตจำนวนได้",
        description: "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleProceedToCheckout = async () => {
    try {
      const items = selectedCartItems.map((item) => ({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
        priceAtAdded: item.priceAtAdded,
        name: item.name,
        images: item.images,
      }));

      const response = await axios.post(
        `${getBaseUrl()}/api/order/selectItems`,
        { items },
        { withCredentials: true }
      );

      router.push("/checkout"); // ไปหน้า checkout
    } catch (error) {
      console.error("❌ Failed to save selected items:", error);
      toast({
        title: "❌ ไม่สามารถเลือกสินค้าสำหรับ checkout ได้",
        description: "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="flex gap-2 items-center text-3xl font-display font-medium text-brown-800 mb-8">
        <ShoppingBasket className="w-8 h-8 text-yellow-500" />
        ตะกร้าสินค้า
      </h1>

      {loading ? (
        <div className="text-center py-16">กำลังโหลด...</div>
      ) : !isLoggedIn ? (
        // 🛑 กรณีไม่ได้ Login
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-display font-medium text-gray-900 mb-2">
            กรุณาเข้าสู่ระบบ
          </h2>
          <p className="text-gray-600 mb-8">
            คุณต้องเข้าสู่ระบบก่อนเพื่อดูและจัดการตะกร้าสินค้าของคุณ
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/account">
              <Button className="bg-gold-600 hover:bg-gold-700 px-6 py-3">
                เข้าสู่ระบบ / สมัครสมาชิก
              </Button>
            </Link>
            <Link href="/product">
              <Button variant="outline" className="px-6 py-3">
                กลับไปหน้าสินค้า
              </Button>
            </Link>
          </div>
        </div>
      ) : cartItems.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {/* Mobile View (Card Style) */}
            <div className="md:hidden space-y-4">
              {/* Select All Checkbox */}
              <div className="bg-white rounded-lg shadow-sm p-4 flex items-center">
                <input
                  type="checkbox"
                  checked={
                    cartItems.length > 0 &&
                    cartItems.every(
                      (item) => selectedItems[`${item.productId}-${item.size}`]
                    )
                  }
                  onChange={(e) => {
                    const newSelected: { [key: string]: boolean } = {};
                    if (e.target.checked) {
                      cartItems.forEach((item) => {
                        newSelected[`${item.productId}-${item.size}`] = true;
                      });
                    }
                    setSelectedItems(newSelected);
                  }}
                  className="mr-2"
                />
                <span className="font-medium text-brown-800">
                  เลือกสินค้าทั้งหมด
                </span>
              </div>

              {cartItems.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="bg-white rounded-lg shadow-sm p-3 flex items-start gap-3"
                >
                  <input
                    type="checkbox"
                    checked={
                      selectedItems[`${item.productId}-${item.size}`] || false
                    }
                    onChange={(e) =>
                      setSelectedItems({
                        ...selectedItems,
                        [`${item.productId}-${item.size}`]: e.target.checked,
                      })
                    }
                    className="mt-1"
                  />

                  {/* รูปสินค้า */}
                  <div className="relative w-40 h-40 bg-gray-100 rounded overflow-hidden">
                    <Image
                      src={
                        item.images[0]
                          ? `${getBaseUrl()}${item.images[0]}`
                          : "/placeholder.svg"
                      }
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* รายละเอียด */}
                  <div className="flex-1 text-sm text-brown-800">
                    <h3 className="font-medium leading-snug">{item.name}</h3>
                    <span>ราคา: {item.priceAtAdded} บาท</span>
                    {/* เลือกขนาด (เฉพาะ mobile) */}
                    <div className="items-center py-2 gap-2 mt-2">
                      <label className="flex text-xs text-gray-600">ขนาด :</label>
                      <select
                        value={item.size}
                        onChange={async (e) => {
                          const newSize = e.target.value;
                          if (newSize === item.size) return;

                          try {
                            await axios.post(
                              `${getBaseUrl()}/api/cart/changeItemSize`,
                              {
                                productId: item.productId,
                                oldSize: item.size,
                                newSize: newSize,
                              },
                              { withCredentials: true }
                            );

                            toast({
                              title: "✅ เปลี่ยนขนาดสำเร็จ",
                              description: `ขนาดใหม่: ${newSize}`,
                              duration: 3000,
                            });

                            fetchCart(); // โหลดตะกร้าใหม่
                          } catch (error) {
                            toast({
                              title: "❌ เปลี่ยนขนาดไม่สำเร็จ",
                              description: "กรุณาลองใหม่",
                              variant: "destructive",
                            });
                          }
                        }}
                        className="mt-1 w-full border rounded px-2 py-1 text-sm text-gray-700"
                      >
                        {item.availableSizes?.map((s) => (
                          <option key={s.size} value={s.size}>
                            {s.size} (เหลือ {s.quantity})
                          </option>
                        ))}
                      </select>
                      
                    </div>


                    {/* ปุ่มจำนวน */}
                    <div className="flex items-center mb-2">
                      <button
                        className="w-7 h-7 border border-gray-300 rounded-l"
                        onClick={() =>
                          handleUpdateQuantity(
                            item.productId,
                            item.size,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="text"
                        value={item.quantity}
                        className="w-10 h-7 text-center border-t border-b border-gray-300"
                        readOnly
                      />
                      <button
                        className="w-7 h-7 border border-gray-300 rounded-r"
                        onClick={() =>
                          handleUpdateQuantity(
                            item.productId,
                            item.size,
                            item.quantity + 1
                          )
                        }
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <span className="font-medium ">
                      รวมทั้งสิ้น : {formatPrice(item.priceAtAdded * item.quantity)}
                    </span>
                  </div>

                  <button
                    className=" text-center text-white rounded-md py-2 px-2 bg-red-500 hover:bg-red-600 text-sm"
                    onClick={() => handleRemoveItem(item.productId, item.size)}
                  >
                    <Trash className="w-8 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop & Tablet View (Table Style) */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-brown-800">
                      <th className="text-left pb-4">
                        <input
                          type="checkbox"
                          checked={
                            cartItems.length > 0 &&
                            cartItems.every(
                              (item) =>
                                selectedItems[`${item.productId}-${item.size}`]
                            )
                          }
                          onChange={(e) => {
                            const newSelected: { [key: string]: boolean } = {};
                            if (e.target.checked) {
                              cartItems.forEach((item) => {
                                newSelected[`${item.productId}-${item.size}`] =
                                  true;
                              });
                            }
                            setSelectedItems(newSelected);
                          }}
                          className="mr-2"
                        />
                        สินค้า
                      </th>
                      <th className="text-center pb-4">ขนาด</th>
                      <th className="text-center pb-4">จำนวน</th>
                      <th className="text-right pb-4">ราคา</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr
                        key={`${item.productId}-${item.size}`}
                        className="border-b"
                      >
                        <td className="py-4">
                          <div className="flex items-center text-brown-800">
                            <input
                              type="checkbox"
                              checked={
                                selectedItems[
                                  `${item.productId}-${item.size}`
                                ] || false
                              }
                              onChange={(e) =>
                                setSelectedItems({
                                  ...selectedItems,
                                  [`${item.productId}-${item.size}`]:
                                    e.target.checked,
                                })
                              }
                              className="mr-2"
                            />
                            <div className="relative w-16 h-16 mr-4 bg-gray-50">
                              <Image
                                src={
                                  item.images[0]
                                    ? `${getBaseUrl()}${item.images[0]}`
                                    : "/placeholder.svg"
                                }
                                alt={item.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                            <div>
                              <h3 className="font-medium">{item.name}</h3>
                              <p className="text-sm text-gray-600">
                                {formatPrice(item.priceAtAdded)}
                              </p>
                              {item.size && (
                                <p className="text-xs text-gray-500">
                                  Size: {item.size}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <select
                            value={item.size}
                            onChange={async (e) => {
                              const newSize = e.target.value;

                              if (newSize === item.size) return;

                              try {
                                await axios.post(
                                  `${getBaseUrl()}/api/cart/changeItemSize`,
                                  {
                                    productId: item.productId,
                                    oldSize: item.size,
                                    newSize: newSize,
                                  },
                                  { withCredentials: true }
                                );

                                toast({
                                  title: "✅ เปลี่ยนขนาดสำเร็จ",
                                  description: `ขนาดใหม่: ${newSize}`,
                                  duration: 3000,
                                });

                                fetchCart(); // โหลดตะกร้าใหม่
                              } catch (error) {
                                toast({
                                  title: "❌ เปลี่ยนขนาดไม่สำเร็จ",
                                  description: "กรุณาลองใหม่",
                                  variant: "destructive",
                                });
                              }
                            }}
                            className="border rounded px-2 py-1 text-sm text-gray-700"
                          >
                            {item.availableSizes?.map((s) => (
                              <option key={s.size} value={s.size}>
                                {s.size} (เหลือ {s.quantity})
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-4">
                          <div className="flex items-center justify-center">
                            <button
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.productId,
                                  item.size,
                                  item.quantity - 1
                                )
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="text"
                              value={item.quantity}
                              className="w-12 h-8 text-center border-t border-b border-gray-300"
                              readOnly
                            />
                            <button
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.productId,
                                  item.size,
                                  item.quantity + 1
                                )
                              }
                              disabled={
                                item.quantity >=
                                (item.availableSizes.find(
                                  (s) => s.size === item.size
                                )?.quantity || Infinity)
                              }
                              title={
                                item.quantity >=
                                (item.availableSizes.find(
                                  (s) => s.size === item.size
                                )?.quantity || Infinity)
                                  ? "ไม่สามารถเพิ่มเกินจำนวนคงเหลือ"
                                  : ""
                              }
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end">
                            <span className="font-medium">
                              {formatPrice(item.priceAtAdded * item.quantity)}
                            </span>
                            <button
                              className="ml-4 text-gray-400 hover:text-red-500 transition-colors"
                              onClick={() =>
                                handleRemoveItem(item.productId, item.size)
                              }
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
              <Link
                href="/product"
                className="text-gold-600 hover:text-gold-700 transition-colors flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                เลือกซื้อสินค้าต่อ
              </Link>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="flex gap-2 items-center text-lg font-medium mb-4 text-brown-800">
                  <Banknote className="w-6 h-6 text-yellow-500" />
                  สรุปยอดสั่งซื้อ
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>ราคาสินค้า</span>
                    <span>{formatPrice(subtotal)} บาท</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ค่าจัดส่ง</span>
                    <span>{formatPrice(shipping)} บาท</span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between font-medium">
                    <span>รวมทั้งสิ้น</span>
                    <span>{formatPrice(total)} บาท</span>
                  </div>
                </div>

                <Button
                  variant="luxury"
                  size="lg"
                  className="w-full mt-6"
                  onClick={handleProceedToCheckout}
                  disabled={selectedCartItems.length === 0}
                >
                  สั่งซื้อสินค้า
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-display font-medium text-gray-900 mb-2">
            ไม่มีสินค้าในตะกร้า
          </h2>
          <p className="text-gray-600 mb-8">
            คุณยังไม่มีสินค้าในตะกร้าสินค้าของคุณ
          </p>
          <Button variant="luxury" size="lg" asChild>
            <Link href="/product">เลือกซื้อสินค้า</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
