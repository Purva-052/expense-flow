"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface TableLayoutViewProps {
  tables: ClubTable[]
  onTableClick: (table: ClubTable) => void
  onStatusChange: (tableId: string, status: ClubTable["status"]) => void
}

export function TableLayoutView({ tables, onTableClick, onStatusChange }: TableLayoutViewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500 hover:bg-green-600"
      case "occupied":
        return "bg-red-500 hover:bg-red-600"
      case "reserved":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "maintenance":
        return "bg-gray-500 hover:bg-gray-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const getTableElement = (table: ClubTable) => {
    const baseClasses = `absolute cursor-pointer transition-all duration-200 flex items-center justify-center text-white font-bold text-sm shadow-lg ${getStatusColor(table.status)}`

    const style = {
      left: `${table.position.x}px`,
      top: `${table.position.y}px`,
    }

    switch (table.variant.type) {
      case "round":
        return (
          <div
            key={table.id}
            className={`${baseClasses} rounded-full`}
            style={{
              ...style,
              width: `${Math.max(table.variant.dimensions.width / 2, 60)}px`,
              height: `${Math.max(table.variant.dimensions.height / 2, 60)}px`,
            }}
            onClick={() => onTableClick(table)}
            title={`${table.tableNumber} - ${table.variant.name} (${table.status})`}
          >
            {table.tableNumber}
          </div>
        )
      case "square":
        return (
          <div
            key={table.id}
            className={baseClasses}
            style={{
              ...style,
              width: `${Math.max(table.variant.dimensions.width / 2, 60)}px`,
              height: `${Math.max(table.variant.dimensions.height / 2, 60)}px`,
            }}
            onClick={() => onTableClick(table)}
            title={`${table.tableNumber} - ${table.variant.name} (${table.status})`}
          >
            {table.tableNumber}
          </div>
        )
      case "rectangular":
        return (
          <div
            key={table.id}
            className={baseClasses}
            style={{
              ...style,
              width: `${Math.max(table.variant.dimensions.width / 2, 80)}px`,
              height: `${Math.max(table.variant.dimensions.height / 2, 50)}px`,
            }}
            onClick={() => onTableClick(table)}
            title={`${table.tableNumber} - ${table.variant.name} (${table.status})`}
          >
            {table.tableNumber}
          </div>
        )
      case "booth":
        return (
          <div
            key={table.id}
            className={`${baseClasses} rounded-lg`}
            style={{
              ...style,
              width: `${Math.max(table.variant.dimensions.width / 2, 70)}px`,
              height: `${Math.max(table.variant.dimensions.height / 2, 55)}px`,
            }}
            onClick={() => onTableClick(table)}
            title={`${table.tableNumber} - ${table.variant.name} (${table.status})`}
          >
            {table.tableNumber}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-sm">Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-500 rounded"></div>
          <span className="text-sm">Maintenance</span>
        </div>
      </div>

      {/* Layout Canvas */}
      <div
        className="relative bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
        style={{ width: "800px", height: "600px" }}
      >
        {/* Grid lines for reference */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 9 }, (_, i) => (
            <div
              key={`v-${i}`}
              className="absolute bg-gray-400"
              style={{ left: `${i * 100}px`, width: "1px", height: "100%" }}
            />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <div
              key={`h-${i}`}
              className="absolute bg-gray-400"
              style={{ top: `${i * 100}px`, height: "1px", width: "100%" }}
            />
          ))}
        </div>

        {/* Tables */}
        {tables.map((table) => getTableElement(table))}

        {/* Empty state */}
        {tables.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">No tables configured</p>
              <p className="text-sm">Add tables to see them in the layout</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-700">Quick Status Change:</span>
        {tables.map((table) => (
          <div key={table.id} className="flex items-center gap-2 p-2 bg-white border rounded-lg">
            <span className="text-sm font-medium">{table.tableNumber}:</span>
            <Select
              value={table.status}
              onValueChange={(value: ClubTable["status"]) => onStatusChange(table.id, value)}
            >
              <SelectTrigger className="w-32 h-8">
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
        ))}
      </div>
    </div>
  )
}
