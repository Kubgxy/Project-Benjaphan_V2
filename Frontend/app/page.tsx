"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { categories, testimonials } from "@/lib/data";
import type { Product } from "@/lib/types";
import { getBaseUrl } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

export default function Home() {
  // Get featured products from our mock data
  const [newProducts, setNewProducts] = useState<Product[]>([]); // ✅ สร้าง state
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [loadingBestsellers, setLoadingBestsellers] = useState(true);
  const featuredCategories = categories.filter(
    (cat) =>
      ["chaloms", "bracelets", "bencharm"].includes(cat.slug) && cat.featured
  );
  const [email, setEmail] = useState("");
  const featuredTestimonials = testimonials.slice(0, 3);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: false,
    slides: {
      perView: 3,
      spacing: 20,
    },
    breakpoints: {
      "(max-width: 768px)": {
        slides: { perView: 1 },
      },
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [dotCount, setDotCount] = useState(0);

  const [bannerContent, setBannerContent] = useState<{
    bannerTitle: string;
    bannerSubtitle: string;
    bannerDescription: string;
    bannerImage: string;
  } | null>(null);

  useEffect(() => {
    const fetchHomepageContent = async () => {
      try {
        const res = await axios.get(`${getBaseUrl()}/api/setting/getHomepage`);
        const data = res.data.homepage;
        setBannerContent(data);
      } catch (err) {
        console.error("Failed to fetch homepage content", err);
      }
    };

    fetchHomepageContent();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (instanceRef.current) {
        const totalSlides = instanceRef.current.track.details.slides.length;
        const isMobile = window.innerWidth <= 768;
        const perView = isMobile ? 1 : 3;
        setDotCount(Math.ceil(totalSlides / perView));
      }
    }, 100); // ❗ delay นิดหน่อยให้ slider init เสร็จ

    return () => clearTimeout(timer);
  }, [bestsellers]);

  const fetchNewProducts = async () => {
    try {
      const response = await fetch(
        `${getBaseUrl()}/api/product/getNewProducts`
      );
      const data = await response.json();
      setNewProducts(data.products); // ✅ เซ็ตข้อมูลที่ได้มาเข้า state
    } catch (error) {
      console.error("Error fetching new products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewProducts(); // ✅ ดึงข้อมูลตอน mount
  }, []);

  const fetchBestsellers = async () => {
    try {
      const response = await fetch(
        `${getBaseUrl()}/api/product/getBestsellerProducts`
      );
      const data = await response.json();
      setBestsellers(data.products);
    } catch (error) {
      console.error("Error fetching bestsellers:", error);
    } finally {
      setLoadingBestsellers(false);
    }
  };

  useEffect(() => {
    fetchBestsellers();
  }, []);

  const handleSubscribe = async () => {
    if (!email) {
      toast({ title: "❌ กรุณากรอกอีเมล", variant: "destructive" });
      return;
    }

    try {
      await axios.post(
        `${getBaseUrl()}/api/user/subscribeNewsletter`,
        { email },
        { withCredentials: true }
      );
      toast({ title: "✅ สมัครสมาชิกสำเร็จ" });
      setEmail(""); // clear input
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast({ title: "❗️คุณสมัครเป็นสมาชิกแล้ว" });
      } else if (error?.response?.status === 401) {
        toast({ title: "❌ กรุณาเข้าสู่ระบบก่อน", variant: "destructive" });
      } else {
        toast({ title: "❌ สมัครไม่สำเร็จ", variant: "destructive" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />
      {/* Hero Section */}
      <section className="relative w-full min-h-[60vh] sm:min-h-[70vh] md:min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src={
              bannerContent?.bannerImage
                ? `${getBaseUrl()}/${bannerContent.bannerImage}`
                : "/bg/ChatGPT Image 30 เม.ย. 2568 05_00_23.png"
            }
            alt="หน้าแรก"
            fill
            className="object-cover object-center sm:object-top"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>

        {/* ตรงนี้ค่อยใส่ container ข้างใน ไม่ล้อมทั้ง section */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 text-center sm:text-left max-w-screen-xl mx-auto ">
          <h1 className="text-3xl text-gold-600 sm:text-4xl md:text-6xl font-charm font-semibold mb-6 leading-tight">
            {bannerContent?.bannerTitle || "เบญจภัณฑ์ ๕"}
          </h1>
          <h2 className="text-2xl font-charm sm:text-3xl md:text-4xl text-gold-600 mb-6 leading-tight">
            {bannerContent?.bannerSubtitle ||
              "ของดีมีศรัทธา เสริมบุญหนา วาสนาเปล่งประกาย"}
          </h2>
          <p className="text-base font-charm sm:text-lg mb-6 text-white/90 font-light">
            {bannerContent?.bannerDescription ||
              "เปล่งประกายทั้งภายนอกและภายใน เสริมโชคลาภ ดึงดูดความสำเร็จ ให้ชีวิตงดงามทุกก้าว"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
            <Button
              variant="default"
              size="lg"
              className="bg-gold-600 hover:bg-gold-700 text-base"
              asChild
            >
              <Link href="/product">ดูสินค้าทั้งหมด</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base bg-transparent text-white border-white hover:bg-white/10"
              asChild
            >
              <Link href="/auspicious">เครื่องประดับมงคล</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ส่วนแสดงจุดเด่น */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="relative w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center mb-4">
                <Image
                  src="/icons/ทองคำแท้.png"
                  alt="ทองคำแท้"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <h3 className="text-xl font-heading font-medium text-brown-800 mb-2">
                ทองคำแท้ 100%
              </h3>
              <p className="text-brown-600">
                เครื่องประดับทองคำแท้คุณภาพสูง ผ่านการรับรองมาตรฐาน
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="relative w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center mb-4">
                <Image
                  src="/icons/เสริมดวงชะตา.png"
                  alt="เสริมดวง"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <h3 className="text-xl font-heading font-medium text-brown-800 mb-2">
                เสริมดวงชะตา
              </h3>
              <p className="text-brown-600">
                ออกแบบตามหลักโหราศาสตร์ เพื่อเสริมดวงและความเป็นสิริมงคล
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="relative w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center mb-4">
                <Image
                  src="/icons/งานฝีมือประณีต.png"
                  alt="งานฝีมือ"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <h3 className="text-xl font-heading font-medium text-brown-800 mb-2">
                งานฝีมือประณีต
              </h3>
              <p className="text-brown-600">
                ผลิตโดยช่างทองฝีมือดี มีประสบการณ์มากกว่า 30 ปี
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 lotus-pattern">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-medium text-brown-800 mb-4">
              หมวดหมู่สินค้า
            </h2>
            <p className="text-brown-600 max-w-4xl mx-auto">
              เลือกชมเครื่องประดับทองคำแท้คุณภาพสูง
              ออกแบบด้วยความประณีตและใส่ใจในทุกรายละเอียด
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:ml-[280px] gap-8 items-center justify-center px-4 md:px-0 mx-auto">
            {featuredCategories.map((category) => (
              <Link
                key={category.id}
                href={`/product?category=${category.slug}`}
                className="group"
              >
                <div className="relative h-80 w-full overflow-hidden rounded-lg shadow-md">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent group-hover:from-black/80 transition-all duration-300"></div>
                  <div className="absolute inset-0 flex items-end justify-center p-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-display font-medium text-white mb-2">
                        {category.name}
                      </h3>
                      <span className="inline-block px-4 py-2 border border-gold-400 text-gold-100 text-sm uppercase tracking-wider group-hover:bg-gold-600 group-hover:border-gold-600 transition-colors duration-300">
                        ดูสินค้า
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-medium text-brown-800 mb-4">
                สินค้ามาใหม่
              </h2>
              <p className="text-brown-600 max-w-2xl">
                เครื่องประดับทองคำแท้รุ่นใหม่ล่าสุด ออกแบบตามหลักโหราศาสตร์
                เสริมดวงชะตา
              </p>
            </div>
            <Link
              href="/product"
              className="hidden md:flex items-center text-gold-600 hover:text-gold-700 transition-colors"
            >
              <span className="mr-2">ดูทั้งหมด</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              <p>กำลังโหลดสินค้ามาใหม่...</p> // ✅ ใส่ loading (optional)
            ) : newProducts.length > 0 ? (
              newProducts.map((product) => {
                const productWithId = {
                  ...product,
                  id: product.id_product, // ✅ เปลี่ยนจาก _id → id_product ที่ backend ใช้จริง
                };
                return (
                  <ProductCard
                    key={product.id_product}
                    product={productWithId}
                    featured
                  />
                );
              })
            ) : (
              <p>ยังไม่มีสินค้ามาใหม่ตอนนี้</p> // ✅ กรณีไม่มีสินค้า
            )}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button
              variant="outline"
              className="border-gold-600 text-gold-600 hover:bg-gold-50"
              asChild
            >
              <Link href="/product?sort=newest">ดูสินค้าทั้งหมด</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Collection - เครื่องประดับมงคล */}
      <section className="py-20 bg-cream-50 thai-pattern">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-64 md:h-[600px] rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/production1.jpg"
                alt="เครื่องประดับมงคล"
                fill
                className="object-cover"
              />
            </div>
            <div className="max-w-lg">
              <h2 className="mt-4 text-3xl md:text-4xl font-heading font-medium text-brown-800 mb-6">
                เครื่องประดับมงคลเสริมดวงชะตา
              </h2>
              <p className="text-brown-600 mb-8 indent-paragraph">
                เครื่องประดับทองคำแท้ที่ออกแบบตามหลักโหราศาสตร์ไทย
                ช่วยเสริมดวงชะตา เสริมพลังมงคล และปกป้องคุ้มครองผู้สวมใส่
                เหมาะสำหรับเป็นของขวัญในโอกาสพิเศษ
              </p>
              <Button
                variant="default"
                size="lg"
                className="bg-gold-600 hover:bg-gold-700"
                asChild
              >
                <Link href="/auspicious">รายละเอียดเพิ่มเติม</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Bestsellers Section */}
      {bestsellers.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-medium text-brown-800 mb-4">
                สินค้าขายดี
              </h2>
              <p className="text-brown-600 max-w-2xl mx-auto">
                เครื่องประดับทองคำแท้ยอดนิยม
                ที่ลูกค้าให้ความไว้วางใจเลือกซื้อมากที่สุด
              </p>
            </div>

            {bestsellers.length <= 3 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bestsellers.map((product) => {
                  const productWithId = {
                    ...product,
                    id: product.id_product,
                  };
                  return (
                    <ProductCard
                      key={product.id_product}
                      product={productWithId}
                    />
                  );
                })}
              </div>
            ) : (
              <>
                <div ref={sliderRef} className="keen-slider">
                  {bestsellers.map((product) => {
                    const productWithId = {
                      ...product,
                      id: product.id_product,
                    };
                    return (
                      <div
                        key={product.id_product}
                        className="keen-slider__slide"
                      >
                        <ProductCard product={productWithId} />
                      </div>
                    );
                  })}
                </div>
                {dotCount > 1 && (
                  <div className="flex justify-center mt-4 gap-2">
                    {Array.from({ length: dotCount }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          instanceRef.current?.moveToIdx(idx, true)
                        }
                        className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                          currentSlide === idx
                            ? "bg-gold-600"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* คุณค่าของแบรนด์ */}
      <section className="py-20 bg-cream-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-8 border-t-4 border-gold-600 hover:transform hover:-translate-y-1 transition-transform duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-gold-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-medium text-brown-800 mb-2 text-center">
                ทองคำแท้ 100%
              </h3>
              <p className="text-brown-600 text-center">
                เครื่องประดับทองคำแท้คุณภาพสูง ผ่านการรับรองมาตรฐาน
                มั่นใจได้ในคุณภาพ
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-8 border-t-4 border-gold-600 hover:transform hover:-translate-y-1 transition-transform duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-gold-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-medium text-brown-800 mb-2 text-center">
                รับประกันตลอดชีพ
              </h3>
              <p className="text-brown-600 text-center">
                เรารับประกันคุณภาพสินค้าตลอดชีพ
                มั่นใจได้ในคุณภาพและความคงทนของเครื่องประดับ
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-8 border-t-4 border-gold-600 hover:transform hover:-translate-y-1 transition-transform duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-gold-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-medium text-brown-800 mb-2 text-center">
                ชำระเงินปลอดภัย
              </h3>
              <p className="text-brown-600 text-center">
                ระบบชำระเงินที่ปลอดภัย หลากหลายช่องทาง
                พร้อมบริการจัดส่งฟรีทั่วประเทศ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gold-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-medium mb-4">
            รับข่าวสารและโปรโมชั่น
          </h2>
          <p className="mt-4 max-w-xl mx-auto mb-8">
            ลงทะเบียนเพื่อรับข่าวสาร โปรโมชั่นพิเศษ และสิทธิพิเศษสำหรับสมาชิก
          </p>
          <div className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="อีเมลของคุณ"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 text-brown-800 focus:outline-none rounded-l-md"
            />
            <button
              onClick={handleSubscribe}
              className="px-6 py-3 bg-brown-800 text-white font-medium hover:bg-brown-900 transition-colors rounded-r-md"
            >
              สมัคร
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
