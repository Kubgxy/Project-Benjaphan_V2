import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-6xl font-display font-medium text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-medium text-gray-800 mb-6">Page Not Found</h2>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Button variant="luxury" size="lg" asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>

      <Footer />
    </div>
  )
}

