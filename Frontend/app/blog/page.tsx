"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import AOS from "aos";
import "aos/dist/aos.css";
import { getBaseUrl } from "@/lib/api";

// ✅ ประกาศ Type ของบทความให้ชัดเจน
interface Article {
  _id: string;
  title: string;
  excerpt: string;
  date: string;
  views: number;
  thumbnail: string;
  slug: string;
  author: {
    firstName: string;
    lastName: string;
  };
}

const POSTS_PER_PAGE = 6;

export default function BlogPage() {
  const searchParams = useSearchParams();
  const pageQuery = parseInt(searchParams?.get("page") || "1");
  const [currentPage, setCurrentPage] = useState(pageQuery);
  const [search, setSearch] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(
          `${getBaseUrl()}/api/article/getAllArticle?page=1&limit=100`
        );
        const data = await res.json();
        setArticles(data.articles);
      } catch (err) {
        console.error("❌ Error fetching articles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const filteredPosts = useMemo(() => {
    return articles.filter((post) =>
      post.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, articles]);

  const popularPosts = [...articles]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  const currentPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />

      <section className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-down">
            <h1 className="text-4xl md:text-5xl font-heading font-medium text-brown-800 mb-4">
              บทความ
            </h1>
            <p className="text-brown-600 max-w-2xl mx-auto">
              อัปเดตสินค้ามงคล รีวิวเครื่องประดับ และแนะนำเทรนด์เสริมบุญล่าสุด
            </p>
          </div>

          <div className="mb-10 max-w-xl mx-auto" data-aos="zoom-in">
            <input
              type="text"
              placeholder="ค้นหาบทความ..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gold-200 rounded-md focus:outline-none focus:ring focus:ring-gold-300"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="col-span-full lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPosts.map((post, idx) => (
                <div
                  key={post._id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all"
                  data-aos="fade-up"
                  data-aos-delay={idx * 100}
                >
                  <div className="relative h-52 w-full">
                    {post.thumbnail ? (
                      <Image
                        src={`${getBaseUrl()}/${post.thumbnail}`}
                        alt={`ภาพบทความ: ${post.title}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                        ไม่มีรูปภาพ
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <p className="text-sm text-gold-600 uppercase tracking-wide font-medium mb-1">
                      {post.date}
                    </p>
                    <h2 className="text-lg font-semibold text-brown-800 mb-1">
                      {post.title}
                    </h2>
                    <p className="text-brown-600 text-sm line-clamp-3 mb-2">
                      {post.excerpt}
                    </p>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    {/* 👁️ View count ด้านซ้าย */}
                    <div className="flex items-center gap-1 text-brown-400 text-xs">
                      <span>👁️</span>
                      <span>{post.views.toLocaleString()} ครั้ง</span>
                    </div>
                    {/* ✍️ Author name ด้านขวา */}
                    <div className="flex items-center gap-1 text-brown-500 font-medium text-xs">
                      <span>🖊️</span>
                      <span>{post.author.firstName} {post.author.lastName}</span>
                    </div>
                  </div>
                    <Link
                      href={`/blog/${post.slug}?page=${currentPage}`}
                      className="inline-flex items-center text-gold-600 hover:text-gold-800 transition text-sm"
                    >
                      อ่านเพิ่มเติม <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="lg:pl-6 border-t lg:border-t-0 lg:border-l border-gold-100 pt-6 lg:pt-0"
              data-aos="fade-left"
              data-aos-delay="200"
            >
              <h3 className="text-xl font-semibold text-brown-800 mb-4">
                🔥 บทความยอดฮิต
              </h3>
              <ul className="space-y-4">
                {popularPosts.map((post) => (
                  <li key={post._id}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-gold-700 hover:text-gold-900 font-medium text-sm"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-brown-500">
                      👁️ {post.views.toLocaleString()} ครั้ง
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {totalPages > 1 && (
            <div
              className="flex justify-center mt-12 space-x-2"
              data-aos="fade-up"
            >
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    router.push(`/blog?page=${i + 1}`);
                    setCurrentPage(i + 1);
                    document.documentElement.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  className={`px-4 py-2 border rounded ${
                    currentPage === i + 1
                      ? "bg-gold-600 text-white"
                      : "border-gold-600 text-gold-600 hover:bg-gold-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          <div className="text-center mt-16" data-aos="zoom-in">
            <Button
              variant="outline"
              className="border-gold-600 text-gold-600 hover:bg-gold-50"
              asChild
            >
              <Link href="/">ย้อนกลับหน้าแรก</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
