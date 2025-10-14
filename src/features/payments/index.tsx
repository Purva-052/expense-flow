/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import PageLayout from '@/components/layout/layout-provider'
import { GlobalTable } from '@/components/table/global-table'
import GlobalFilterSection from '@/components/table/global-table-filter'
import TablePageHeader from '@/components/table/table-page-header'
import { FilterConfig } from '@/components/table/table-toolbar'
import { columns } from './components/columns'
import { ViewPaymentModal } from './components/view-model'
import { useGetPaymentsData } from './services'

const PaymentsPage = () => {
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: '',
    status: undefined,
  })

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    status: listParams.status,
    pagination: true,
  }

  const { data: listData, isPending: loading } = useGetPaymentsData(apiParams)

  const totalCount = (listData as any)?.metadata?.totalCount

  const handleSearch = (search: string | undefined) => {
    setListParams({ ...listParams, search: search ?? '', currentPage: 1 })
  }

  const handlePaginationChange = (newPagination: {
    pageIndex: number
    pageSize: number
  }) => {
    setListParams({
      ...listParams,
      pageSize: newPagination.pageSize,
      currentPage: newPagination.pageIndex + 1,
    })
  }
  const handleStatusSelect = (value: any) => {
    setListParams({
      ...listParams,
      status: value, // 'all' resets filter
      currentPage: 1,
    })
  }

  const filters: FilterConfig[] = [
    {
      type: 'search',
      placeholder: 'Search by name ...',
      key: 'search',
      value: listParams.search,
      onChange: handleSearch,
    },
    {
      type: 'select',
      key: 'status',
      placeholder: 'Filter by Status', // This will now show correctly
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Success', value: 'succeeded' },
      ],
      value: listParams.status, // Keep undefined initially
      onChange: handleStatusSelect,
    },
  ]

  return (
    <PageLayout>
      <TablePageHeader title='Payments' showActionButton={false}>
        Manage your Payments here.
      </TablePageHeader>
      <GlobalFilterSection filters={filters ?? []} />
      <GlobalTable
        pageSize={listParams.pageSize}
        currentPage={listParams.currentPage}
        totalCount={totalCount ?? 0}
        data={(listData as any)?.data ?? []}
        onPaginationChange={handlePaginationChange}
        columns={columns}
        loading={loading}
        isPaginationEnabled
      />
      <ViewPaymentModal />
    </PageLayout>
  )
}

export default PaymentsPage
