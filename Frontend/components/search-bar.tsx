"use client"

import { useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SearchBarProps {
  data: any[] // ส่งข้อมูลที่ต้องการ search ทั้งหมดเข้ามา เช่น products, articles ฯลฯ
}

export function SearchBar({ data }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [show, setShow] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const q = searchQuery.trim()
    if (!q) {
      setResults([])
      setShow(false)
      return
    }
    // ตัวอย่าง ค้นหาชื่อ หรือคำอธิบาย
    const filtered = data.filter(
      (item) =>
        item.name?.toLowerCase().includes(q.toLowerCase()) ||
        item.description?.toLowerCase().includes(q.toLowerCase())
    )
    setResults(filtered)
    setShow(true)
  }

  return (
    <div className="w-full max-w-xl mx-auto mt-6 relative z-30">
      <form
        className="flex items-center border border-gold-300 bg-white rounded-full px-3 py-2 shadow"
        onSubmit={handleSearch}
      >
        <Search className="h-5 w-5 text-gold-600" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="ค้นหาสินค้าหรือข้อมูลทั้งหมด..."
          className="flex-1 border-none outline-none px-4 py-1 focus:ring-0 bg-transparent"
          onFocus={() => searchQuery && setShow(true)}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery(""); setResults([]); setShow(false)
              inputRef.current?.focus()
            }}
            className="text-gold-400 hover:text-gold-600"
            aria-label="Clear"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <Button type="submit" variant="luxury" className="ml-2" disabled={!searchQuery.trim()}>
          ค้นหา
        </Button>
      </form>

      {/* ผลลัพธ์ค้นหา แสดงแบบ slide down */}
      <div
        className={`transition-all duration-300 overflow-hidden absolute left-0 right-0 bg-white rounded-b shadow border-t border-gold-100 ${
          show && results.length > 0 ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {results.length === 0 && show ? (
          <div className="text-center text-brown-600 py-8">ไม่พบข้อมูลที่ค้นหา</div>
        ) : (
          <ul>
            {results.map((item) => (
              <li key={item.id} className="px-6 py-3 border-b last:border-none hover:bg-cream-50 cursor-pointer">
                <div className="font-semibold">{item.name}</div>
                <div className="text-sm text-gray-500">{item.description}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}