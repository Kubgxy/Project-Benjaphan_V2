import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductDetail } from "./product-detail";

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />
      {/* ✅ ส่งแค่ id ไปให้ ProductDetail ทำงานฝั่ง client */}
      <ProductDetail id={id} />
      <Footer />
    </div>
  );
}
