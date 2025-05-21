"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { Search, ShoppingBag, Menu, X, User, Heart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { SearchPopover } from "@/components/search-popover";
import { Product, SearchItem } from "@/lib/types"; // Import the correct type for Product
import { getBaseUrl } from "@/lib/api";

export function Header() {
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchBtnRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await axios.get(
          `${getBaseUrl()}/api/product/getAllProducts`
        ); // ← ดึงข้อมูลจริง
        setProducts(res.data.products);
        console.log("Fetched products:", res.data);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ทำให้ค้นหาแบบ google (พิมพ์แล้วเลือก suggestion หรือ enter ไป search page)
  function handleSearchResult(item: SearchItem) {
    setSearchOpen(false);
    if (!item) return;

    if (item.id === "__search__") {
      router.push(`/search?q=${encodeURIComponent(item.name)}`);
    } else {
      router.push(`/product/${item.productId}`);
    }
  }

  const BACKEND_URL = `${getBaseUrl()}`; // URL ของ backend
  // const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL; // ถ้าใช้ env variable

  // แปลงเป็น SearchItem (ถ้า SearchPopover ใช้ type นี้)
  const searchItems: SearchItem[] = products.map((p) => ({
    id: p._id, // MongoDB _id
    productId: p.id_product, // Bencharm-002
    name: p.name,
    description: p.description,
    image: p.images?.[0] ? `${BACKEND_URL}${p.images[0]}` : "/placeholder.svg",
  }));
  

  return (
    
    <>
      <div className="bg-gold-600 text-white py-2  text-center text-sm font-medium">
        <div className="container mx-auto px-4">
          <p>
            สวัสดีลูกค้าทุกท่าน ยินดีต้อนรับสู่เว็บไซต์เบญจภัณฑ์ ๕ 
          </p>
        </div>
      </div>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white shadow-md py-2" : "bg-cream-50 py-4"
        }`}
      >
        <div className="container mx-auto max-w-screen-xl px-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <Link href="/" className="flex items-center">
              {/* MOBILE: แสดงข้อความ, DESKTOP: แสดงโลโก้รูป */}
              <div className="block sm:hidden">
                <h1 className="text-lg font-charm font-semibold text-gold-600">
                  เบญจภัณฑ์ ๕
                </h1>
              </div>
              <div className="hidden sm:flex items-center">
                <div className="relative h-12 w-12 sm:h-16 sm:w-16 mr-2 sm:mr-3">
                  <Image
                    src="/logo-bencharm.png"
                    alt="เบญจภัณฑ์๕"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-charm font-medium text-gold-600">
                    เบญจภัณฑ์ ๕
                  </h1>
                  <p className="text-xs text-brown-600">
                    ของดีมีศรัทธา เสริมบุญหนา วาสนาเปล่งประกาย
                  </p>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <Link href="/" className="nav-link">
                หน้าแรก
              </Link>
              <Link href="/auspicious" className="nav-link">
                เครื่องประดับมงคล
              </Link>
              <Link href="/product" className="nav-link">
                สินค้าทั้งหมด
              </Link>
              <Link href="/blog" className="nav-link">
                บทความ
              </Link>
              <Link href="/about" className="nav-link">
                เกี่ยวกับเรา
              </Link>
              <Link href="/contact" className="nav-link">
                ติดต่อเรา
              </Link>
            </nav>

            {/* Right Icons */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                ref={searchBtnRef}
                className="icon-btn"
                aria-label="ค้นหา"
                onClick={() => setSearchOpen((s) => !s)}
              >
                <Search className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <Link
                href="/wishlist"
                className="relative icon-btn"
                aria-label="สินค้าที่ชอบ"
              >
                <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
                {wishlistCount > 0 && (
                  <span className="badge">{wishlistCount}</span>
                )}
              </Link>
              <Link
                href="/account"
                className="icon-btn"
                aria-label="บัญชีของฉัน"
              >
                <User className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
              <Link
                href="/cart"
                className="relative icon-btn"
                aria-label="ตะกร้าสินค้า"
              >
                <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
                {itemCount > 0 && <span className="badge">{itemCount}</span>}
              </Link>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden icon-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="เมนู"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200 w-full">
              <nav className="flex flex-col space-y-3 mt-4">
                <Link
                  href="/"
                  className="mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  หน้าแรก
                </Link>
                <Link
                  href="/product"
                  className="mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  สินค้าทั้งหมด
                </Link>
                <Link
                  href="/auspicious"
                  className="mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  เครื่องประดับมงคล
                </Link>
                <Link
                  href="/blog"
                  className="mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  บทความ
                </Link>
                <Link
                  href="/about"
                  className="mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  เกี่ยวกับเรา
                </Link>
                <Link
                  href="/contact"
                  className="mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ติดต่อเรา
                </Link>
                <Link
                  href="/wishlist"
                  className="mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  สินค้าที่ชอบ
                </Link>
                <Link
                  href="/account"
                  className="mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {isAuthenticated
                    ? "บัญชีของฉัน"
                    : "เข้าสู่ระบบ / สมัครสมาชิก"}
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Search Slide Down (right side, under search icon) */}
      <SearchPopover
        isOpen={searchOpen}
        anchorRef={searchBtnRef}
        onClose={() => setSearchOpen(false)}
        products={searchItems}
        onResultClick={handleSearchResult}
      />
    </>
  );
}
