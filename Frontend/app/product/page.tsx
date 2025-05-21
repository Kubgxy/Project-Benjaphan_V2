"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { categories } from "@/lib/data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Product, AvailableSize } from "@/lib/types";
import { getBaseUrl } from "@/lib/api";

// 🟢 สร้าง Function แปลง Product → ProductCardProps
const mapProductToCardProduct = (product: Product) => ({
  id_product: product.id_product,
  _id: product._id,
  name: product.name,
  price: product.price,
  description: product.description,
  images: product.images,
  details: product.details || [],
  features: [],
  formattedPrice: `฿${product.price.toFixed(2)}`,
  isNewArrival: product.isNewArrival,
  isBestseller: product.isBestseller,
  isOnSale: product.isOnSale,
  category: product.category,
  rating: product.rating ?? 0,
  reviews: product.reviews ?? 0,
  isNew: product.isNewArrival || false,
  materials: product.materials || [],
  stock: product.availableSizes
    ? product.availableSizes.reduce(
        (sum: number, size: AvailableSize) => sum + size.quantity,
        0
      )
    : 0,
  availableSizes: product.availableSizes,
  availableColors: product.availableColors,
});

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams?.get("category");
  const sortOption = searchParams?.get("sort") || "featured";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ ดึงสินค้าทั้งหมดจาก API จริง
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `${getBaseUrl()}/api/product/getAllProducts`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        console.log("Fetched products:", data.products); // Debugging line
        if (response.ok) {
          setProducts(data.products);
        } else {
          console.error("Error loading products:", data.message);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ Filter by category
  let filteredProducts = categoryFilter
    ? products.filter((product) => product.category === categoryFilter)
    : products;

  // ✅ Sort products
  switch (sortOption) {
    case "price-low-high":
      filteredProducts = [...filteredProducts].sort(
        (a, b) => a.price - b.price
      );
      break;
    case "price-high-low":
      filteredProducts = [...filteredProducts].sort(
        (a, b) => b.price - a.price
      );
      break;
    case "newest":
      filteredProducts = filteredProducts.filter(
        (product) => product.isNewArrival
      );
      break;
    case "bestselling":
      filteredProducts = filteredProducts.filter(
        (product) => product.isBestseller
      );
      break;
    default:
      // 🟢 ✅ เพิ่ม logic นี้เฉพาะตอน featured ให้ chaloms ขึ้นก่อน และ buddha ต่อมา
      filteredProducts = [...filteredProducts].sort((a, b) => {
        const getPriority = (category: Product["category"]) => {
          if (category === "chaloms") return 1;
          if (category === "jakkraphat") return 2;
          return 3;
        };

        const priorityA = getPriority(a.category);
        const priorityB = getPriority(b.category);

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        return 0;
      });
      break;
  }

  const currentCategory = categoryFilter
    ? categories.find((cat) => cat.slug === categoryFilter)?.name
    : "สินค้าทั้งหมด";

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />

      {/* Hero Banner */}
      <div className="relative bg-gold-600 text-white py-16">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl font-display font-medium text-center mb-4">
            {currentCategory || "สินค้าทั้งหมด"}
          </h1>
          <p className="text-center text-white/90 max-w-2xl mx-auto">
            เครื่องประดับทองคำแท้คุณภาพสูง
            ออกแบบเพื่อความเป็นสิริมงคลและเสริมดวงชะตา
          </p>
        </div>
        <div className="absolute inset-0 opacity-15 lotus-pattern"></div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          {/* Filter Button - Mobile Only */}
          <button className="md:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-md shadow-sm border border-gold-200">
            <Filter className="h-4 w-4 text-gold-600" />
            <span className="text-brown-800">กรองสินค้า</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-gold-600" />
            <span className="text-brown-800 font-medium">จัดเรียง:</span>
            <select
              className="border border-gold-200 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              value={sortOption}
              onChange={(e) => {
                const url = new URL(window.location.href);
                url.searchParams.set("sort", e.target.value);
                window.location.href = url.toString();
              }}
            >
              <option value="featured">แนะนำ</option>
              <option value="price-low-high">ราคา: ต่ำไปสูง</option>
              <option value="price-high-low">ราคา: สูงไปต่ำ</option>
              <option value="newest">สินค้าใหม่</option>
              <option value="bestselling">สินค้าขายดี</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
          {/* Mobile Dropdown */}
          <div className="md:hidden mb-4">
            <select
              className="w-full border border-gold-300 rounded px-4 py-2"
              value={categoryFilter || "all"}
              onChange={(e) => {
                const selected = e.target.value;
                const url = new URL(window.location.href);
                if (selected === "all") {
                  url.searchParams.delete("category");
                } else {
                  url.searchParams.set("category", selected);
                }
                window.location.href = url.toString();
              }}
            >
              <option value="all">ทั้งหมด</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Tabs */}
          <Tabs
            defaultValue={categoryFilter || "all"}
            className="w-full hidden md:block"
          >
            <TabsList className="w-full flex gap-2 flex-wrap justify-start mb-4 pb-2 bg-cream-50 p-1 rounded-md">
              <TabsTrigger
                value="all"
                className="px-4 py-2 whitespace-nowrap data-[state=active]:bg-gold-600 data-[state=active]:text-white"
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.delete("category");
                  window.location.href = url.toString();
                }}
              >
                ทั้งหมด
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.slug}
                  className="px-4 py-2 whitespace-nowrap data-[state=active]:bg-gold-600 data-[state=active]:text-white"
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set("category", category.slug);
                    window.location.href = url.toString();
                  }}
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Show products */}
        {loading ? (
          <p className="text-center text-brown-800">กำลังโหลดสินค้า...</p>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id_product}
                product={mapProductToCardProduct(product)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-cream-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-gold-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-display font-medium text-brown-800 mb-2">
              ไม่พบสินค้า
            </h2>
            <p className="text-brown-600 mb-6">
              ขออภัย เราไม่พบสินค้าที่ตรงกับเงื่อนไขการค้นหาของคุณ
              โปรดลองเลือกหมวดหมู่อื่นหรือตัวเลือกการกรองอื่น
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
