import dynamic from "next/dynamic";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

// ใช้ dynamic import สำหรับ CheckoutForm และปิด SSR
const CheckoutForm = dynamic(() => import("./checkout-form").then((mod) => mod.CheckoutForm), {
  ssr: false,
});

export default function CheckoutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <CheckoutForm />
      <Footer />
    </div>
  );
}