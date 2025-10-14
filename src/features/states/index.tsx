/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import PageLayout from '@/components/layout/layout-provider'
import { GlobalTable } from '@/components/table/global-table'
import GlobalFilterSection from '@/components/table/global-table-filter'
import TablePageHeader from '@/components/table/table-page-header'
import { FilterConfig } from '@/components/table/table-toolbar'
import { ActionFormModal } from './components/action'
import { columns } from './components/columns'
import { ViewStateModal } from './components/view-model'
import { useGetStateData } from './services'
import { useStateStore } from './stores/useStateStore'
import { useGetDropdownOptions } from '../venue/services/useDropdown'
import API from '@/config/api/api'

const StatesPage = () => {
  const { open, setOpen } = useStateStore()
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: '',
    countryId: null,
  })

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    countryId: listParams.countryId,
    pagination: true,
  }

  const { data: listData, isPending: loading } = useGetStateData(apiParams)
  const { data: countryOptions = [], isLoading: isLoadingCountry }: any =
    useGetDropdownOptions(API.venue.country, { pagination: false })

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
  const handleCountryChange = (value: any) => {
    setListParams({
      ...listParams,
      countryId: value, // 'all' resets filter
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
      key: 'countryId',
      placeholder: 'Filter by country',
      options: countryOptions?.data?.map((value: any) => {
        return { label: value?.name, value: value?.id }
      }),
      value: listParams.countryId, // 👈 pre-selects if set
      onChange: handleCountryChange,
      isLoading: isLoadingCountry,
    },
  ]

  const handleAdd = () => {
    setOpen('add')
  }

  return (
    <PageLayout>
      <TablePageHeader
        title='States'
        buttonText='Add States'
        onButtonClick={handleAdd}
      >
        Manage your States here.
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
      {open && <ActionFormModal />}
      <ViewStateModal />
    </PageLayout>
  )
}

export default StatesPage
