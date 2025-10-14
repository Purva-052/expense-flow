/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import API from '@/config/api/api'
import PageLayout from '@/components/layout/layout-provider'
import { GlobalTable } from '@/components/table/global-table'
import GlobalFilterSection from '@/components/table/global-table-filter'
import TablePageHeader from '@/components/table/table-page-header'
import { FilterConfig } from '@/components/table/table-toolbar'
import { useGetDropdownOptions } from '../venue/services/useDropdown'
import { ActionFormModal } from './components/action'
import { columns } from './components/columns'
import { ViewLocalityModal } from './components/view-model'
import { useGetLocalityData } from './services'
import { useLocalityStore } from './stores/useLocalityStore'

const LocalityPage = () => {
  const [selectedCountryID, setSelectedCountryID] = useState(null)
  const [selectedStateID, setSelectedStateID] = useState(null)
  const { open, setOpen } = useLocalityStore()
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: '',
    countryId: null,
    stateId: null,
    cityId: null,
  })

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    countryId: listParams.countryId,
    stateId: listParams.stateId,
    cityId: listParams.cityId,
    pagination: true,
  }

  const { data: listData, isPending: loading } = useGetLocalityData(apiParams)
  const { data: countryOptions = [], isLoading: isLoadingCountry }: any =
    useGetDropdownOptions(API.venue.country, { pagination: false })
  const { data: stateOptions = [], isLoading: isLoadingState }: any =
    useGetDropdownOptions(
      API.venue.state,
      { pagination: false, countryId: selectedCountryID },
      !!selectedCountryID // ✅ enabled only when a country is selected
    )
  const { data: cityOptions = [], isLoading: isLoadingCity }: any =
    useGetDropdownOptions(
      API.venue.city,
      {
        pagination: false,
        countryId: selectedCountryID,
        stateId: selectedStateID,
      },
      !!selectedCountryID && !!selectedStateID
    )
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
      countryId: value ?? null, // handle "remove"
      stateId: null, // ✅ reset state whenever country changes
      cityId: null,
      currentPage: 1,
    })
    setSelectedCountryID(value ?? null) // also update selectedCountryID
    setSelectedStateID(null)
  }

  const handleStateChange = (value: any) => {
    setListParams({
      ...listParams,
      stateId: value, // 'all' resets filter
      cityId: null,
      currentPage: 1,
    })
    setSelectedStateID(value ?? null)
  }

  const handleCityChange = (value: any) => {
    setListParams({
      ...listParams,
      cityId: value, // 'all' resets filter
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
    {
      type: 'select',
      key: 'stateId',
      placeholder: 'Filter by state',
      options: stateOptions?.data?.map((value: any) => ({
        label: value?.name,
        value: value?.id,
      })),
      value: listParams.stateId,
      onChange: handleStateChange,
      isLoading: isLoadingState,
      disable: !selectedCountryID, // ✅ disable if no country selected
    },
    {
      type: 'select',
      key: 'cityId',
      placeholder: 'Filter by city',
      options: cityOptions?.data?.map((value: any) => ({
        label: value?.name,
        value: value?.id,
      })),
      value: listParams.cityId,
      onChange: handleCityChange,
      isLoading: isLoadingCity,
      disable: !selectedStateID, // ✅ disable if no country selected
    },
  ]

  const handleAdd = () => {
    setOpen('add')
  }

  return (
    <PageLayout>
      <TablePageHeader
        title='Locality'
        buttonText='Add Locality'
        onButtonClick={handleAdd}
      >
        Manage your Locality here.
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
      <ViewLocalityModal />
    </PageLayout>
  )
}

export default LocalityPage
