import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckoutForm } from "./checkout-form"

export default function CheckoutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <CheckoutForm />
      <Footer />
    </div>
  )
}

