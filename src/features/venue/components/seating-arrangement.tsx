/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { IconUsers } from '@tabler/icons-react'
import API from '@/config/api/api'
import { Inbox, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { DeleteModal } from '@/components/model/delete-model'
import {
  useAddSection,
  useDeleteSectionData,
  useUpdateSectionData,
} from '../services'
import {
  useCreateDropdownOption,
  useGetDropdownOptions,
} from '../services/useDropdown'
import { SectionFormModal } from './sectionFormModel'

interface SeatingArrangementsProps {
  venue: any
  venueId: number | string
  totalCapacity: number
  refetch: any
}

export default function SeatingArrangements({
  venue,
  venueId,
  totalCapacity,
  refetch,
}: SeatingArrangementsProps) {
  const [selectedSection, setSelectedSection] = useState<any>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [sectionToEdit, setSectionToEdit] = useState<any>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [sectionToDelete, setSectionToDelete] = useState<any>(null)
  const [loader, setLoader] = useState(false)

  const {
    data: venueSectionTypeOptions = [],
    isLoading: isLoadingVenueSectionType,
  }: any = useGetDropdownOptions(API.venue.venueSectionType, {
    pagination: false,
  })

  const { mutateAsync: addVenueSectionType }: any = useCreateDropdownOption(
    API.venue.addVenueSectionType
  )

  const onsuccessAddSection = () => {
    refetch()
  }

  const onSuceessDeleteSection = () => {
    refetch()
  }

  const onsuccessUpdateSection = () => {
    setIsEditOpen(false)
    setSectionToEdit(null)
    refetch()
  }

  const { mutateAsync: AddSections } = useAddSection(onsuccessAddSection)

  const { mutateAsync: updateSection } = useUpdateSectionData(
    sectionToEdit?.id,
    onsuccessUpdateSection
  )
  const { mutateAsync: deleteSectionData } = useDeleteSectionData(
    sectionToDelete?.id,
    onSuceessDeleteSection
  )

  const handleSubmitSectionData = async (data: any, resetForm?: () => void) => {
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

      return AddSections(formData)
    })

    try {
      setLoader(true)
      const result = await Promise.allSettled(promises)
      const allSucceeded = result.every((r: any) => r.status === 'fulfilled')

      if (allSucceeded) {
        refetch()
        setFormOpen(false)
        resetForm?.() // reset form inside modal
      } else {
        throw new Error('One or more sections failed to upload')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoader(false)
    }
  }

  const handleEditSectionData = (data: any) => {
    const formData = new FormData()
    formData.append('venueId', venueId?.toString())
    formData.append('typeId', data?.sections[0]?.venueSectionType?.toString())
    formData.append(
      'numberOfTables',
      data?.sections[0]?.numberOfTables?.toString()
    )
    formData.append(
      'seatingCapacity',
      data?.sections[0]?.seatingCapacity?.toString()
    )

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

    updateSection(formData)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconUsers className='h-5 w-5' />
            Seating Arrangements
          </CardTitle>
        </CardHeader>
        {venue?.venueSections && venue?.venueSections?.length > 0 ? (
          <CardContent className='flex flex-col'>
            {/* Sections Grid */}
            <div className='grid max-h-[400px] grid-cols-1 gap-4 overflow-y-auto pr-2 sm:grid-cols-2 lg:grid-cols-3'>
              {venue?.venueSections?.map((section: any) => {
                return (
                  <div
                    key={section.id}
                    className='space-y-3 rounded-lg border p-4'
                  >
                    {/* Dropdown Actions */}
                    <div className='flex justify-end'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' className='h-8 w-8 p-0'>
                            <span className='sr-only'>Open menu</span>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSectionToEdit(section)
                              setIsEditOpen(true)
                            }}
                          >
                            Edit Section
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='text-red-600 focus:bg-red-50 focus:text-red-600'
                            onClick={() => {
                              setSectionToDelete(section)
                              setDeleteOpen(true)
                            }}
                          >
                            Delete Section
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Section Images */}
                    {section.images?.length > 0 && (
                      <div className='flex gap-2'>
                        {section.images
                          .slice(0, 2)
                          .map((img: any, idx: number) => {
                            return (
                              <img
                                key={idx}
                                src={img?.highQualityImage}
                                alt={`${section.venueSectionType.name} - ${idx + 1}`}
                                className='h-20 w-20 rounded-lg object-cover'
                              />
                            )
                          })}

                        {section.images.length > 2 && (
                          <button
                            onClick={() => setSelectedSection(section)}
                            className='bg-muted text-muted-foreground hover:bg-accent flex h-20 w-20 items-center justify-center rounded-lg text-sm font-semibold'
                          >
                            +{section.images.length - 2} more
                          </button>
                        )}
                      </div>
                    )}

                    {/* Section Info */}
                    <h4 className='text-foreground mb-2 font-semibold'>
                      {section.venueSectionType.name}
                    </h4>
                    <div className='text-muted-foreground space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span>Tables:</span>
                        <span className='font-medium'>
                          {section.numberOfTables}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Seats per table:</span>
                        <span className='font-medium'>
                          {section.seatingCapacity}
                        </span>
                      </div>
                      <Separator />
                      <div className='text-foreground flex justify-between font-semibold'>
                        <span>Total capacity:</span>
                        <span>
                          {section.numberOfTables * section.seatingCapacity}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Total Venue Capacity */}
            <div className='bg-muted mt-6 shrink-0 rounded-lg p-4'>
              <div className='flex items-center justify-between'>
                <span className='text-base font-semibold sm:text-lg'>
                  Total Venue Capacity:
                </span>
                <span className='text-primary text-xl font-bold sm:text-2xl'>
                  {totalCapacity} guests
                </span>
              </div>
            </div>

            <div className='mt-6 flex shrink-0 justify-end'>
              {!isEditOpen && (
                <Button
                  variant='default'
                  onClick={() => {
                    setFormOpen(true)
                  }}
                >
                  + Add Seating Arrangement
                </Button>
              )}
            </div>
          </CardContent>
        ) : (
          <CardContent className='flex flex-col items-center justify-center py-10'>
            <div className='flex flex-col items-center space-y-4'>
              <div className='bg-muted rounded-full p-4'>
                <Inbox />
              </div>
              <div className='text-center'>
                <p className='text-foreground text-base font-medium'>
                  No seating arrangements yet
                </p>
                <p className='text-muted-foreground text-sm'>
                  Add a seating arrangement to get started.
                </p>
              </div>
              <Button
                variant='default'
                className='mt-2'
                onClick={() => setFormOpen(true)}
              >
                + Add Seating Arrangement
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
      <Dialog
        open={!!selectedSection}
        onOpenChange={() => setSelectedSection(null)}
      >
        <DialogContent
          className='flex h-fit !max-h-[70vh] !min-h-[50vh] w-full !max-w-[800px] flex-col gap-10 overflow-y-auto'
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className='!h-fit'>
            <DialogTitle className='text-lg sm:text-xl'>
              {selectedSection?.venueSectionType?.name} - Images
            </DialogTitle>
          </DialogHeader>

          {/* Responsive image grid */}
          <div className='flex flex-wrap justify-center gap-6'>
            {selectedSection?.images?.map((img: any, idx: number) => (
              <div key={idx} className='w-fit'>
                <img
                  src={img?.highQualityImage}
                  alt={`${selectedSection?.venueSectionType?.name} - ${idx + 1}`}
                  className='aspect-square w-40 rounded-lg object-cover'
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Sections Modal (blank by default) */}
      <SectionFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmitSectionData}
        venueSectionTypeOptions={venueSectionTypeOptions?.data?.map(
          (s: any) => ({
            id: s.id,
            name: s.name,
          })
        )}
        isLoadingVenueSectionType={isLoadingVenueSectionType}
        addVenueSectionType={addVenueSectionType}
        isSubmitting={loader} // 👈
      />

      {/* Edit Section Modal (single section) */}
      <SectionFormModal
        open={isEditOpen}
        onClose={() => {
          setIsEditOpen(false)
          setSectionToEdit(null)
        }}
        initialData={
          sectionToEdit
            ? [
                {
                  id: sectionToEdit.id,
                  venueSectionType: sectionToEdit.venueSectionType,
                  numberOfTables: sectionToEdit.numberOfTables,
                  seatingCapacity: sectionToEdit.seatingCapacity,
                  images: sectionToEdit.images ?? [],
                },
              ]
            : undefined
        }
        onSubmit={handleEditSectionData}
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

      {/* Delete confirmation */}
      <DeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          if (sectionToDelete?.id) {
            deleteSectionData()
          }
          setDeleteOpen(false)
        }}
        itemName={sectionToDelete?.venueSectionType?.name ?? 'section'}
      />
    </>
  )
}
