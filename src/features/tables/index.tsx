import { useState } from 'react'
import { Plus, Search, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Main } from '@/components/layout/main'
import { TableCard } from './components/table-card'
import { TableConfigForm } from './components/table-form'
import { TableLayoutView } from './components/table-layout-view'

interface TableVariant {
  id: string
  name: string
  capacity: number
  type: 'round' | 'square' | 'rectangular' | 'booth'
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
  status: 'available' | 'occupied' | 'reserved' | 'maintenance'
  currentReservation?: {
    customerName: string
    time: string
    partySize: number
  }
  createdAt: string
}

// Mock available variants (from Master Admin)
const availableVariants: TableVariant[] = [
  {
    id: '1',
    name: '2-Seater Round',
    capacity: 2,
    type: 'round',
    dimensions: { width: 80, height: 80 },
    description: 'Perfect for intimate dining',
  },
  {
    id: '2',
    name: '4-Seater Square',
    capacity: 4,
    type: 'square',
    dimensions: { width: 120, height: 120 },
    description: 'Standard family table',
  },
  {
    id: '3',
    name: '6-Seater Rectangular',
    capacity: 6,
    type: 'rectangular',
    dimensions: { width: 180, height: 90 },
    description: 'Great for larger groups',
  },
  {
    id: '4',
    name: '4-Seater Booth',
    capacity: 4,
    type: 'booth',
    dimensions: { width: 150, height: 100 },
    description: 'Cozy booth seating',
  },
]

// Mock configured tables
const mockClubTables: ClubTable[] = [
  {
    id: '1',
    tableNumber: 'T01',
    variantId: '2',
    variant: availableVariants[1],
    position: { x: 100, y: 100 },
    status: 'occupied',
    currentReservation: {
      customerName: 'John Smith',
      time: '7:30 PM',
      partySize: 4,
    },
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    tableNumber: 'T02',
    variantId: '1',
    variant: availableVariants[0],
    position: { x: 250, y: 100 },
    status: 'available',
    createdAt: '2024-01-15',
  },
  {
    id: '3',
    tableNumber: 'T03',
    variantId: '3',
    variant: availableVariants[2],
    position: { x: 100, y: 250 },
    status: 'reserved',
    currentReservation: {
      customerName: 'Sarah Johnson',
      time: '8:00 PM',
      partySize: 6,
    },
    createdAt: '2024-01-16',
  },
  {
    id: '4',
    tableNumber: 'T04',
    variantId: '4',
    variant: availableVariants[3],
    position: { x: 350, y: 200 },
    status: 'maintenance',
    createdAt: '2024-01-17',
  },
]

export default function TablesComponent() {
  // const { user, isLoading } = useAuth()
  // const router = useRouter()
  // const { toast } = useToast()
  const [clubTables, setClubTables] = useState<ClubTable[]>(mockClubTables)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingTable, setEditingTable] = useState<ClubTable | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'layout'>('grid')

  // useEffect(() => {
  //   if (!isLoading && (!user || user.role !== "club-admin")) {
  //     router.push("/")
  //   }
  // }, [user, isLoading, router])

  const filteredTables = clubTables.filter((table) => {
    const matchesSearch =
      table.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.variant.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || table.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleAddTable = (
    tableData: Omit<ClubTable, 'id' | 'createdAt' | 'variant'>
  ) => {
    const variant = availableVariants.find((v) => v.id === tableData.variantId)
    if (!variant) return

    const newTable: ClubTable = {
      ...tableData,
      variant,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    }
    setClubTables([...clubTables, newTable])
    setShowForm(false)
    // Toaster({
    //   title: "Table added",
    //   description: `Table ${tableData.tableNumber} has been successfully configured.`,
    // })
  }

  const handleEditTable = (
    tableData: Omit<ClubTable, 'id' | 'createdAt' | 'variant'>
  ) => {
    if (!editingTable) return

    const variant = availableVariants.find((v) => v.id === tableData.variantId)
    if (!variant) return

    const updatedTables = clubTables.map((table) =>
      table.id === editingTable.id ? { ...table, ...tableData, variant } : table
    )
    setClubTables(updatedTables)
    setEditingTable(null)
    setShowForm(false)
    // Toaster({
    //   title: "Table updated",
    //   description: `Table ${tableData.tableNumber} has been successfully updated.`,
    // })
  }

  const handleDeleteTable = (tableId: string) => {
    // const tableToDelete = clubTables.find((table) => table.id === tableId)
    setClubTables(clubTables.filter((table) => table.id !== tableId))
    // Toaster({
    //   title: "Table removed",
    //   description: `Table ${tableToDelete?.tableNumber} has been successfully removed.`,
    // })
  }

  const handleStatusChange = (
    tableId: string,
    newStatus: ClubTable['status']
  ) => {
    const updatedTables = clubTables.map((table) =>
      table.id === tableId ? { ...table, status: newStatus } : table
    )
    setClubTables(updatedTables)
    // const table = clubTables.find((t) => t.id === tableId)
    // Toaster({
    //   title: "Status updated",
    //   description: `Table ${table?.tableNumber} is now ${newStatus}.`,
    // })
  }

  const openEditForm = (table: ClubTable) => {
    setEditingTable(table)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingTable(null)
  }

  // if (isLoading || !user || user.role !== "club-admin") {
  //   return <div>Loading...</div>
  // }

  if (showForm) {
    return (
      <TableConfigForm
        table={editingTable}
        availableVariants={availableVariants}
        existingTables={clubTables}
        onSubmit={editingTable ? handleEditTable : handleAddTable}
        onCancel={closeForm}
      />
    )
  }

  return (
    <Main>
      <div className='space-y-6'>
        {/* Header Actions */}
        <div className='flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center'>
          <div className='flex flex-1 flex-col gap-4 sm:flex-row'>
            <div className='relative max-w-md flex-1'>
              <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
              <Input
                placeholder='Search tables...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-full sm:w-48'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='available'>Available</SelectItem>
                <SelectItem value='occupied'>Occupied</SelectItem>
                <SelectItem value='reserved'>Reserved</SelectItem>
                <SelectItem value='maintenance'>Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'layout' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setViewMode('layout')}
            >
              Layout
            </Button>
            <Button
              onClick={() => setShowForm(true)}
              className='flex items-center gap-2'
            >
              <Plus className='h-4 w-4' />
              Add Table
            </Button>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {filteredTables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                onEdit={() => openEditForm(table)}
                onDelete={() => handleDeleteTable(table.id)}
                onStatusChange={(status) =>
                  handleStatusChange(table.id, status)
                }
              />
            ))}
          </div>
        )}

        {/* Layout View */}
        {viewMode === 'layout' && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MapPin className='h-5 w-5' />
                Restaurant Layout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TableLayoutView
                tables={filteredTables}
                onTableClick={(table) => openEditForm(table)}
                onStatusChange={handleStatusChange}
              />
            </CardContent>
          </Card>
        )}

        {filteredTables.length === 0 && (
          <Card>
            <CardContent className='py-8 text-center'>
              <p className='text-gray-500'>
                No tables found matching your criteria.
              </p>
              <Button onClick={() => setShowForm(true)} className='mt-4'>
                Add Your First Table
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardContent className='p-4'>
              <div className='text-2xl font-bold text-blue-600'>
                {clubTables.length}
              </div>
              <p className='text-sm text-gray-600'>Total Tables</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <div className='text-2xl font-bold text-green-600'>
                {clubTables.filter((t) => t.status === 'available').length}
              </div>
              <p className='text-sm text-gray-600'>Available</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <div className='text-2xl font-bold text-red-600'>
                {clubTables.filter((t) => t.status === 'occupied').length}
              </div>
              <p className='text-sm text-gray-600'>Occupied</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <div className='text-2xl font-bold text-purple-600'>
                {clubTables.reduce(
                  (sum, table) => sum + table.variant.capacity,
                  0
                )}
              </div>
              <p className='text-sm text-gray-600'>Total Capacity</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Main>
  )
}
