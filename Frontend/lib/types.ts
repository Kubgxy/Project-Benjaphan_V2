export interface AvailableSize {
  _id: string
  size: string
  quantity: number
}

export interface AvailableColor {
  name: string;
  value: string;
}

export interface Product {
  id: string
  _id: string
  id_product: string
  name: string
  category: string
  price: number
  formattedPrice: string
  description: string
  details: string[]
  features: string[]
  images: string[]
  rating: number
  reviews: number
  isNewArrival: boolean
  isBestseller: boolean
  isOnSale: boolean
  discount: number
  availableSizes: AvailableSize[]
  availableColors?: AvailableColor[]
  materials: string[]
  stock: number
}

export interface SearchItem {
  id: string;
  productId: string;  // ✅ เพิ่ม field นี้ให้รู้จัก
  name: string;
  description?: string;
  image?: string;
}

export interface WishlistItem {
  productId: {
    _id: string;
    id_product: string;
    name: string;
    price: number;
    images: string[];
    availableSizes: { size: string; quantity: number }[];
  };
  dateAdded: string;
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  featured: boolean
}

export interface Collection {
  id: string
  name: string
  slug: string
  description: string
  image: string
  products: string[] // Product IDs
}

export interface Testimonial {
  id: string
  name: string
  avatar: string
  role: string
  content: string
  rating: number
  date: string
}

export interface Brand {
  id: string
  name: string
  logo: string
  description: string
}

export interface ShippingInfo {
  _id?: string
  Name: string
  label: string
  addressLine: string
  district: string
  subdistrict: string
  province: string
  postalCode: string
  country: string
  phone: string
}

export interface PaymentInfo {
  cardNumber: string
  cardHolder: string
  expiryDate: string
  cvv: string
}

export interface OrderDetails {
  items: {
    productId: string
    name: string
    price: number
    quantity: number
    selectedSize?: string
    selectedColor?: string
  }[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  shippingInfo: ShippingInfo
  paymentInfo: PaymentInfo
}

export interface Order {
  id: string
  details: OrderDetails
  status: "pending" | "processing" | "shipped" | "delivered"
  createdAt: string
}

export interface Address {
  subdistrict: string;
  district: string;
  province: string;
  zipcode: string;
}

export interface District {
  DISTRICT_ID: number;
  DISTRICT_NAME: string;
  PROVINCE_ID: number;
}

export interface Province {
  PROVINCE_ID: number;
  PROVINCE_NAME: string;
}

export interface SubDistrict {
  SUB_DISTRICT_NAME: string;
  SUB_DISTRICT_CODE: string;
  DISTRICT_ID: number;
  PROVINCE_ID: number;
}

export interface Zipcode {
  SUB_DISTRICT_CODE: string;
  ZIPCODE: string;
}