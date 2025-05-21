"use client";
import { useState } from "react";

export default function SearchSection({ allData }: { allData: any[] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    // ตัวอย่าง filter ข้อมูล สามารถเปลี่ยน logic ได้ตามจริง
    const filtered = allData.filter(item =>
      item.name.includes(query) ||
      item.description.includes(query)
    );
    setResults(filtered);
    setShowResults(true);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto py-8">
      <div className="flex gap-2">
        <input
          className="border px-4 py-2 rounded w-full"
          placeholder="ค้นหาสินค้าหรือข้อมูลทั้งหมด..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button
          className="bg-gold-600 text-white px-4 py-2 rounded"
          onClick={handleSearch}
        >
          ค้นหา
        </button>
      </div>

      {/* แสดงผลลัพธ์ พร้อมเอฟเฟกต์สไลด์ลง */}
      <div
        className={`transition-all duration-500 overflow-hidden ${
          showResults ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white rounded shadow mt-4 p-4">
          {results.length === 0 ? (
            <div className="text-center text-brown-600">ไม่พบข้อมูลที่ค้นหา</div>
          ) : (
            results.map(item => (
              <div key={item.id} className="py-2 border-b last:border-none">
                <div className="font-semibold">{item.name}</div>
                <div className="text-sm text-gray-500">{item.description}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}