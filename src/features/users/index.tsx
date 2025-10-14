import { useState } from 'react'
// UPDATE: Add imports for types
import PageLayout from '@/components/layout/layout-provider'
import { ColumnDef, PaginationState } from '@tanstack/react-table'
// UPDATE: Add useEffect to handle data fetching
import { GlobalTable } from '@/components/table/global-table'
import GlobalFilterSection from '@/components/table/global-table-filter'
import TablePageHeader from '@/components/table/table-page-header'
import { UsersDialogs } from './components/users-dialogs'
import UsersProvider from './context/users-context'

interface LoadEntry {
  time: string
  operator: string
  newCustomers: string
  product: string
  topIndustries: string
  status: 'Out of Range' | 'Calibrated'
  project: string
}

export default function Users() {
  const columns: ColumnDef<LoadEntry>[] = [
    { header: 'Time', accessorKey: 'time' },
    { header: 'Operator', accessorKey: 'operator' },
    { header: 'New Customers', accessorKey: 'newCustomers' },
    { header: 'Product', accessorKey: 'product' },
    { header: 'Top Industries', accessorKey: 'topIndustries' },
    { header: 'Status', accessorKey: 'status' },
    { header: 'Project', accessorKey: 'project' },
  ]

  // This represents your full dataset on the server
  const allMockData: LoadEntry[] = [
    {
      time: '09:15',
      operator: 'John Davidson',
      newCustomers: 'Excavator-01',
      product: 'Iron Ore',
      topIndustries: '50%',
      status: 'Out of Range',
      project: 'North Pit',
    },
    {
      time: '09:22',
      operator: 'Sarah Mitchell',
      newCustomers: 'Loader-01',
      product: 'Coal',
      topIndustries: '80%',
      status: 'Out of Range',
      project: 'South Mine',
    },
    {
      time: '09:23',
      operator: 'Sarah Mitchell',
      newCustomers: 'Excavator-02',
      product: 'Iron Ore',
      topIndustries: '80%',
      status: 'Calibrated',
      project: 'North Pit',
    },
    {
      time: '09:24',
      operator: 'Sarah Mitchell',
      newCustomers: 'Truck-01',
      product: 'Limestone',
      topIndustries: '80%',
      status: 'Out of Range',
      project: 'West Quarry',
    },
    {
      time: '09:25',
      operator: 'Sarah Mitchell',
      newCustomers: 'Loader-01',
      product: 'Coal',
      topIndustries: '80%',
      status: 'Calibrated',
      project: 'South Mine',
    },
    {
      time: '09:26',
      operator: 'Sarah Mitchell',
      newCustomers: 'Loader-01',
      product: 'Iron Ore',
      topIndustries: '80%',
      status: 'Out of Range',
      project: 'North Pit',
    },
    {
      time: '09:27',
      operator: 'Sarah Mitchell',
      newCustomers: 'Loader-01',
      product: 'Coal',
      topIndustries: '80%',
      status: 'Calibrated',
      project: 'South Mine',
    },
    {
      time: '09:28',
      operator: 'John Davidson',
      newCustomers: 'Excavator-01',
      product: 'Iron Ore',
      topIndustries: '50%',
      status: 'Out of Range',
      project: 'North Pit',
    },
    {
      time: '09:29',
      operator: 'Sarah Mitchell',
      newCustomers: 'Loader-01',
      product: 'Coal',
      topIndustries: '80%',
      status: 'Out of Range',
      project: 'South Mine',
    },
    {
      time: '09:30',
      operator: 'Sarah Mitchell',
      newCustomers: 'Excavator-02',
      product: 'Iron Ore',
      topIndustries: '80%',
      status: 'Calibrated',
      project: 'North Pit',
    },
    {
      time: '09:31',
      operator: 'Sarah Mitchell',
      newCustomers: 'Truck-01',
      product: 'Limestone',
      topIndustries: '80%',
      status: 'Out of Range',
      project: 'West Quarry',
    },
    {
      time: '09:32',
      operator: 'Sarah Mitchell',
      newCustomers: 'Loader-01',
      product: 'Coal',
      topIndustries: '80%',
      status: 'Calibrated',
      project: 'South Mine',
    },
    {
      time: '09:33',
      operator: 'Sarah Mitchell',
      newCustomers: 'Loader-01',
      product: 'Iron Ore',
      topIndustries: '80%',
      status: 'Out of Range',
      project: 'North Pit',
    },
    {
      time: '09:34',
      operator: 'Sarah Mitchell',
      newCustomers: 'Loader-01',
      product: 'Coal',
      topIndustries: '80%',
      status: 'Calibrated',
      project: 'South Mine',
    },
  ]

  // --- START: NEW STATE MANAGEMENT ---

  // 1. State to hold the pagination details (pageIndex starts at 0)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // 2. State for the data to be displayed on the current page
  const [totalCount] = useState(0)

  const handlePaginationChange = (newPagination: PaginationState) => {
    setPagination(newPagination)
  }

  return (
    <UsersProvider>
      <PageLayout>
        <TablePageHeader title='Users'>
          Manage users and their permissions.
        </TablePageHeader>
        <GlobalFilterSection filters={[]} />
        <GlobalTable
          data={allMockData}
          columns={columns as any}
          totalCount={totalCount}
          // pageIndex={pagination.pageIndex}
          currentPage={pagination.pageIndex + 1}
          pageSize={pagination.pageSize}
          onPaginationChange={handlePaginationChange}
        />
      </PageLayout>
      <UsersDialogs />
    </UsersProvider>
  )
}
