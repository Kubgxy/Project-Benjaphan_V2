"use client";

import { useRef, useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchItem } from "@/lib/types";
import Image from "next/image";

interface SearchPopoverProps {
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  products: SearchItem[]; // ใช้ชื่อพหูพจน์
  onResultClick?: (item: SearchItem) => void;
}

export function SearchPopover({
  isOpen,
  anchorRef,
  onClose,
  products,
  onResultClick,
}: SearchPopoverProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]); // <<< แก้เป็น SearchItem[]
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const [show, setShow] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const POPOVER_WIDTH = 400;
  const POPOVER_WIDTH_MOBILE = 320;

  useEffect(() => {
    function calcPosition() {
      if (!isOpen || !anchorRef.current)
        return setPopoverStyle({ display: "none" });
      const rect = anchorRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 500;
      const width = isMobile ? POPOVER_WIDTH_MOBILE : POPOVER_WIDTH;
      let left = rect.left + rect.width / 2 - width / 2 + window.scrollX;
      left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
      setPopoverStyle({
        top: rect.bottom + 10,
        left,
        width,
        display: "block",
      });
    }
    if (isOpen) {
      calcPosition();
      setShow(true);
      setTimeout(() => inputRef.current?.focus(), 120);
    } else {
      setTimeout(() => setShow(false), 180);
    }
    window.addEventListener("resize", calcPosition);
    return () => window.removeEventListener("resize", calcPosition);
  }, [isOpen, anchorRef.current]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setActiveIndex(-1);
      return;
    }
    const keyword = query.trim().toLowerCase();
    setResults(
      products
        .filter(
          (p) =>
            p.name?.toLowerCase().includes(keyword) ||
            p.description?.toLowerCase().includes(keyword)
        )
        .slice(0, 8)
    );
    setActiveIndex(-1);
  }, [query, products]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0) {
        e.preventDefault();
        onResultClick?.(results[activeIndex]);
      }
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (activeIndex >= 0 && results[activeIndex]) {
      onResultClick?.(results[activeIndex]);
    } else if (query.trim() !== "") {
      onResultClick?.({
        id: "__search__",
        name: query.trim(),
        productId: "", // <<< ใส่ให้ครบตาม type
      });
    }
  }

  return (
    <div
      className={`fixed z-[80] transition-all duration-200 ease-in-out ${
        isOpen || show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={popoverStyle}
    >
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <svg width="24" height="24" className="block" viewBox="0 0 24 24">
          <polygon points="12,0 24,24 0,24" className="fill-white stroke-gold-200" />
        </svg>
      </div>
      <div
        className={`rounded-xl shadow-xl border border-gold-200 bg-white px-6 py-5 relative transition-all duration-300 ease-in-out ${
          isOpen ? "translate-y-0 opacity-100 visible" : "-translate-y-6 opacity-0 invisible"
        }`}
      >
        <form className="w-full flex items-center gap-2" onSubmit={handleSubmit}>
          <Search className="h-5 w-5 text-gold-600" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาสินค้าหรือข้อมูล"
            className="flex-1 border-none outline-none px-2 py-2 text-base focus:ring-0 bg-transparent"
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setActiveIndex(-1);
                inputRef.current?.focus();
              }}
              className="text-gold-400 hover:text-gold-600"
              aria-label="Clear"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          
          <button
            type="button"
            className="ml-2 text-brown-400 hover:text-gold-600"
            onClick={onClose}
            aria-label="ปิด"
          >
            <X className="h-6 w-6" />
          </button>
        </form>
        {query && (
          <div className="mt-4 max-h-48 overflow-y-auto border-t border-gold-100 pt-2">
            {results.length === 0 ? (
              <div className="text-center text-brown-600 py-3 text-sm">ไม่พบข้อมูล</div>
            ) : (
              <ul>
                {results.map((item, idx) => (
                  <li
                    key={item.id}
                    className={`
                      py-2 px-2 rounded flex items-center gap-3 cursor-pointer
                      ${activeIndex === idx ? "bg-gold-50" : "hover:bg-cream-50"}
                    `}
                    onClick={() => onResultClick?.(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    {/* รูปสินค้า */}
                    <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                      <Image
                        src={item.image || "/placeholder.svg"} // ใช้ path ของรูปแรก หรือ fallback
                        alt={item.name}
                        width={48}   // ✅ ใช้ prop → ถูกต้อง
                        height={48}  // ✅ ใช้ prop → ถูกต้อง
                        className="object-cover w-full h-full rounded-md"
                      />
                    </div>
                    {/* ข้อความ */}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500 truncate">{item.description}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
