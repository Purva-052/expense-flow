/* eslint-disable @typescript-eslint/no-explicit-any */

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface SeatingPreference {
  id: string
  name: string
  type: "VIP" | "Lounge" | "Outdoor"
  capacity: number
  location: string
  amenities: string[]
  priceMultiplier: number
  isActive: boolean
}

interface SeatingPreferenceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preference: SeatingPreference | null
  onSave: (preference: Omit<SeatingPreference, "id">) => void
}

export function SeatingPreferenceDialog({ open, onOpenChange, preference, onSave }: SeatingPreferenceDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "Lounge" as "VIP" | "Lounge" | "Outdoor",
    capacity: 8,
    location: "",
    amenities: [] as string[],
    priceMultiplier: 1.0,
    isActive: true,
  })
  const [newAmenity, setNewAmenity] = useState("")

  useEffect(() => {
    if (preference) {
      setFormData({
        name: preference.name,
        type: preference.type,
        capacity: preference.capacity,
        location: preference.location,
        amenities: [...preference.amenities],
        priceMultiplier: preference.priceMultiplier,
        isActive: preference.isActive,
      })
    } else {
      setFormData({
        name: "",
        type: "Lounge",
        capacity: 8,
        location: "",
        amenities: [],
        priceMultiplier: 1.0,
        isActive: true,
      })
    }
  }, [preference, open])

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()],
      }))
      setNewAmenity("")
    }
  }

  const handleRemoveAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a !== amenity),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{preference ? "Edit Seating Area" : "Add New Seating Area"}</DialogTitle>
          <DialogDescription>Configure the seating preferences and amenities for this area.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Area Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Premium VIP Section"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Seating Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "VIP" | "Lounge" | "Outdoor") =>
                  setFormData((prev:any) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="Lounge">Lounge</SelectItem>
                  <SelectItem value="Outdoor">Outdoor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData((prev) => ({ ...prev, capacity: Number.parseInt(e.target.value) || 1 }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceMultiplier">Price Multiplier</Label>
              <Input
                id="priceMultiplier"
                type="number"
                step="0.1"
                min="0.1"
                value={formData.priceMultiplier}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, priceMultiplier: Number.parseFloat(e.target.value) || 1.0 }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Upper Level - North Wing"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Amenities</Label>
            <div className="flex gap-2">
              <Input
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Add amenity"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddAmenity())}
              />
              <Button type="button" onClick={handleAddAmenity} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.amenities.map((amenity, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {amenity}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveAmenity(amenity)} />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{preference ? "Update" : "Create"} Seating Area</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
