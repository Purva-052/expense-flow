/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import PageLayout from '@/components/layout/layout-provider'
import { GlobalTable } from '@/components/table/global-table'
import GlobalFilterSection from '@/components/table/global-table-filter'
import TablePageHeader from '@/components/table/table-page-header'
import { FilterConfig } from '@/components/table/table-toolbar'
import { useGetMenuCategories } from '../admin-menu-categories/services'
import { ActionFormModal } from './components/action'
import { columns } from './components/columns'
import { ViewMenuItemModal } from './components/view-model'
import { useGetMenuData } from './services'
import { useMenuStore } from './stores/useMenuStore'

const MenuPage = () => {
  const { open, setOpen } = useMenuStore()

  const { data: categoryList }: any = useGetMenuCategories()
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: '',
    categoryId: undefined,
  })

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    pagination: true,
    categoryId: listParams.categoryId,
  }

  const { data: listData, isPending: loading } = useGetMenuData(apiParams)

  const totalCount = (listData as any)?.metadata?.totalCount

  const handleSearch = (search: string | undefined) => {
    setListParams({ ...listParams, search: search ?? '', currentPage: 1 })
  }

  const handleSelect = (value: any) => {
    console.log('Selected category:', value)
    setListParams({
      ...listParams,
      categoryId: value === 'all' ? undefined : value, // 'all' resets filter
      currentPage: 1,
    })
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
    {
      type: 'select',
      key: 'category',
      placeholder: 'Filter by category', // This will now show correctly
      options: [
        { label: 'All Categories', value: 'all' }, // optional, user can select
        ...(categoryList?.data?.map((option: any) => ({
          label: option.name,
          value: option.id.toString(), // ensure it's string
        })) ?? []),
      ],
      value: listParams.categoryId, // Keep undefined initially
      onChange: handleSelect,
    },
  ]

  const handleAdd = () => {
    setOpen('add')
  }

  return (
    <PageLayout>
      <TablePageHeader
        title='Menu'
        buttonText='Add Menu'
        onButtonClick={handleAdd}
      >
        Manage your Menu here.
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
      <ViewMenuItemModal />
    </PageLayout>
  )
}

export default MenuPage
