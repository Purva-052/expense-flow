"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Users, Clock } from "lucide-react"

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

interface TableCardProps {
  table: ClubTable
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: ClubTable["status"]) => void
}

export function TableCard({ table, onEdit, onDelete, onStatusChange }: TableCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200"
      case "occupied":
        return "bg-red-100 text-red-800 border-red-200"
      case "reserved":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "maintenance":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTableShape = (type: string) => {
    const baseClasses = "flex items-center justify-center text-white font-bold"
    switch (type) {
      case "round":
        return <div className={`w-16 h-16 bg-blue-500 rounded-full ${baseClasses}`}>{table.tableNumber}</div>
      case "square":
        return <div className={`w-16 h-16 bg-green-500 ${baseClasses}`}>{table.tableNumber}</div>
      case "rectangular":
        return <div className={`w-20 h-12 bg-purple-500 ${baseClasses}`}>{table.tableNumber}</div>
      case "booth":
        return <div className={`w-18 h-14 bg-orange-500 rounded-lg ${baseClasses}`}>{table.tableNumber}</div>
      default:
        return <div className={`w-16 h-16 bg-gray-500 ${baseClasses}`}>{table.tableNumber}</div>
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Table {table.tableNumber}</CardTitle>
          <Badge className={getStatusColor(table.status)}>{table.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visual Representation */}
        <div className="flex justify-center py-4">{getTableShape(table.variant.type)}</div>

        {/* Table Details */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Variant:</span>
            <span className="text-sm font-medium">{table.variant.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Capacity:</span>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium">{table.variant.capacity}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Type:</span>
            <Badge variant="outline" className="capitalize">
              {table.variant.type}
            </Badge>
          </div>
        </div>

        {/* Current Reservation */}
        {table.currentReservation && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Current Reservation</span>
            </div>
            <div className="text-sm text-blue-700">
              <p className="font-medium">{table.currentReservation.customerName}</p>
              <p>
                {table.currentReservation.time} • {table.currentReservation.partySize} guests
              </p>
            </div>
          </div>
        )}

        {/* Status Change */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Change Status:</label>
          <Select value={table.status} onValueChange={(value: ClubTable["status"]) => onStatusChange(value)}>
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

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
