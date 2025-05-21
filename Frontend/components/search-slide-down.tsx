"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SearchSlideDownProps {
  isOpen: boolean
  onClose: () => void
  anchorRef: React.RefObject<HTMLButtonElement>
}

export function SearchSlideDown({ isOpen, onClose, anchorRef }: SearchSlideDownProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const [position, setPosition] = useState<{top: number, left: number}>({top: 0, left: 0})

  // Find anchor position (button search) for absolute placement
  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 12, // 12px margin below icon
        left: rect.left + window.scrollX - 240 + rect.width/2, // Center box under icon, box width is 400px
      })
      setTimeout(() => inputRef.current?.focus(), 120)
    }
    if (!isOpen) setSearchQuery("")
  }, [isOpen, anchorRef])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // ... handle search logic here ...
    onClose()
  }

  return (
    <div
      className={`fixed z-[60] transition-all duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={{
        top: position.top,
        left: position.left,
        width: 400,
      }}
    >
      <div
        className={`rounded-xl shadow-lg border border-gold-200 bg-white flex flex-col items-center px-6 py-6 relative
          transition-all duration-300 ${isOpen ? "translate-y-0" : "-translate-y-6"}
        `}
      >
        <form className="w-full flex items-center gap-2" onSubmit={handleSearch}>
          <Search className="h-5 w-5 text-gold-600" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาสินค้าหรือข้อมูลทั้งหมด..."
            className="flex-1 border-none outline-none px-3 py-2 text-lg focus:ring-0 bg-transparent"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-gold-400 hover:text-gold-600"
              aria-label="Clear"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          <Button
            type="submit"
            variant="luxury"
            disabled={!searchQuery.trim()}
            className="px-6 py-2"
          >
            ค้นหา
          </Button>
          <button
            type="button"
            className="ml-2 text-brown-400 hover:text-gold-600"
            onClick={onClose}
            aria-label="ปิด"
          >
            <X className="h-6 w-6" />
          </button>
        </form>
        {/* Popular Search ตัวอย่าง */}
        <div className="mt-4 w-full">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Searches</h3>
          <div className="flex flex-wrap gap-2">
            {["Diamond Ring", "Gold Necklace", "Pearl bencharm", "Wedding Band", "Bracelet"].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setSearchQuery(term)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm rounded-full transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}