"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ChefHat, Coffee, Wine, Utensils, Menu } from "lucide-react"

interface MenuCategory {
  id: string
  name: string
  description: string
  itemCount: number
  isActive: boolean
  displayOrder: number
  color: string
  icon: string
}

interface MenuCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: MenuCategory | null
  onSave: (category: Omit<MenuCategory, "id">) => void
}

const colorOptions = [
  { value: "bg-orange-100 text-orange-800 border-orange-200", label: "Orange" },
  { value: "bg-red-100 text-red-800 border-red-200", label: "Red" },
  { value: "bg-blue-100 text-blue-800 border-blue-200", label: "Blue" },
  { value: "bg-purple-100 text-purple-800 border-purple-200", label: "Purple" },
  { value: "bg-pink-100 text-pink-800 border-pink-200", label: "Pink" },
  { value: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Yellow" },
  { value: "bg-green-100 text-green-800 border-green-200", label: "Green" },
  { value: "bg-gray-100 text-gray-800 border-gray-200", label: "Gray" },
]

const iconOptions = [
  { value: "chef-hat", label: "Chef Hat", icon: ChefHat },
  { value: "coffee", label: "Coffee", icon: Coffee },
  { value: "wine", label: "Wine", icon: Wine },
  { value: "utensils", label: "Utensils", icon: Utensils },
  { value: "menu", label: "Menu", icon: Menu },
]

export function MenuCategoryDialog({ open, onOpenChange, category, onSave }: MenuCategoryDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    itemCount: 0,
    isActive: true,
    displayOrder: 1,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "menu",
  })

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        itemCount: category.itemCount,
        isActive: category.isActive,
        displayOrder: category.displayOrder,
        color: category.color,
        icon: category.icon,
      })
    } else {
      setFormData({
        name: "",
        description: "",
        itemCount: 0,
        isActive: true,
        displayOrder: 1,
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: "menu",
      })
    }
  }, [category, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Menu Category" : "Add New Menu Category"}</DialogTitle>
          <DialogDescription>Configure the menu category details and appearance.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Appetizers, Main Courses"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this menu category"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itemCount">Number of Items</Label>
              <Input
                id="itemCount"
                type="number"
                min="0"
                value={formData.itemCount}
                onChange={(e) => setFormData((prev) => ({ ...prev, itemCount: Number.parseInt(e.target.value) || 0 }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                min="1"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, displayOrder: Number.parseInt(e.target.value) || 1 }))
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Category Icon</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, icon: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => {
                    const IconComponent = option.icon
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Category Color</Label>
              <Select
                value={formData.color}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, color: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${option.value.split(" ")[0]}`}></div>
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive">Active Category</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{category ? "Update" : "Create"} Category</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
