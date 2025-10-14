/* eslint-disable @typescript-eslint/no-explicit-any */
import { Main } from '@/components/layout/main'
import { GlobalTable } from '@/components/table/global-table'
import GlobalFilterSection from '@/components/table/global-table-filter'
import TablePageHeader from '@/components/table/table-page-header'
import { Booking } from '../index'
import { createColumns } from './columns'
import { useAuthStore } from '@/stores/use-auth-store'

interface ListViewProps {
  bookings: Booking[]
  getStatusColor: (status: Booking['status']) => string
  loading: boolean
  totalCount: number | undefined
  listParams: any
  filters?: any[]
  handlePaginationChange: any
}

export const ListView = ({
  totalCount,
  getStatusColor,
  loading,
  listParams,
  filters,
  bookings,
  handlePaginationChange,
}: ListViewProps) => {
  const {user}=useAuthStore()
  const role = user?.user?.role?.name
  const columns = createColumns({ getStatusColor ,role})

  return (
    <Main>
      <TablePageHeader title='All Bookings' showActionButton={false}>
        Manage your Bookings here.
      </TablePageHeader>
      <GlobalFilterSection filters={filters ?? []} />
      <GlobalTable
        pageSize={listParams.pageSize}
        currentPage={listParams.currentPage}
        totalCount={totalCount ?? 0}
        data={bookings}
        onPaginationChange={handlePaginationChange}
        columns={columns} 
        loading={loading}
        isPaginationEnabled
      />
    </Main>
  )
}
