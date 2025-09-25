"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Database } from "@/lib/supabase/client"

type Category = Database["public"]["Tables"]["categories"]["Row"]

interface CategoryFilterProps {
  categories: Category[]
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  return (
    <div className="space-y-2">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        className="w-full justify-start"
        onClick={() => setSelectedCategory(null)}
      >
        All Categories
      </Button>

      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          size="sm"
          className="w-full justify-start"
          onClick={() => setSelectedCategory(category.id)}
        >
          {category.name}
        </Button>
      ))}

      {selectedCategory && (
        <div className="pt-2">
          <Badge variant="secondary" className="text-xs">
            Filtered by category
          </Badge>
        </div>
      )}
    </div>
  )
}
