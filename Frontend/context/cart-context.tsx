"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

type CartItem = {
  product: Product
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, quantity?: number, selectedSize?: string, selectedColor?: string) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const { toast } = useToast()

  // Load cart from localStorage on client side
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("luxe-jewels-cart")
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("luxe-jewels-cart", JSON.stringify(items))
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error)
    }
  }, [items])

  const addItem = (product: Product, quantity = 1, selectedSize?: string, selectedColor?: string) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.product.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor,
      )

      if (existingItemIndex !== -1) {
        // Update quantity if item already exists with same options
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        }

        toast({
          title: "เพิ่มในตะกร้า",
          description: `${product.name} ถูกเพิ่มในตะกร้าสินค้าแล้ว`,
        })

        return updatedItems
      } else {
        // Add new item
        toast({
          title: "เพิ่มในตะกร้า",
          description: `${product.name} ถูกเพิ่มในตะกร้าสินค้าแล้ว`,
        })

        return [...prevItems, { product, quantity, selectedSize, selectedColor }]
      }
    })
  }

  const removeItem = (productId: string) => {
    setItems((prevItems) => {
      const removedItem = prevItems.find((item) => item.product.id === productId)
      if (removedItem) {
        toast({
          title: "ลบสินค้าออกจากตะกร้า",
          description: `${removedItem.product.name} ถูกลบออกจากตะกร้าสินค้าแล้ว`,
        })
      }
      return prevItems.filter((item) => item.product.id !== productId)
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    setItems((prevItems) => prevItems.map((item) => (item.product.id === productId ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setItems([])
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    })
  }

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

