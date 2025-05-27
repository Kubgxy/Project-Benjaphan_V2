// app/checkout/page.tsx
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import CheckoutFormWrapper from "./CheckoutFormWrapper";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <CheckoutFormWrapper />
      <Footer />
    </div>
  );
}