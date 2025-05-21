import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AccountContent } from "./account-content"

export default function AccountPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <AccountContent />
      <Footer />
    </div>
  )
}

