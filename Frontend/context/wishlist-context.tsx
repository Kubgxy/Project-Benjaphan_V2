"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

interface WishlistContextType {
  items: Product[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  itemCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([])
  const { toast } = useToast()

  // Load wishlist from localStorage on client side
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem("luxe-jewels-wishlist")
      if (savedWishlist) {
        setItems(JSON.parse(savedWishlist))
      }
    } catch (error) {
      console.error("Failed to load wishlist from localStorage:", error)
    }
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("luxe-jewels-wishlist", JSON.stringify(items))
    } catch (error) {
      console.error("Failed to save wishlist to localStorage:", error)
    }
  }, [items])

  const addItem = (product: Product) => {
    setItems((prevItems) => {
      const isAlreadyInWishlist = prevItems.some((item) => item.id === product.id)

      if (isAlreadyInWishlist) {
        toast({
          title: "Already in wishlist",
          description: `${product.name} is already in your wishlist.`,
        })
        return prevItems
      } else {
        toast({
          title: "Added to wishlist",
          description: `${product.name} has been added to your wishlist.`,
        })
        return [...prevItems, product]
      }
    })
  }

  const removeItem = (productId: string) => {
    setItems((prevItems) => {
      const removedItem = prevItems.find((item) => item.id === productId)
      if (removedItem) {
        toast({
          title: "Removed from wishlist",
          description: `${removedItem.name} has been removed from your wishlist.`,
        })
      }
      return prevItems.filter((item) => item.id !== productId)
    })
  }

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.id === productId)
  }

  const itemCount = items.length

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        isInWishlist,
        itemCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}