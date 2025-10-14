/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface ClubTable {
  id: string
  name: string
  capacity: number
  shape: "Round" | "Square" | "Rectangle" | "Oval"
  size: string
  location: string
  seatingArea: string
  status: "Available" | "Reserved" | "Occupied" | "Maintenance"
  isActive: boolean
}

interface TableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: ClubTable | null
  onSave: (table: Omit<ClubTable, "id">) => void
}

const seatingAreas = [
  "Premium VIP Section",
  "Rooftop Lounge",
  "Garden Terrace",
  "Executive Lounge",
  "Main Bar",
  "Main Floor",
  "Dance Floor Area",
  "Private Dining",
]

export function TableDialog({ open, onOpenChange, table, onSave }: TableDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    capacity: 4,
    shape: "Round" as "Round" | "Square" | "Rectangle" | "Oval",
    size: "",
    location: "",
    seatingArea: "",
    status: "Available" as "Available" | "Reserved" | "Occupied" | "Maintenance",
    isActive: true,
  })

  useEffect(() => {
    if (table) {
      setFormData({
        name: table.name,
        capacity: table.capacity,
        shape: table.shape,
        size: table.size,
        location: table.location,
        seatingArea: table.seatingArea,
        status: table.status,
        isActive: table.isActive,
      })
    } else {
      setFormData({
        name: "",
        capacity: 4,
        shape: "Round",
        size: "",
        location: "",
        seatingArea: "",
        status: "Available",
        isActive: true,
      })
    }
  }, [table, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const getSuggestedSizes = (shape: string) => {
    switch (shape) {
      case "Round":
        return ["Small (3ft diameter)", "Medium (4ft diameter)", "Large (6ft diameter)", "Extra Large (8ft diameter)"]
      case "Square":
        return ["Small (3x3 ft)", "Medium (4x4 ft)", "Large (6x6 ft)", "Extra Large (8x8 ft)"]
      case "Rectangle":
        return ["Small (4x2 ft)", "Medium (6x3 ft)", "Large (8x4 ft)", "Extra Large (10x5 ft)"]
      case "Oval":
        return ["Small (4x2 ft)", "Medium (6x3 ft)", "Large (8x4 ft)", "Extra Large (10x5 ft)"]
      default:
        return []
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{table ? "Edit Table" : "Add New Table"}</DialogTitle>
          <DialogDescription>Configure the table details including capacity, size, and location.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Table Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., VIP Table 1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Seating Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                max="20"
                value={formData.capacity}
                onChange={(e) => setFormData((prev) => ({ ...prev, capacity: Number.parseInt(e.target.value) || 1 }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shape">Table Shape</Label>
              <Select
                value={formData.shape}
                onValueChange={(value: "Round" | "Square" | "Rectangle" | "Oval") =>
                  setFormData((prev:any) => ({ ...prev, shape: value, size: "" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Round">Round</SelectItem>
                  <SelectItem value="Square">Square</SelectItem>
                  <SelectItem value="Rectangle">Rectangle</SelectItem>
                  <SelectItem value="Oval">Oval</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Table Size</Label>
              <Select
                value={formData.size}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, size: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {getSuggestedSizes(formData.shape).map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., VIP Section - North"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seatingArea">Seating Area</Label>
              <Select
                value={formData.seatingArea}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, seatingArea: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select seating area" />
                </SelectTrigger>
                <SelectContent>
                  {seatingAreas.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Current Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "Available" | "Reserved" | "Occupied" | "Maintenance") =>
                setFormData((prev:any) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Reserved">Reserved</SelectItem>
                <SelectItem value="Occupied">Occupied</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive">Active Table</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{table ? "Update" : "Create"} Table</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
