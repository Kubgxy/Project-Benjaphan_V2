"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SearchDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  // Reset search query when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("")
    }
  }, [isOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Search Products</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSearch} className="mt-4">
          <div className="flex items-center border-b border-gray-300 py-2">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for jewelry..."
              className="flex-1 border-none outline-none px-4 py-2 focus:ring-0"
              autoFocus
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <Button type="submit" variant="luxury" disabled={!searchQuery.trim()}>
              Search
            </Button>
          </div>
        </form>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Searches</h3>
          <div className="flex flex-wrap gap-2">
            {["Diamond Ring", "Gold Necklace", "Pearl bencharm", "Wedding Band", "Bracelet"].map((term) => (
              <button
                key={term}
                onClick={() => {
                  setSearchQuery(term)
                  router.push(`/search?q=${encodeURIComponent(term)}`)
                  onClose()
                }}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm rounded-full transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

