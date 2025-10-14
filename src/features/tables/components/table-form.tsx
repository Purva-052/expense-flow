/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

interface TableVariant {
  id: string
  name: string
  capacity: number
  type: "round" | "square" | "rectangular" | "booth"
  dimensions: {
    width: number
    height: number
  }
  description: string
}

interface ClubTable {
  id: string
  tableNumber: string
  variantId: string
  variant: TableVariant
  position: {
    x: number
    y: number
  }
  status: "available" | "occupied" | "reserved" | "maintenance"
  currentReservation?: {
    customerName: string
    time: string
    partySize: number
  }
  createdAt: string
}

interface TableConfigFormProps {
  table?: ClubTable | null
  availableVariants: TableVariant[]
  existingTables: ClubTable[]
  onSubmit: (tableData: Omit<ClubTable, "id" | "createdAt" | "variant">) => void
  onCancel: () => void
}

export function TableConfigForm({
  table,
  availableVariants,
  existingTables,
  onSubmit,
  onCancel,
}: TableConfigFormProps) {
  const [formData, setFormData] = useState({
    tableNumber: table?.tableNumber || "",
    variantId: table?.variantId || "",
    position: {
      x: table?.position.x || 100,
      y: table?.position.y || 100,
    },
    status: table?.status || ("available" as const),
    currentReservation: table?.currentReservation || undefined,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const selectedVariant = availableVariants.find((v) => v.id === formData.variantId)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.tableNumber.trim()) {
      newErrors.tableNumber = "Table number is required"
    } else {
      // Check for duplicate table numbers (excluding current table if editing)
      const isDuplicate = existingTables.some((t) => t.tableNumber === formData.tableNumber && t.id !== table?.id)
      if (isDuplicate) {
        newErrors.tableNumber = "Table number already exists"
      }
    }

    if (!formData.variantId) newErrors.variantId = "Table variant is required"
    if (formData.position.x < 0 || formData.position.x > 800) newErrors.positionX = "X position must be between 0-800"
    if (formData.position.y < 0 || formData.position.y > 600) newErrors.positionY = "Y position must be between 0-600"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.includes("position.")) {
      const positionField = field.split(".")[1]
      setFormData({
        ...formData,
        position: {
          ...formData.position,
          [positionField]: value,
        },
      })
    } else {
      setFormData({ ...formData, [field]: value })
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  return (
    <div className="max-w-2xl mx-auto md:mt-40 mt-20">
      <Card>
        <CardHeader>
          <CardTitle>{table ? "Edit Table Configuration" : "Add New Table"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tableNumber">Table Number *</Label>
                  <Input
                    id="tableNumber"
                    value={formData.tableNumber}
                    onChange={(e) => handleInputChange("tableNumber", e.target.value)}
                    placeholder="e.g., T01, A1, etc."
                    className={errors.tableNumber ? "border-red-500" : ""}
                  />
                  {errors.tableNumber && <p className="text-sm text-red-600">{errors.tableNumber}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Initial Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "available" | "occupied" | "reserved" | "maintenance") =>
                      handleInputChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Table Variant Selection */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900">Table Variant</h3>

              <div className="space-y-2">
                <Label htmlFor="variantId">Select Variant *</Label>
                <Select value={formData.variantId} onValueChange={(value) => handleInputChange("variantId", value)}>
                  <SelectTrigger className={errors.variantId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Choose a table variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVariants.map((variant) => (
                      <SelectItem key={variant.id} value={variant.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{variant.name}</span>
                          <div className="flex items-center gap-2 ml-4">
                            <Users className="h-4 w-4" />
                            <span>{variant.capacity}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.variantId && <p className="text-sm text-red-600">{errors.variantId}</p>}
              </div>

              {/* Selected Variant Preview */}
              {selectedVariant && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Selected Variant Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <Badge variant="outline" className="ml-2 capitalize">
                        {selectedVariant.type}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Capacity:</span>
                      <span className="ml-2 font-medium">{selectedVariant.capacity} people</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Dimensions:</span>
                      <span className="ml-2 font-medium">
                        {selectedVariant.dimensions.width} × {selectedVariant.dimensions.height} cm
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{selectedVariant.description}</p>
                </div>
              )}
            </div>

            {/* Position Configuration */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900">Layout Position</h3>
              <p className="text-sm text-gray-600">
                Set the table position in your restaurant layout (0-800 for X, 0-600 for Y)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="positionX">X Position (horizontal) *</Label>
                  <Input
                    id="positionX"
                    type="number"
                    min="0"
                    max="800"
                    value={formData.position.x}
                    onChange={(e) => handleInputChange("position.x", Number.parseInt(e.target.value) || 0)}
                    className={errors.positionX ? "border-red-500" : ""}
                  />
                  {errors.positionX && <p className="text-sm text-red-600">{errors.positionX}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="positionY">Y Position (vertical) *</Label>
                  <Input
                    id="positionY"
                    type="number"
                    min="0"
                    max="600"
                    value={formData.position.y}
                    onChange={(e) => handleInputChange("position.y", Number.parseInt(e.target.value) || 0)}
                    className={errors.positionY ? "border-red-500" : ""}
                  />
                  {errors.positionY && <p className="text-sm text-red-600">{errors.positionY}</p>}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">{table ? "Update Table" : "Add Table"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
