import { Main } from '@/components/layout/main'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Table, Users, Ruler, MapPin } from "lucide-react"
import { TableDialog } from "./components/TableDialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

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

const mockTables: ClubTable[] = [
  {
    id: "1",
    name: "VIP Table 1",
    capacity: 8,
    shape: "Round",
    size: "Large (6ft diameter)",
    location: "VIP Section - North",
    seatingArea: "Premium VIP Section",
    status: "Available",
    isActive: true,
  },
  {
    id: "2",
    name: "Lounge Table A",
    capacity: 4,
    shape: "Square",
    size: "Medium (4x4 ft)",
    location: "Main Lounge",
    seatingArea: "Rooftop Lounge",
    status: "Reserved",
    isActive: true,
  },
  {
    id: "3",
    name: "Outdoor Table 1",
    capacity: 6,
    shape: "Rectangle",
    size: "Large (6x3 ft)",
    location: "Garden Terrace",
    seatingArea: "Garden Terrace",
    status: "Occupied",
    isActive: true,
  },
  {
    id: "4",
    name: "Bar Table 1",
    capacity: 2,
    shape: "Round",
    size: "Small (3ft diameter)",
    location: "Bar Area",
    seatingArea: "Main Bar",
    status: "Available",
    isActive: true,
  },
  {
    id: "5",
    name: "Executive Table",
    capacity: 10,
    shape: "Oval",
    size: "Extra Large (8x4 ft)",
    location: "Executive Lounge",
    seatingArea: "Executive Lounge",
    status: "Maintenance",
    isActive: false,
  },
  {
    id: "6",
    name: "Cocktail Table 1",
    capacity: 4,
    shape: "Round",
    size: "Medium (4ft diameter)",
    location: "Dance Floor Area",
    seatingArea: "Main Floor",
    status: "Available",
    isActive: true,
  },
]

const TablesManagement = () => {
  const [tables, setTables] = useState<ClubTable[]>(mockTables)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<ClubTable | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterShape, setFilterShape] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const handleAddTable = () => {
    setEditingTable(null)
    setDialogOpen(true)
  }

  const handleEditTable = (table: ClubTable) => {
    setEditingTable(table)
    setDialogOpen(true)
  }

  const handleDeleteTable = (id: string) => {
    setTables((prev) => prev.filter((t) => t.id !== id))
  }

  const handleSaveTable = (table: Omit<ClubTable, "id">) => {
    if (editingTable) {
      setTables((prev) => prev.map((t) => (t.id === editingTable.id ? { ...table, id: editingTable.id } : t)))
    } else {
      const newTable: ClubTable = {
        ...table,
        id: Date.now().toString(),
      }
      setTables((prev) => [...prev, newTable])
    }
    setDialogOpen(false)
  }

  const filteredTables = tables.filter((table) => {
    const matchesStatus = filterStatus === "all" || table.status === filterStatus
    const matchesShape = filterShape === "all" || table.shape === filterShape
    const matchesSearch =
      table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.location.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesShape && matchesSearch
  })

  const getStatusColor = (status: ClubTable["status"]) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800 border-green-200"
      case "Reserved":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Occupied":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Maintenance":
        return "bg-red-100 text-red-800 border-red-200"
    }
  }

  const getShapeIcon = (_shape: ClubTable["shape"]) => {
    return <Table className="h-4 w-4" />
  }

  const activeTables = tables.filter((t) => t.isActive)
  const totalCapacity = activeTables.reduce((sum, t) => sum + t.capacity, 0)
  const availableTables = activeTables.filter((t) => t.status === "Available").length
  const tablesByShape = activeTables.reduce(
    (acc, table) => {
      acc[table.shape] = (acc[table.shape] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <Main>
          <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {/* <h2 className="text-3xl font-bold tracking-tight">Tables Management</h2> */}
          <p className="text-muted-foreground">Manage your club's table arrangements and configurations</p>
        </div>
        <Button onClick={handleAddTable} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Table
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
            <Table className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTables.length}</div>
            <p className="text-xs text-muted-foreground">Active tables</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity}</div>
            <p className="text-xs text-muted-foreground">Maximum guests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Now</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableTables}</div>
            <p className="text-xs text-muted-foreground">Ready for guests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Table Types</CardTitle>
            <Ruler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(tablesByShape).length}</div>
            <p className="text-xs text-muted-foreground">Different shapes</p>
          </CardContent>
        </Card>
      </div>

      {/* Table Types Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Table Types Overview</CardTitle>
          <CardDescription>Distribution of tables by shape and capacity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {Object.entries(tablesByShape).map(([shape, count]) => (
              <div key={shape} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  {getShapeIcon(shape as ClubTable["shape"])}
                  <span className="font-medium">{shape}</span>
                </div>
                <Badge variant="secondary">{count} tables</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search tables..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Reserved">Reserved</SelectItem>
            <SelectItem value="Occupied">Occupied</SelectItem>
            <SelectItem value="Maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterShape} onValueChange={setFilterShape}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by shape" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Shapes</SelectItem>
            <SelectItem value="Round">Round</SelectItem>
            <SelectItem value="Square">Square</SelectItem>
            <SelectItem value="Rectangle">Rectangle</SelectItem>
            <SelectItem value="Oval">Oval</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tables Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTables.map((table) => (
          <Card key={table.id} className={`${!table.isActive ? "opacity-60" : ""}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getShapeIcon(table.shape)}
                  <CardTitle className="text-lg">{table.name}</CardTitle>
                </div>
                <Badge className={getStatusColor(table.status)} variant="outline">
                  {table.status}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {table.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Capacity</span>
                  <div className="font-medium">{table.capacity} guests</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Shape</span>
                  <div className="font-medium">{table.shape}</div>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Size</span>
                <div className="font-medium">{table.size}</div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Seating Area</span>
                <Badge variant="secondary" className="text-xs">
                  {table.seatingArea}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <Badge className={table.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                  {table.isActive ? "Active" : "Inactive"}
                </Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditTable(table)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteTable(table.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <TableDialog open={dialogOpen} onOpenChange={setDialogOpen} table={editingTable} onSave={handleSaveTable} />
    </div>
    </Main>
  
  )
}

export default TablesManagement
