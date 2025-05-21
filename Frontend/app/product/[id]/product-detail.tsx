"use client";

import { useState, useEffect, Fragment } from "react";
import Head from "next/head";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Star,
  Minus,
  Plus,
  Check,
} from "lucide-react";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { mapProductToCardProduct } from "@/lib/product";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import ShareProductButton from "@/components/ShareProductButton";
import { getBaseUrl } from "@/lib/api";

interface Props {
  id: string;
}

export function ProductDetail({ id }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const { toast } = useToast();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isInWishlist, setIsInWishlist] = useState(false);

  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  interface Review {
    userId?: { firstName: string; lastName: string; avatar: string };
    productId: string;
    rating: number;
    comment: string;
  }

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewComment, setReviewComment] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  const availableStock = product?.availableSizes?.find(
    (sizeObj) => sizeObj.size === selectedSize
  )?.quantity ?? 0;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(`${getBaseUrl()}/api/user/me`, {
          withCredentials: true,
        });
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${getBaseUrl()}/api/product/getOneProducts/${id}`, {
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok || !data.product) {
          router.push("/404");
          return;
        }

        const parsedProduct = {
          ...data.product,
          id: data.product.id_product,
          formattedPrice: `฿${data.product.price.toFixed(2)}`,
          isNew: data.product.isNewArrival || false,
          materials: data.product.materials || [],
          features: data.product.features || [],
        };

        const parsedRelated = (data.relatedProducts || []).map((item: any) => ({
          ...item,
          id: item.id_product,
          formattedPrice: `฿${item.price.toFixed(2)}`,
          isNew: item.isNewArrival || false,
          materials: item.materials || [],
          features: item.features || [],
        }));

        setProduct(parsedProduct);
        setRelatedProducts(parsedRelated);
        setLoading(false);
      } catch (error) {
        console.error("❌ Fetch failed:", error);
        router.push("/404");
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product) return;
    const selected = product.availableSizes?.find(
      (sizeObj) => sizeObj.size === selectedSize
    );
    setQuantity(selected?.quantity ? 1 : 0);
  }, [selectedSize, product]);

  const incrementQuantity = () => {
    if (quantity < availableStock) setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleAddToCart = async () => {
    if (!selectedSize || !product) {
      toast({ title: "⚠️ กรุณาเลือกขนาดสินค้า", variant: "destructive" });
      return;
    }

    if (isAddingToCart) return;
    setIsAddingToCart(true);

    try {
      await axios.post(
        `${getBaseUrl()}/api/cart/addToCart`,
        {
          productId: product.id_product,
          quantity,
          size: selectedSize,
        },
        { withCredentials: true }
      );

      if (quantity > availableStock) {
        toast({ title: "❌ จำนวนเกินสต็อก", variant: "destructive" });
        return;
      }

      setAddedToCart(true);
      toast({ title: "✅ เพิ่มสินค้าลงตะกร้าสำเร็จ!" });

      setTimeout(() => setAddedToCart(false), 3000);
    } catch (error: any) {
      console.error("❌ Error adding to cart:", error);
      if (error.response?.status === 401) {
        setShowLoginModal(true);
        return;
      }
      toast({
        title: "❌ ไม่สามารถเพิ่มลงตะกร้าได้",
        description: error.response?.data?.message || "โปรดลองอีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const fetchProductReviews = async (page = 1) => {
    if (!product) return;
    try {
      const res = await axios.get(
        `${getBaseUrl()}/api/review/getReviews/${product._id}?page=${page}&limit=${reviewsPerPage}`
      );
      setReviews(res.data.reviews);
      setTotalReviews(res.data.totalReviews);
      setCurrentPage(res.data.currentPage);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    if (product) fetchProductReviews();
  }, [product?._id]);

  const fetchAverageRating = async () => {
    if (!product) return;
    try {
      const res = await axios.get(`${getBaseUrl()}/api/review/average/${product._id}`);
      setAverageRating(res.data.averageRating);
      setTotalReviews(res.data.totalReviews);
    } catch (error) {
      console.error("Error fetching average rating:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && product) {
      fetchAverageRating();
      fetchUserRating();
    } else if (product) {
      fetchAverageRating();
    }
  }, [product?._id, isLoggedIn]);

  const fetchUserRating = async () => {
    if (!product || !isLoggedIn) return;
    try {
      const res = await axios.get(`${getBaseUrl()}/api/review/user-rating/${product._id}`, {
        withCredentials: true,
      });
      setSelectedRating(res.data.rating);
    } catch (error) {
      console.error("ไม่สามารถโหลดคะแนนของผู้ใช้ได้", error);
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!product || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await axios.post(
        `${getBaseUrl()}/api/review/addReview`,
        { productId: product._id, rating, comment },
        { withCredentials: true }
      );
      toast({ title: "✅ ขอบคุณสำหรับรีวิว!" });
      setReviewComment("");
      fetchAverageRating();
      fetchProductReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWishlist = async () => {
    if (!product) return;

    if (!isLoggedIn) {
    setShowLoginModal(true);
    return;
  }

    try {
      const url = isInWishlist
        ? `${getBaseUrl()}/api/wishlist/removeFromWishlist`
        : `${getBaseUrl()}/api/wishlist/addToWishlist`;

      await axios.post(url, { productId: product._id }, { withCredentials: true });

      toast({
        title: isInWishlist ? "💔 ลบออกจากรายการโปรดแล้ว" : "❤️ เพิ่มลงในรายการโปรดแล้ว",
        duration: 3000,
      });
      setIsInWishlist(!isInWishlist);
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  if (loading || !product) {
    return <div className="py-10 text-center">⏳ กำลังโหลดสินค้า...</div>;
  }

  return (
    <Fragment>
      <Head>
        <title>{product.name} | ร้านเบญจภัณฑ์๕</title>
        <meta name="description" content={product.description} />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
        <meta
          property="og:image"
          content={`${getBaseUrl()}${product.images[0]}`} // ✅ เปลี่ยน domain เป็นของจริงตอน deploy
        />
        <meta
          property="og:url"
          content={`${getBaseUrl()}/product/${product.id_product}`} // ✅ เปลี่ยน domain เป็นของจริงตอน deploy
        />
        <meta property="og:type" content="product" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.name} />
        <meta name="twitter:description" content={product.description} />
        <meta
          name="twitter:image"
          content={`${getBaseUrl()}${product.images[0]}`} // ✅ เปลี่ยน domain เป็นของจริงตอน deploy
        />
      </Head>

      <div className="container mx-auto px-4 py-12">
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow max-w-sm w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                onClick={() => setShowLoginModal(false)}
              >
                ✖
              </button>

              <h2 className="text-xl font-semibold mb-4 text-center">
                กรุณาเข้าสู่ระบบก่อนจะทำรายการ
              </h2>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await axios.post(
                      `${getBaseUrl()}/api/user/loginUser`,
                      {
                        email: loginEmail,
                        password: loginPassword,
                      },
                      { withCredentials: true }
                    );

                    console.log("✅ Login success! Reloading now...");

                    toast({
                      title: "✅ เข้าสู่ระบบสำเร็จ!",
                      description: "กำลังโหลดหน้าใหม่...",
                    });

                    setShowLoginModal(false);
                    window.location.reload(); // 🔥 ตรงนี้
                  } catch (error: any) {
                    toast({
                      title: "❌ เข้าสู่ระบบล้มเหลว",
                      description:
                        error.response?.data?.message ||
                        "กรุณาตรวจสอบอีเมลหรือรหัสผ่าน",
                      variant: "destructive",
                    });
                  }
                }}
                className="space-y-4"
              >
                <input
                  type="email"
                  placeholder="อีเมล"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
                <input
                  type="password"
                  placeholder="รหัสผ่าน"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  required
                />

                <Button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  เข้าสู่ระบบ
                </Button>
              </form>

              <p className="mt-4 text-sm text-center text-gray-600">
                หรือ <span className="font-semibold">ยังไม่มีบัญชี?</span>{" "}
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    router.push("/account");
                  }}
                  className="text-yellow-600 hover:underline"
                >
                  สมัครสมาชิกที่นี่
                </button>
              </p>
            </div>
          </div>
        )}

        <Link
          href="/product"
          className="inline-flex items-center text-gray-600 hover:text-gold-600 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          กลับไปยังสินค้าทั้งหมด
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] bg-white">
              <Image
                src={
                  product.images && product.images.length > 0
                    ? `${getBaseUrl()}${product.images[selectedImage]}`
                    : "/placeholder.svg"
                }
                alt={product.name || "Product Image"}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="flex overflow-x-auto gap-2">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className={`relative min-w-[80px] h-24 bg-gray-50 border cursor-pointer ${
                    selectedImage === index
                      ? "border-gold-500"
                      : "border-gray-200"
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={
                      image
                        ? `${getBaseUrl()}${image}`
                        : "/placeholder.svg"
                    }
                    alt={`${product.name} view ${index + 1}`}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-display font-medium text-gray-900 mb-2">
              {product.name}
            </h1>
            <p className="text-2xl font-medium text-gray-900 mb-6">
              {formatPrice(product.price)}
            </p>

            <div className="mb-6">
              <p className="text-gray-600">{product.description}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Details
              </h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                {product.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>

            {product.availableSizes && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.availableSizes.map((sizeObj, index) => (
                    <button
                      key={`${sizeObj.size}-${index}`}
                      className={`h-16 w-16 rounded-full border flex flex-col items-center justify-center text-sm focus:outline-none ${
                        selectedSize === sizeObj.size
                          ? "border-gold-500 bg-gold-50 text-gold-600"
                          : "border-gray-300 hover:border-gold-500"
                      }`}
                      onClick={() => setSelectedSize(sizeObj.size)}
                    >
                      <span>{sizeObj.size}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-900 mb-2">จำนวน</h3>
              <div className="flex items-center">
                <button
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l"
                  onClick={decrementQuantity}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) {
                      if (value >= 1 && value <= availableStock) {
                        setQuantity(value);
                      } else if (value > availableStock) {
                        setQuantity(availableStock);
                      } else {
                        setQuantity(1);
                      }
                    }
                  }}
                  className="w-16 h-10 text-center border-t border-b border-gray-300"
                />
                <button
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r"
                  onClick={incrementQuantity}
                  disabled={quantity >= availableStock}
                >
                  <Plus className="h-4 w-4" />
                </button>
                <span className="ml-4 text-sm text-gray-600">
                  คงเหลือ {availableStock} ชิ้น
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4  mb-6">
              <Button
                variant="luxury"
                size="lg"
                className="flex-1 pt-2 pb-2"
                onClick={handleAddToCart}
                disabled={
                  !selectedSize || availableStock === 0 || quantity === 0
                }
              >
                เพิ่มลงตะกร้า
              </Button>
              <Button
                variant={isInWishlist ? "outline" : "luxuryOutline"}
                size="lg"
                className={`sm:w-auto ${
                  isInWishlist
                    ? "text-red-500 border-red-500 hover:bg-red-50"
                    : ""
                }`}
                onClick={handleWishlist}
              >
                <Heart
                  className={`h-5 w-5 ${isInWishlist ? "fill-red-500" : ""}`}
                />
              </Button>

              <ShareProductButton product={product} />
            </div>
            {/* ⭐⭐⭐⭐⭐ ให้คะแนน + คอมเมนต์ */}
            <div className="mb-4">
              <textarea
                className="w-full border p-2 rounded"
                placeholder="เขียนรีวิวของคุณ..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>
            <div className="flex items-center mb-4">
              <span className="text-sm text-gray-700 mr-2">
                ให้คะแนนสินค้า:
              </span>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  onClick={() => {
                    if (!isLoggedIn) {
                      setShowLoginModal(true);
                      return; // ❌ อย่าให้มันทำต่อ
                    }

                    setSelectedRating(star);
                    if (reviewComment.trim() === "") {
                      if (!isSubmitting) {
                        handleSubmitReview(star, "");
                      }
                    }
                  }}
                  className={`h-6 w-6 cursor-pointer transition-all ${
                    star <= selectedRating
                      ? "fill-gold-500 text-gold-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-700">
                {averageRating.toFixed(1)} / 5 ({totalReviews} รีวิว)
              </span>
              {selectedRating > 0 && (
                <p className="text-green-600 text-sm ml-4">
                  (คุณให้คะแนนไปแล้ว {selectedRating} ดาว ขอบคุณครับ ❤️)
                </p>
              )}
            </div>
            <Button
              variant="luxury"
              size="lg"
              className="mt-4"
              onClick={() => handleSubmitReview(selectedRating, reviewComment)}
              disabled={
                isSubmitting ||
                selectedRating === 0 || // ต้องมีดาว
                reviewComment.trim() === "" // ต้องมีคอมเมนต์ (เพราะปุ่มนี้ไว้ส่งคอมเมนต์)
              }
            >
              ส่งรีวิว
            </Button>
            {selectedRating > 0 && (
              <p className="text-green-600 text-sm mb-4">
                คุณให้คะแนนไปแล้ว {selectedRating} ดาว ขอบคุณครับ ❤️
              </p>
            )}

            {addedToCart && (
              <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-md flex items-center mb-6">
                <Check className="h-5 w-5 mr-2" />
                เพิ่มลงตะกร้าเรียบร้อยแล้ว
              </div>
            )}
          </div>
        </div>

      {/* รีวิวทั้งหมด */}
      <div className="mt-16">
        <h3 className="text-lg font-medium mb-4">
          รีวิวทั้งหมด ({reviews.length})
        </h3>
        <div className="space-y-4">
          {reviews.map((r, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg shadow"
            >
              {/* Avatar ตัวอักษรแรกของชื่อ */}
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                {r.userId?.avatar ? (
                  // ใช้ avatar ถ้ามี
                  <Image
                    src={
                      r.userId?.avatar
                        ? r.userId.avatar.startsWith("http") // ถ้าเป็น full URL แล้ว
                          ? r.userId.avatar
                          : `${getBaseUrl()}/${r.userId.avatar.replace(/^\/+/, "")}` // ลบ / ซ้ำออก
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(r.userId?.firstName || "User")}`
                    }
                    alt="User Avatar"
                    width={100}
                    height={100}
                    className="rounded-full"
                  />
                ) : (
                  // ถ้าไม่มี avatar ให้ใช้ตัวอักษรแรกของชื่อ
                  <span className="text-white font-bold">
                    {r.userId?.firstName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

                {/* ข้อมูลรีวิว */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-800">
                      {r.userId?.firstName} {r.userId?.lastName}
                    </span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= r.rating
                              ? "fill-gold-500 text-gold-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {r.comment || "ไม่มีข้อความรีวิว"}
                  </p>
                </div>
              </div>
            ))}
            <div className="flex justify-end mt-8">
              <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded shadow">
                <button
                  className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                  onClick={() => fetchProductReviews(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ก่อนหน้า
                </button>
                <span className="text-sm text-gray-600">
                  หน้า {currentPage} /{" "}
                  {Math.ceil(totalReviews / reviewsPerPage)}
                </span>
                <button
                  className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                  onClick={() => fetchProductReviews(currentPage + 1)}
                  disabled={
                    currentPage === Math.ceil(totalReviews / reviewsPerPage)
                  }
                >
                  ถัดไป
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {product.features && product.features.length > 0 && (
            <div className="mt-16 grid md:grid-cols-3 gap-8">
              {product.features.map((feature, index) => (
                <div
                  key={index}
                  className="text-center p-6 border border-gray-200"
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gold-50 flex items-center justify-center">
                    <Check className="h-6 w-6 text-gold-600" />
                  </div>
                  <p className="text-gray-800">{feature}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
}
