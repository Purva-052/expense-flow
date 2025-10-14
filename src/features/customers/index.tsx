/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import PageLayout from '@/components/layout/layout-provider'
import { GlobalTable } from '@/components/table/global-table'
import GlobalFilterSection from '@/components/table/global-table-filter'
import TablePageHeader from '@/components/table/table-page-header'
import { FilterConfig } from '@/components/table/table-toolbar'
import { columns } from './components/columns'
import { CustomerDetails } from './components/viewCustomerDetails'
import { useGetCustomerListData } from './services'

// import { useGetCountryList } from './services'
// import { useCountryStore } from './stores/useCountryStore'

const CustomerPage = () => {
  // const { open, setOpen } = useCountryStore()
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: '',
  })

  const { data: customerList } = useGetCustomerListData()

  console.log('🚀 ~ CustomerPage ~ customerList:', customerList)

  // const apiParams = {
  //   page: listParams.currentPage,
  //   limit: listParams.pageSize,
  //   search: listParams.search,
  //   pagination: true,
  // }

  // const { data: listData, isPending: loading } = useGetCountryList(apiParams)

  const totalCount = (customerList as any)?.metadata?.totalCount
  // const totalCount = 0

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

  const filters: FilterConfig[] = [
    {
      type: 'search',
      placeholder: 'Search by name ...',
      key: 'search',
      value: listParams.search,
      onChange: handleSearch,
    },
  ]

  return (
    <PageLayout>
      <TablePageHeader title='Customers' showActionButton={false}>
        Manage your Customers here.
      </TablePageHeader>
      <GlobalFilterSection filters={filters ?? []} />
      <GlobalTable
        pageSize={listParams.pageSize}
        currentPage={listParams.currentPage}
        totalCount={totalCount ?? 0}
        data={(customerList as any)?.data ?? []}
        onPaginationChange={handlePaginationChange}
        columns={columns}
        // loading={loading}
        isPaginationEnabled
      />

      <CustomerDetails />
    </PageLayout>
  )
}

export default CustomerPage
