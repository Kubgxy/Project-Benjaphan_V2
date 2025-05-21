import type { Product, Category, Collection, Testimonial, Brand } from "./types"

// Update the categories to match Thai jewelry categories
export const categories: Category[] = [
  {
    id: "cat-jakkraphat",
    name: "พระบูชา",
    slug: "jakkraphat",
    description: "ต่างหูทองคำแท้ดีไซน์สวยงาม เหมาะกับทุกโอกาส",
    image: "/product/น้ำหอมรวม.jpg",
    featured: true,
  },
  {
    id: "cat-chaloms",
    name: "ชะลอม",
    slug: "chaloms",
    description: "แหวนทองคำแท้หลากหลายดีไซน์ เหมาะสำหรับทุกโอกาส",
    image: "/product/ชะลอมรวม.jpg",
    featured: true,
  },
  {
    id: "cat-bracelets",
    name: "กำไลและสร้อยข้อมือ",
    slug: "bracelets",
    description: "กำไลและสร้อยข้อมือทองคำแท้ ออกแบบอย่างประณีต",
    image: "/product/รวมกำไลทุกตะกูล.jpg",
    featured: true,
  },
  {
    id: "cat-bencharm",
    name: "น้ำหอม",
    slug: "bencharm",
    description: "ต่างหูทองคำแท้ดีไซน์สวยงาม เหมาะกับทุกโอกาส",
    image: "/product/น้ำหอมรวม.jpg",
    featured: true,
  },
]

// Collections
export const collections: Collection[] = [
  {
    id: "col-summer-2023",
    name: "Summer Elegance 2023",
    slug: "summer-elegance-2023",
    description: "Our latest collection featuring light, elegant pieces perfect for summer occasions.",
    image: "https://images.unsplash.com/photo-1600721391689-2564bb8055de?q=80&w=1374&auto=format&fit=crop",
    products: ["prod-001", "prod-003", "prod-007", "prod-009", "prod-012"],
  },
  {
    id: "col-wedding",
    name: "Wedding Collection",
    slug: "wedding-collection",
    description: "Timeless pieces for your special day, from engagement chaloms to wedding bands and bridal jewelry.",
    image: "https://images.unsplash.com/photo-1546168006-9f2abb6aca25?q=80&w=1374&auto=format&fit=crop",
    products: ["prod-002", "prod-005", "prod-008", "prod-015", "prod-018"],
  },
  {
    id: "col-vintage",
    name: "Vintage Charm",
    slug: "vintage-charm",
    description: "Classic designs inspired by vintage aesthetics with a modern twist.",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1470&auto=format&fit=crop",
    products: ["prod-004", "prod-006", "prod-010", "prod-014", "prod-019"],
  },
  {
    id: "col-minimalist",
    name: "Minimalist Essentials",
    slug: "minimalist-essentials",
    description: "Clean, simple designs for the modern minimalist.",
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=1374&auto=format&fit=crop",
    products: ["prod-011", "prod-013", "prod-016", "prod-020", "prod-022"],
  },
]

// Update the product data to match the Thai jewelry store
// Add these products to the existing products array or replace it

// Update the products array with Thai jewelry products
export const products: Product[] = [
  {
    id: "bracelets-001",
    name: "กำไลข้อมือพญานาคตะกูลทอง",
    category: "cat-bracelets",
    price: 3990,
    formattedPrice: "฿3990",
    description: "ผ่านพิธีปลุกเสก เสริมดวงและโชคชะตา",
    details: ["ขนาดหญิงและชายมีขนาดเดียว", "รับประกันสินค้าตลอดชีพถ้าขาด", "มีใบรับประกันสินค้า"],
    features: ["ทองคำแท้คุณภาพสูง", "ดีไซน์ทันสมัย", "ผลิตโดยช่างฝีมือ"],
    images: [
      "/product/กำไลตะกูลทอง.jpg"
    ],
    rating: 4.9,
    reviews: 128,
    isNew: true,
    isBestseller: true,
    isOnSale: false,
    availableSizes: [],
    materials: [""],
    stock: 15,
  },
  {
    id: "bracelets-002",
    name: "กำไลข้อมือพญานาคตะกูลเขียวขาวทอง",
    category: "cat-bracelets",
    price: 2990,
    formattedPrice: "฿2990",
    description: "ผ่านพิธีปลุกเสก เสริมดวงและโชคชะตา",
    details: ["ขนาดหญิงและชายมีขนาดเดียว", "รับประกันสินค้าตลอดชีพถ้าขาด", "มีใบรับประกันสินค้า"],
    features: ["ทองคำแท้คุณภาพสูง", "ดีไซน์ทันสมัย", "ผลิตโดยช่างฝีมือ"],
    images: [
      "/product/กำไลตะกูลเขียวขาวทอง.jpg"
    ],
    rating: 4.9,
    reviews: 128,
    isNew: true,
    isBestseller: true,
    isOnSale: false,
    availableSizes: ['หญิง', 'ชาย'],
    materials: [""],
    stock: 15,
  },
  {
    id: "bracelets-003",
    name: "กำไลข้อมือพญานาคตะกูลเขียวดำทอง",
    category: "cat-bracelets",
    price: 2990,
    formattedPrice: "฿2990",
    description: "ผ่านพิธีปลุกเสก เสริมดวงและโชคชะตา",
    details: ["ขนาดหญิงและชายมีขนาดเดียว", "รับประกันสินค้าตลอดชีพถ้าขาด", "มีใบรับประกันสินค้า"],
    features: ["ทองคำแท้คุณภาพสูง", "ดีไซน์ทันสมัย", "ผลิตโดยช่างฝีมือ"],
    images: [
      "/product/กำไลตะกูลเขียวดำทอง.jpg"
    ],
    rating: 4.9,
    reviews: 128,
    isNew: true,
    isBestseller: true,
    isOnSale: false,
    availableSizes: ['หญิง', 'ชาย'],
    materials: [""],
    stock: 15,
  },
  {
    id: "bracelets-004",
    name: "กำไลข้อมือพญานาคตะกูลเขียว",
    category: "cat-bracelets",
    price: 2990,
    formattedPrice: "฿2990",
    description: "ผ่านพิธีปลุกเสก เสริมดวงและโชคชะตา",
    details: ["ขนาดหญิงและชายมีขนาดเดียว", "รับประกันสินค้าตลอดชีพถ้าขาด", "มีใบรับประกันสินค้า"],
    features: ["ทองคำแท้คุณภาพสูง", "ดีไซน์ทันสมัย", "ผลิตโดยช่างฝีมือ"],
    images: [
      "/product/กำไลตะกูลเขียว.jpg"
    ],
    rating: 4.9,
    reviews: 128,
    isNew: true,
    isBestseller: true,
    isOnSale: false,
    availableSizes: ['หญิง', 'ชาย'],
    materials: [""],
    stock: 15,
  },
  {
    id: "bracelets-005",
    name: "กำไลข้อมือพญานาคตะกูลดำขาวทอง",
    category: "cat-bracelets",
    price: 2990,
    formattedPrice: "฿2990",
    description: "ผ่านพิธีปลุกเสก เสริมดวงและโชคชะตา",
    details: ["ขนาดหญิงและชายมีขนาดเดียว", "รับประกันสินค้าตลอดชีพถ้าขาด", "มีใบรับประกันสินค้า"],
    features: ["ทองคำแท้คุณภาพสูง", "ดีไซน์ทันสมัย", "ผลิตโดยช่างฝีมือ"],
    images: [
      "/product/กำไลตะกูลดำขาวทอง.jpg"
    ],
    rating: 4.9,
    reviews: 128,
    isNew: true,
    isBestseller: true,
    isOnSale: false,
    availableSizes: ['หญิง', 'ชาย'],
    materials: [""],
    stock: 15,
  },
  {
    id: "bracelets-006",
    name: "กำไลข้อมือพญานาคตะกูลดำขาว",
    category: "cat-bracelets",
    price: 2990,
    formattedPrice: "฿2990",
    description: "ผ่านพิธีปลุกเสก เสริมดวงและโชคชะตา",
    details: ["ขนาดหญิงและชายมีขนาดเดียว", "รับประกันสินค้าตลอดชีพถ้าขาด", "มีใบรับประกันสินค้า"],
    features: ["ทองคำแท้คุณภาพสูง", "ดีไซน์ทันสมัย", "ผลิตโดยช่างฝีมือ"],
    images: [
      "/product/กำไลตะกูลดำขาว.jpg"
    ],
    rating: 4.9,
    reviews: 128,
    isNew: true,
    isBestseller: true,
    isOnSale: false,
    availableSizes: ['หญิง', 'ชาย'],
    materials: [""],
    stock: 15,
  },
  {
    id: "bracelets-007",
    name: "กำไลข้อมือพญานาคตะกูลดำ",
    category: "cat-bracelets",
    price: 2990,
    formattedPrice: "฿2990",
    description: "ผ่านพิธีปลุกเสก เสริมดวงและโชคชะตา",
    details: ["ขนาดหญิงและชายมีขนาดเดียว", "รับประกันสินค้าตลอดชีพถ้าขาด", "มีใบรับประกันสินค้า"],
    features: ["ทองคำแท้คุณภาพสูง", "ดีไซน์ทันสมัย", "ผลิตโดยช่างฝีมือ"],
    images: [
      "/product/กำไลตะกูลดำ.jpg"
    ],
    rating: 4.9,
    reviews: 128,
    isNew: true,
    isBestseller: true,
    isOnSale: false,
    availableSizes: ['หญิง', 'ชาย'],
    materials: [""],
    stock: 15,
  },
  {
    id: "bracelets-008",
    name: "กำไลข้อมือพญานาคตะกูลขาว",
    category: "cat-bracelets",
    price: 2990,
    formattedPrice: "฿2990",
    description: "ผ่านพิธีปลุกเสก เสริมดวงและโชคชะตา",
    details: ["ขนาดหญิงและชายมีขนาดเดียว", "รับประกันสินค้าตลอดชีพถ้าขาด", "มีใบรับประกันสินค้า"],
    features: ["ทองคำแท้คุณภาพสูง", "ดีไซน์ทันสมัย", "ผลิตโดยช่างฝีมือ"],
    images: [
      "/product/กำไลตะกูลขาว.jpg"
    ],
    rating: 4.9,
    reviews: 128,
    isNew: true,
    isBestseller: true,
    isOnSale: false,
    availableSizes: ['หญิง', 'ชาย'],
    materials: [""],
    stock: 15,
  },
  //น้ำหอม
  {
    id: "bencharm-001",
    name: "น้ำหอมธสินี เกสรสุมณฑา",
    category: "cat-bencharm",
    price: 659,
    formattedPrice: "฿659",
    description: "ต่างหูทองคำแท้ ลายดอกไม้ ออกแบบอย่างประณีต เหมาะสำหรับทุกโอกาส ทั้งงานทางการและลำลอง",
    details: ["น้ำหนัก: 0.5 บาท", "ทองคำแท้ผสม", "ดีไซน์ลายดอกไม้", "รับประกันสินค้าตลอดชีพ", "มีใบรับประกันสินค้า"],
    features: ["ทองคำแท้คุณภาพสูง", "ดีไซน์ทันสมัย", "ผลิตโดยช่างฝีมือ"],
    images: [
      "/product/น้ำหอมธสินี.jpg"
    ],
    rating: 4.8,
    reviews: 95,
    isNew: false,
    isBestseller: true,
    isOnSale: false,
    materials: [""],
    stock: 25,
  },
  {
    id: "bencharm-002",
    name: "น้ำหอมอัญญารินทร์พิกุลนาคา",
    category: "cat-bencharm",
    price: 659,
    formattedPrice: "฿659",
    description: "ต่างหูทองคำแท้ ลายดอกไม้ ออกแบบอย่างประณีต เหมาะสำหรับทุกโอกาส ทั้งงานทางการและลำลอง",
    details: ["น้ำหนัก: 0.5 บาท", "ทองคำแท้ผสม", "ดีไซน์ลายดอกไม้", "รับประกันสินค้าตลอดชีพ", "มีใบรับประกันสินค้า"],
    features: ["ทองคำแท้คุณภาพสูง", "ดีไซน์ทันสมัย", "ผลิตโดยช่างฝีมือ"],
    images: [
      "/product/น้ำหอมอัญญารินทร์.jpg"
    ],
    rating: 4.8,
    reviews: 95,
    isNewA: false,
    isBestseller: true,
    isOnSale: false,
    materials: [""],
    stock: 25,
  },
  {
    id: "bencharm-003",
    name: "น้ำหอมมนตรานาคราช",
    category: "cat-bencharm",
    price: 659,
    formattedPrice: "฿659",
    description: "ต่างหูทองคำแท้ ลายดอกไม้ ออกแบบอย่างประณีต เหมาะสำหรับทุกโอกาส ทั้งงานทางการและลำลอง",
    details: ["น้ำหนัก: 0.5 บาท", "ทองคำแท้ผสม", "ดีไซน์ลายดอกไม้", "รับประกันสินค้าตลอดชีพ", "มีใบรับประกันสินค้า"],
    features: ["ทองคำแท้คุณภาพสูง", "ดีไซน์ทันสมัย", "ผลิตโดยช่างฝีมือ"],
    images: [
      "/product/น้ำหอมมนตรานาคราช.jpg"
    ],
    rating: 4.8,
    reviews: 95,
    isNew: false,
    isBestseller: true,
    isOnSale: false,
    materials: [""],
    stock: 25,
  },
  {
    id: "chalom-001",
    name: "ชะลอมเบญจภัณฑ์ 399",
    category: "cat-chaloms",
    price: 399,
    formattedPrice: "฿399",
    description: "แหวนทองคำแท้ ลายเกลียว ออกแบบอย่างประณีต เหมาะสำหรับทุกโอกาส ทั้งงานทางการและลำลอง",
    details: ["น้ำหนัก: 0.5 บาท", "ทองคำแท้ผสม", "ดีไซน์ลายเกลียว", "รับประกันสินค้าตลอดชีพ", "มีใบรับประกันสินค้า"],
    features: ["ทองคำแท้คุณภาพสูง", "ดีไซน์ทันสมัย", "ผลิตโดยช่างฝีมือ"],
    images: [
      "/product/ชะลอม1.jpg"
    ],
    rating: 4.7,
    reviews: 64,
    isNew: true,
    isBestseller: false,
    isOnSale: false,
    availableSizes: ["S"],
    materials: [""],
    stock: 20,
  },
  {
    id: "chalom-002",
    name: "ชะลอมเบญจภัณฑ์ 599",
    category: "cat-chaloms",
    price: 599,
    formattedPrice: "฿599",
    description: "แหวนทองคำแท้ ลายเกลียว ออกแบบอย่างประณีต เหมาะสำหรับทุกโอกาส ทั้งงานทางการและลำลอง",
    details: ["น้ำหนัก: 0.5 บาท", "ทองคำแท้ผสม", "ดีไซน์ลายเกลียว", "รับประกันสินค้าตลอดชีพ", "มีใบรับประกันสินค้า"],
    features: ["ทองคำแท้คุณภาพสูง", "ดีไซน์ทันสมัย", "ผลิตโดยช่างฝีมือ"],
    images: [
      "/product/ชะลอม2.jpg"
    ],
    rating: 4.7,
    reviews: 64,
    isNew: true,
    isBestseller: false,
    isOnSale: false,
    availableSizes: ["M"],
    materials: [""],
    stock: 20,
  },
  {
    id: "chalom-003",
    name: "ชะลอมเบญจภัณฑ์ 799",
    category: "cat-chaloms",
    price: 799,
    formattedPrice: "฿799",
    description: "แหวนทองคำแท้ ลายเกลียว ออกแบบอย่างประณีต เหมาะสำหรับทุกโอกาส ทั้งงานทางการและลำลอง",
    details: ["น้ำหนัก: 0.5 บาท", "ทองคำแท้ผสม", "ดีไซน์ลายเกลียว", "รับประกันสินค้าตลอดชีพ", "มีใบรับประกันสินค้า"],
    features: ["ทองคำแท้คุณภาพสูง", "ดีไซน์ทันสมัย", "ผลิตโดยช่างฝีมือ"],
    images: [
      "/product/ชะลอม3.jpg"
    ],
    rating: 4.7,
    reviews: 64,
    isNew: true,
    isBestseller: false,
    isOnSale: false,
    availableSizes: ["L"],
    materials: [""],
    stock: 20,
  },
  {
    id: "chalom-004",
    name: "ธูปเทียนเบญจภัทฑ์",
    category: "cat-chaloms",
    price: 39,
    formattedPrice: "฿39-49",
    description: "แหวนทองคำแท้ ลายเกลียว ออกแบบอย่างประณีต เหมาะสำหรับทุกโอกาส ทั้งงานทางการและลำลอง",
    details: ["น้ำหนัก: 0.5 บาท", "ทองคำแท้ผสม", "ดีไซน์ลายเกลียว", "รับประกันสินค้าตลอดชีพ", "มีใบรับประกันสินค้า"],
    features: ["ทองคำแท้คุณภาพสูง", "ดีไซน์ทันสมัย", "ผลิตโดยช่างฝีมือ"],
    images: [
      "/product/ธูปเทียนเบญจภัทฑ์.jpg"
    ],
    rating: 4.7,
    reviews: 64,
    isNew: true,
    isBestseller: false,
    isOnSale: false,
    availableSizes: ["ธูป", "เทียน"],
    materials: [""],
    stock: 20,
  },
  // {
  //   id: "prod-004",
  //   name: "สร้อยข้อมือทองคำแท้ ลายโซ่",
  //   category: "cat-bracelets",
  //   price: 659,
  //   formattedPrice: "฿659",
  //   description: "สร้อยข้อมือทองคำแท้ ลายโซ่ น้ำหนักผสมทองคำบริสุทธิ์ ออกแบบอย่างประณีตสำหรับทุกโอกาสพิเศษ",
  //   details: ["น้ำหนัก: 0.5 บาท", "ความยาว: 6 นิ้ว หรือ 7 นิ้ว", "ทองคำแท้ผสม", "รับประกันสินค้าตลอดชีพ", "มีใบรับประกันสินค้า"],
  //   features: ["ทองคำแท้คุณภาพสูง", "ดีไซน์ทันสมัย", "ผลิตโดยช่างฝีมือ"],
  //   images: [
  //     "/product/ข้อมือ4.jpg",
  //     "/product/ข้อมือ4.jpg",
  //     "/product/ข้อมือ4.jpg"
  //   ],
  //   rating: 4.9,
  //   reviews: 42,
  //   isNew: false,
  //   isBestseller: false,
  //   isOnSale: false,
  //   availableSizes: ['6"', '7"'],
  //   materials: ["ทองคำแท้"],
  //   stock: 8,
  // },
  // {
  //   id: "prod-005",
  //   name: "จี้ทองคำแท้ ลายหัวใจ",
  //   category: "cat-pendants",
  //   price: 659,
  //   formattedPrice: "฿659",
  //   description: "จี้ทองคำแท้ ลายหัวใจ น้ำหนักผสมทองคำบริสุทธิ์ ออกแบบอย่างประณีตสำหรับทุกโอกาสพิเศษ",
  //   details: ["น้ำหนัก: 0.3 บาท", "ทองคำแท้ผสม", "ดีไซน์รูปหัวใจ", "รับประกันสินค้าตลอดชีพ", "มีใบรับประกันสินค้า"],
  //   features: ["ทองคำแท้คุณภาพสูง", "ดีไซน์ทันสมัย", "ผลิตโดยช่างฝีมือ"],
  //   images: [
  //     "/product/ข้อมือ5.jpg",
  //     "/product/ข้อมือ5.jpg",
  //     "/product/ข้อมือ5.jpg"
  //   ],
  //   rating: 4.8,
  //   reviews: 56,
  //   isNew: false,
  //   isBestseller: true,
  //   isOnSale: true,
  //   discount: 15,
  //   materials: ["ทองคำแท้"],
  //   stock: 10,
  // },
  // {
  //   id: "prod-006",
  //   name: "กำไลทองคำแท้ ลายลูกคิด",
  //   category: "cat-bracelets",
  //   price: 659,
  //   formattedPrice: "฿659",
  //   description: "กำไลทองคำแท้ ลายลูกคิด น้ำหนักผสมทองคำบริสุทธิ์ ออกแบบอย่างประณีตสำหรับทุกโอกาสพิเศษ",
  //   details: ["น้ำหนัก: 1 บาท", "ทองคำแท้ผสม", "ดีไซน์ลายลูกคิด", "รับประกันสินค้าตลอดชีพ", "มีใบรับประกันสินค้า"],
  //   features: ["ทองคำแท้คุณภาพสูง", "ดีไซน์ทันสมัย", "ผลิตโดยช่างฝีมือ"],
  //   images: [
  //     "/product/ข้อมือ6.jpg",
  //     "/product/ข้อมือ6.jpg",
  //     "/product/ข้อมือ6.jpg"
  //   ],
  //   rating: 4.7,
  //   reviews: 83,
  //   isNew: false,
  //   isBestseller: true,
  //   isOnSale: false,
  //   materials: ["ทองคำแท้"],
  //   stock: 18,
  // },
  // {
  //   id: "prod-007",
  //   name: "แหวนทองคำแท้ ลายดอกไม้",
  //   category: "cat-chaloms",
  //   price: 659,
  //   formattedPrice: "฿659",
  //   description: "แหวนทองคำแท้ ลายดอกไม้ น้ำหนักผสมทองคำบริสุทธิ์ ออกแบบอย่างประณีตสำหรับทุกโอกาสพิเศษ",
  //   details: ["น้ำหนัก: 0.5 บาท", "ทองคำแท้ผสม", "ดีไซน์ลายดอกไม้", "รับประกันสินค้าตลอดชีพ", "มีใบรับประกันสินค้า"],
  //   features: ["ทองคำแท้คุณภาพสูง", "ดีไซน์ทันสมัย", "ผลิตโดยช่างฝีมือ"],
  //   images: [
  //     "/product/ข้อมือ7.jpg",
  //     "/product/ข้อมือ7.jpg",
  //     "/product/ข้อมือ7.jpg"
  //   ],
  //   rating: 4.6,
  //   reviews: 37,
  //   isNew: true,
  //   isBestseller: false,
  //   isOnSale: false,
  //   availableSizes: ["5", "6", "7", "8", "9"],
  //   materials: ["ทองคำแท้"],
  //   stock: 12,
  // },
  // {
  //   id: "prod-008",
  //   name: "สร้อยคอทองคำแท้ ลายสี่เสา",
  //   category: "cat-bracelets",
  //   price: 659,
  //   formattedPrice: "฿659",
  //   description: "สร้อยคอทองคำแท้ ลายสี่เสา น้ำหนักผสมทองคำบริสุทธิ์ ออกแบบอย่างประณีตสำหรับทุกโอกาสพิเศษ",
  //   details: ["น้ำหนัก: 1 บาท", "ความยาว: 16 นิ้ว หรือ 18 นิ้ว", "ทองคำแท้ผสม", "รับประกันสินค้าตลอดชีพ", "มีใบรับประกันสินค้า"],
  //   features: ["ทองคำแท้คุณภาพสูง", "ดีไซน์ทันสมัย", "ผลิตโดยช่างฝีมือ"],
  //   images: [
  //     "/product/ข้อมือ8.jpg",
  //     "/product/ข้อมือ8.jpg",
  //     "/product/ข้อมือ8.jpg"
  //   ],
  //   rating: 4.9,
  //   reviews: 92,
  //   isNew: false,
  //   isBestseller: true,
  //   isOnSale: false,
  //   availableSizes: ['16"', '18"'],
  //   materials: ["ทองคำแท้"],
  //   stock: 15,
  // },
  // {
  //   id: "prod-009",
  //   name: "ต่างหูทองคำแท้ ลายห่วง",
  //   category: "cat-bencharm",
  //   price: 659,
  //   formattedPrice: "฿659",
  //   description: "ต่างหูทองคำแท้ ลายห่วง น้ำหนักผสมทองคำบริสุทธิ์ ออกแบบอย่างประณีตสำหรับทุกโอกาสพิเศษ",
  //   details: ["น้ำหนัก: 0.5 บาท", "ทองคำแท้ผสม", "ดีไซน์ลายห่วง", "รับประกันสินค้าตลอดชีพ", "มีใบรับประกันสินค้า"],
  //   features: ["ทองคำแท้คุณภาพสูง", "ดีไซน์ทันสมัย", "ผลิตโดยช่างฝีมือ"],
  //   images: [
  //     "/product/ข้อมือ9.jpg",
  //     "/product/ข้อมือ9.jpg",
  //     "/product/ข้อมือ9.jpg"
  //   ],
  //   rating: 4.8,
  //   reviews: 45,
  //   isNew: true,
  //   isBestseller: false,
  //   isOnSale: true,
  //   discount: 10,
  //   materials: ["ทองคำแท้"],
  //   stock: 7,
  // },
]

// Testimonials
export const testimonials: Testimonial[] = [
  {
    id: "test-001",
    name: "Elizabeth Parker",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1374&auto=format&fit=crop",
    role: "Bride",
    content:
      "I purchased my wedding ring from LUXE JEWELS and couldn't be happier with the quality and service. The staff helped me find the perfect match to my engagement ring, and it arrived beautifully packaged with a personalized note.",
    rating: 5,
    date: "2023-06-15",
  },
  {
    id: "test-002",
    name: "Michael Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1374&auto=format&fit=crop",
    role: "Anniversary Gift Buyer",
    content:
      "The diamond pendant I purchased for our 10th anniversary was absolutely stunning. My wife was moved to tears when she opened it. The quality exceeded my expectations, and the customer service was exceptional.",
    rating: 5,
    date: "2023-05-22",
  },
  {
    id: "test-003",
    name: "Sophia Rodriguez",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1374&auto=format&fit=crop",
    role: "Regular Customer",
    content:
      "I've been shopping at LUXE JEWELS for years and have never been disappointed. Their pieces are timeless, well-crafted, and always receive compliments. The minimalist collection is my absolute favorite!",
    rating: 5,
    date: "2023-04-10",
  },
  {
    id: "test-004",
    name: "James Thompson",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1374&auto=format&fit=crop",
    role: "First-time Buyer",
    content:
      "As someone who knows very little about jewelry, I was nervous about buying an engagement ring. The team at LUXE JEWELS made the process easy and educational. They helped me choose the perfect ring within my budget.",
    rating: 4,
    date: "2023-03-18",
  },
  {
    id: "test-005",
    name: "Olivia Kim",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1374&auto=format&fit=crop",
    role: "Fashion Enthusiast",
    content:
      "The vintage charm bracelet I purchased is absolutely exquisite. The attention to detail and craftsmanship is evident in every link. It's become my signature piece that I wear almost daily.",
    rating: 5,
    date: "2023-02-05",
  },
]

// Brands
export const brands: Brand[] = [
  {
    id: "brand-001",
    name: "Elegance Designs",
    logo: "https://images.unsplash.com/photo-1563694983011-6f4d90358083?q=80&w=1374&auto=format&fit=crop",
    description: "Luxury jewelry with a focus on classic, timeless designs.",
  },
  {
    id: "brand-002",
    name: "Modern Luxe",
    logo: "https://images.unsplash.com/photo-1563694983011-6f4d90358083?q=80&w=1374&auto=format&fit=crop",
    description: "Contemporary jewelry with clean lines and minimalist aesthetics.",
  },
  {
    id: "brand-003",
    name: "Heritage Gems",
    logo: "https://images.unsplash.com/photo-1563694983011-6f4d90358083?q=80&w=1374&auto=format&fit=crop",
    description: "Vintage-inspired pieces with a modern twist.",
  },
  {
    id: "brand-004",
    name: "Artisan Collective",
    logo: "https://images.unsplash.com/photo-1563694983011-6f4d90358083?q=80&w=1374&auto=format&fit=crop",
    description: "Handcrafted jewelry from independent artisans around the world.",
  },
]

// Helper functions
export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id)
}

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((product) => product.category === categoryId)
}

export function getProductsByCollection(collectionId: string): Product[] {
  const collection = collections.find((c) => c.id === collectionId)
  if (!collection) return []
  return products.filter((product) => collection.products.includes(product.id))
}

export function getNewProducts(limit = 4): Product[] {
  return products.filter((product) => product.isNew).slice(0, limit)
}

export function getBestsellers(limit = 4): Product[] {
  return products.filter((product) => product.isBestseller).slice(0, limit)
}

export function getSaleProducts(limit = 4): Product[] {
  return products.filter((product) => product.isOnSale).slice(0, limit)
}

export function getRelatedProducts(productId: string, limit = 4): Product[] {
  const product = getProductById(productId)
  if (!product) return []

  return products.filter((p) => p.id !== productId && p.category === product.category).slice(0, limit)
}

export function searchProducts(query: string): Product[] {
  const lowercaseQuery = query.toLowerCase()
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery),
  )
}

// Mock orders database
const orders: any[] = []

export function createOrder(orderData: any) {
  const orderId = Math.random().toString(36).substring(2, 10).toUpperCase()
  const order = {
    id: orderId,
    details: orderData,
    status: "processing",
    createdAt: new Date().toISOString(),
  }

  orders.push(order)
  return { success: true, orderId }
}

export function getOrder(orderId: string) {
  return orders.find((order) => order.id === orderId)
}

export function getOrders() {
  return orders
}

