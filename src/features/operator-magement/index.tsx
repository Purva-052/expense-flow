

import PageLayout from '@/components/layout/layout-provider'
import { GlobalTable } from '@/components/table/global-table'
import GlobalFilterSection from '@/components/table/global-table-filter'
import TablePageHeader from '@/components/table/table-page-header'
import { FilterConfig } from '@/components/table/table-toolbar'
import { useState } from 'react'
import { ActionFormModal } from './components/actions'
import { columns } from './components/columns'
import { useGetOperators } from './services'
import { useOperatorStore } from './store'
import { OperatorsResponse } from './types'

const OperatorsPage = () => {
  const { open, setOpen } = useOperatorStore()
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: '',
  })
  const apiParams = {
    // Assuming your API supports these params
    // page: listParams.currentPage,
    // limit: listParams.pageSize,
    search: listParams.search,
  }

  const { data: listData, isPending: loading } = useGetOperators(apiParams)
  const totalCount = (listData as OperatorsResponse)?.count

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
      placeholder: 'Search by name, email...',
      key: 'search',
      value: listParams.search,
      onChange: handleSearch,
    },
  ]
  
  const handleAdd = () => {
    setOpen('add')
  }

  return (
    <PageLayout>
      <TablePageHeader
        title='Operators'
        buttonText='Add Operator'
        onButtonClick={handleAdd}
      >
        Manage your operators here.
      </TablePageHeader>
      <GlobalFilterSection filters={filters ?? []} />
      <GlobalTable
        pageSize={listParams.pageSize}
        currentPage={listParams.currentPage}
        totalCount={totalCount ?? 0}
        data={(listData as OperatorsResponse)?.docs ?? []}
        onPaginationChange={handlePaginationChange}
        columns={columns}
        loading={loading}
        isPaginationEnabled
      />
      {open && <ActionFormModal />}
    </PageLayout>
  )
}

export default OperatorsPage