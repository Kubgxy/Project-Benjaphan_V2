import type { Product } from "@/lib/types";
import type { ProductCardData } from "@/components/product-card";
import { formatPrice } from "@/lib/utils";

export interface AvailableSize {
    _id: string
    size: string
    quantity: number
  }

export function calculateStockFromAvailableSizes(sizes: AvailableSize[] = []): number {
    return sizes.reduce((sum, size) => sum + size.quantity, 0);
  }

export const mapProductToCardProduct = (product: Product): ProductCardData => {
  return {
    id: product.id_product,
    name: product.name,
    price: product.price,
    formattedPrice: formatPrice(product.price),
    images: product.images?.length ? product.images : [],
    description: product.description,
    details: product.details || [],
    features: product.features || [],
    availableSizes: product.availableSizes,
    availableColors: product.availableColors,
    isNewArrival: product.isNewArrival || false,
    isBestseller: product.isBestseller || false,
    isOnSale: product.isOnSale || false,
    rating: product.rating || 0,
    reviews: product.reviews || 0,
    materials: product.materials || [],
    category: product.category,          
    stock: calculateStockFromAvailableSizes(product.availableSizes),   // ✅ แก้ตรงนี้!                
  };
};
