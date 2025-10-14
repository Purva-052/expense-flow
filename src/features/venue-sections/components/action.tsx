/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
// src/features/states/components/actions.tsx
import API from '@/config/api/api'
import { useAuthStore } from '@/stores/use-auth-store'
import { DeleteModal } from '@/components/model/delete-model'
import { SectionFormModal } from '@/features/venue/components/sectionFormModel'
import {
  useCreateDropdownOption,
  useGetDropdownOptions,
} from '@/features/venue/services/useDropdown'
import {
  useCreateVenueSection,
  useDeleteVenueSection,
  useUpdateVenueSection,
} from '../services'
import { useVenueSectionStore } from '../stores/useVenueSectionStore'

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useVenueSectionStore()

  const { user } = useAuthStore()
  const venueId = user?.user?.venue?.id

  const {
    data: venueSectionTypeOptions = [],
    isLoading: isLoadingVenueSectionType,
  }: any = useGetDropdownOptions(API.venue.venueSectionType, {
    pagination: false,
  })

  const { mutateAsync: addVenueSectionType } = useCreateDropdownOption(
    API.venue.addVenueSectionType
  )

  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateVenueSection()
  const { mutateAsync: updateMutate } = useUpdateVenueSection(
    currentRow?.id || ''
  )
  const { mutate: deleteMutate, isPending: isDeleteLoading } =
    useDeleteVenueSection(currentRow?.id || '')

  const handleCreate = async (data: any, resetForm?: () => void) => {
    console.log('🚀 ~ handleCreate ~ resetForm:', resetForm)

    console.log('🚀 ~ handleCreate ~ data:', data)

    const promises = data.sections.map((section: any) => {
      const formData = new FormData()
      formData.append('venueId', venueId?.toString())
      formData.append('typeId', section?.venueSectionType?.toString())
      formData.append('numberOfTables', section?.numberOfTables?.toString())
      formData.append('seatingCapacity', section?.seatingCapacity?.toString())

      section?.images?.forEach((img: File | string) => {
        if (img instanceof File) {
          formData.append('images', img)
        } else {
          formData.append('images', img)
        }
      })

      console.log('[SECTION PAYLOAD]')
      for (const [key, value] of formData.entries()) {
        console.log(key, value)
      }

      return createMutate(formData)
    })

    const results = await Promise.all(promises)

    console.log('All sections created:', results)
    if (resetForm) resetForm()
  }

  const handleEdit = async (data: any) => {
    const promises = data.sections.map((section: any) => {
      const formData = new FormData()
      formData.append('venueId', venueId?.toString())
      formData.append('typeId', section?.venueSectionType?.toString())
      formData.append('numberOfTables', section?.numberOfTables?.toString())
      formData.append('seatingCapacity', section?.seatingCapacity?.toString())

      data?.sections[0]?.images?.forEach((img: File | string) => {
        if (img instanceof File) {
          formData.append('images', img) // binary file
        } else if (typeof img === 'string') {
          formData.append('existingImages[]', img) // keep reference
        }
      })

      // 🟢 Removed image IDs (now from correct place)
      if (data?.sections[0]?.removedImages?.length > 0) {
        data?.sections[0].removedImages.forEach((id: any) => {
          formData.append('deletedImages', id)
        })
      }

      return updateMutate(formData)
    })

    const results = await Promise.all(promises)

    console.log('All sections created:', results)
  }

  const handleDelete = () => {
    deleteMutate()
  }

  const handleCloseDialog = () => {
    setOpen(null)
    setTimeout(() => {
      setCurrentRow(null)
    }, 300)
  }

  return (
    <>
      <SectionFormModal
        open={open === 'add'}
        onClose={() => setOpen(null)}
        onSubmit={handleCreate}
        venueSectionTypeOptions={venueSectionTypeOptions?.data?.map(
          (s: any) => ({
            id: s.id,
            name: s.name,
          })
        )}
        isLoadingVenueSectionType={isLoadingVenueSectionType}
        addVenueSectionType={addVenueSectionType}
        isSubmitting={isCreateLoading}
      />

      {currentRow && (
        <>
          <SectionFormModal
            open={open === 'edit'}
            onClose={() => setOpen(null)}
            initialData={
              currentRow
                ? [
                    {
                      id: currentRow.id,
                      venueSectionType: currentRow?.type,
                      numberOfTables: currentRow.numberOfTables,
                      seatingCapacity: currentRow.seatingCapacity,
                      images: currentRow.images ?? [],
                    },
                  ]
                : undefined
            }
            onSubmit={handleEdit}
            venueSectionTypeOptions={venueSectionTypeOptions?.data?.map(
              (s: any) => ({
                id: s.id,
                name: s.name,
              })
            )}
            isLoadingVenueSectionType={isLoadingVenueSectionType}
            addVenueSectionType={addVenueSectionType}
            allowAddMore={false}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`state-delete-${currentRow.id}`}
            isOpen={open === 'delete'}
            onClose={handleCloseDialog}
            itemName={currentRow.type.name}
            loading={isDeleteLoading}
          />
        </>
      )}
    </>
  )
}
