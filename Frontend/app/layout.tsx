import type React from "react"
import type { Metadata } from "next"
import { Sarabun, Mitr, Prompt } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/context/cart-context"
import { WishlistProvider } from "@/context/wishlist-context"
import { AuthProvider } from "@/context/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { Charmonman } from "next/font/google"

const charmonman = Charmonman({
  subsets: ["latin", "thai"],
  display: "swap",
  variable: "--font-charmonman",
  weight: ["400", "700"],
})



// ฟอนต์หลักสำหรับเนื้อหา - Sarabun เป็นฟอนต์ไทยที่อ่านง่ายและดูเรียบหรู
const sarabun = Sarabun({
  subsets: ["latin", "thai"],
  display: "swap",
  variable: "--font-sarabun",
  weight: ["300", "400", "500", "600", "700"],
})

// ฟอนต์สำหรับหัวข้อ - Mitr เป็นฟอนต์ไทยที่ดูทันสมัยและมีความเป็นเอกลักษณ์
const mitr = Mitr({
  subsets: ["latin", "thai"],
  display: "swap",
  variable: "--font-mitr",
  weight: ["300", "400", "500", "600", "700"],
})

// ฟอนต์สำหรับเน้นความสำคัญ - Prompt เป็นฟอนต์ไทยที่ดูหรูหราและมีสไตล์
const prompt = Prompt({
  subsets: ["latin", "thai"],
  display: "swap",
  variable: "--font-prompt",
  weight: ["300", "400", "500", "600", "700"],
})

// อัปเดตข้อมูล metadata ให้สะท้อนถึงแบรนด์
export const metadata: Metadata = {
  title: "เบญจภัณฑ์ ๕ ",
  description: "เบญจภัณฑ์๕ ร้านทองและเครื่องประดับมงคล คัดสรรเครื่องประดับทองคำแท้คุณภาพสูง ออกแบบเพื่อความเป็นสิริมงคลและเสริมดวงชะตา",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <link rel="icon" href="/logo-bencharm.png" sizes="any" /> 
      <body className={`${sarabun.variable} ${mitr.variable} ${prompt.variable} ${charmonman.variable} font-sans bg-cream-50`}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
              <Toaster />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

