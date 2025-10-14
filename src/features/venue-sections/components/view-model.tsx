/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useVenueSectionStore } from '../stores/useVenueSectionStore'

export function ViewSectionModal() {
  const { open, setOpen, currentRow } = useVenueSectionStore()

  if (open !== 'view' || !currentRow) return null

  return (
    <Dialog open={open === 'view'} onOpenChange={() => setOpen(null)}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Section Details</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Section Type */}
          <div>
            <h4 className='text-sm font-medium'>Section Type</h4>
            <p className='text-sm text-gray-600'>
              {currentRow?.type?.name ?? '-'}
            </p>
          </div>

          {/* Number of Tables */}
          <div>
            <h4 className='text-sm font-medium'>Number of Tables</h4>
            <p className='text-sm text-gray-600'>
              {currentRow?.numberOfTables ?? '-'}
            </p>
          </div>

          {/* Seating Capacity */}
          <div>
            <h4 className='text-sm font-medium'>Seating Capacity per Table</h4>
            <p className='text-sm text-gray-600'>
              {currentRow?.seatingCapacity ?? '-'}
            </p>
          </div>

          {/* Images */}
          {currentRow?.images?.length > 0 && (
            <div>
              <h4 className='mb-2 text-sm font-medium'>Images</h4>
              <div className='flex flex-wrap gap-2'>
                {currentRow.images.map((img: any, i: any) => {
                  // only generate URL for File, use string directly, skip invalid values
                  // let src: any = ''
                  // if (typeof img === 'string') src = img
                  // else if (img instanceof File) src = URL.createObjectURL(img)
                  // else return null // skip undefined/null or invalid type

                  return (
                    <img
                      key={i}
                      src={img.highQualityImage}
                      alt={`section-image`}
                      className='h-32 w-32 rounded-md border object-cover'
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
