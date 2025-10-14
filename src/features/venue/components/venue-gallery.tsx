/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { Upload, X, CameraIcon, Trash2, SquarePen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAddVenueImage, useDeleteVenueImage } from '../services'

// import { useAddVenueImage } from "@/hooks/use-add-venue-image"
// import { useDeleteVenueImage } from "@/hooks/use-delete-venue-image"

export default function VenueGallery({ venue, venueId, refetch }: any) {
  const [open, setOpen] = useState(false)
  const [previews, setPreviews] = useState<string[]>([])
  const [imagePayloads, setImagePayloads] = useState<any[]>([])
  const [imageId, setImageId] = useState<any>(null)

  //   const { mutateAsync: AddVenueImage } = useAddVenueImage(onSuccess)
  //   const { mutateAsync: DeleteVenueImage } = useDeleteVenueImage(onSuccess)
  const handleOpen = (value: boolean) => {
    setOpen(value)

    if (value) {
      if (venue?.images?.length > 0) {
        // show existing server images
        setPreviews(venue.images.map((img: any) => img.highQualityImage))
        setImagePayloads([]) // reset uploads
      } else {
        // if no server images, reset everything
        setPreviews([])
        setImagePayloads([])
      }
    } else {
      // when closing modal, reset local previews and payloads
      setPreviews([])
      setImagePayloads([])
    }
  }
  // 📌 Handle file input change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const newPreviews = files.map((file) => URL.createObjectURL(file))
      setPreviews((prev) => [...prev, ...newPreviews])
      setImagePayloads((prev) => [...prev, ...files])
    }
  }

  // 📌 Remove selected image from preview
  const removeImageAt = (idx: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== idx))
    setImagePayloads((prev) => prev.filter((_, i) => i !== idx))
  }

  const onsuccess: any = (data: any) => {
    console.log('🚀 ~ onsuccess ~ data:', data)
    refetch()
  }

  const { mutateAsync: AddVenueImage, isPending: AddVenueImageLoading } =
    useAddVenueImage(onsuccess)

  const { mutateAsync: deleteImage, isPending: deleteImageLoading } =
    useDeleteVenueImage(imageId, onsuccess)

  // 📌 Submit images to API
  const handleSubmit = async () => {
    if (imagePayloads.length === 0) return
    const formData = new FormData()
    formData.append('venueId', String(venueId))
    imagePayloads.forEach((file, index) => {
      formData.append(`images`, file)
      formData.append(`orderNo[${index}]`, String(1))
    })

    await AddVenueImage(formData)
    setPreviews([])
    setImagePayloads([])
    setOpen(false)
  }

  // 📌 Delete existing image API
  const handleDeleteImage = async (imageId: any) => {
    console.log('🚀 ~ handleDeleteImage ~ imageId:', imageId)
    setImageId(imageId)
    await deleteImage()
    // await DeleteVenueImage({ venueId: venue.id, imageId })
  }

  return (
    <>
      {/* GALLERY CARD */}
      <Card>
        <CardHeader className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <CameraIcon className='h-5 w-5' />
            Gallery
          </CardTitle>
          {venue?.images && venue?.images?.length > 0 && (
            <Button size='lg' variant='outline' onClick={() => setOpen(true)}>
              <SquarePen />
              Edit
            </Button>
          )}
        </CardHeader>

        <CardContent>
          {venue?.images && venue?.images?.length > 0 ? (
            <div className='max-h-[400px] overflow-y-auto pr-2'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                {venue.images.map((image: any, index: number) => (
                  <div
                    key={image.id}
                    className={`group relative ${
                      index === 0 ? 'sm:col-span-2' : ''
                    }`}
                  >
                    <img
                      src={image.highQualityImage || '/placeholder.svg'}
                      alt={`${venue.name} - Image ${index + 1}`}
                      className={`w-full rounded-lg object-cover ${
                        index === 0 ? 'h-48 sm:h-64' : 'h-40 sm:h-48'
                      }`}
                    />

                    {/* Trash Button (shows on hover) */}
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className='absolute top-2 right-2 hidden rounded-full bg-red-600 p-1 text-white group-hover:block'
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-10 text-center'>
              <CameraIcon className='text-muted-foreground mb-3 h-10 w-10' />
              <p className='text-foreground text-base font-medium'>
                No images uploaded
              </p>
              <p className='text-muted-foreground mb-4 text-sm'>
                Add venue images to showcase your space.
              </p>
              <Button variant='default' onClick={() => setOpen(true)}>
                <Upload className='mr-2 h-4 w-4' />
                Add Images
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* UPLOAD DIALOG */}
      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Edit Venue Images</DialogTitle>
          </DialogHeader>

          {/* PREVIEWS */}
          {(venue?.images?.length > 0 || previews.length > 0) && (
            <div className='flex flex-wrap gap-2'>
              {/* Existing venue images */}
              {venue?.images?.map((image: any, idx: number) => (
                <div key={`server-${image.id}`} className='relative h-32 w-32'>
                  <img
                    src={image.highQualityImage || '/placeholder.svg'}
                    alt={`venue-${idx}`}
                    className='h-32 w-32 rounded-md object-cover'
                  />
                  <button
                    type='button'
                    className='absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white'
                    onClick={() => handleDeleteImage(image.id)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                </div>
              ))}

              {/* Newly added local previews */}
              {previews.map((src, idx) => (
                <div key={`local-${src}-${idx}`} className='relative h-32 w-32'>
                  <img
                    src={src}
                    alt={`preview-${idx}`}
                    className='h-32 w-32 rounded-md object-cover'
                  />
                  <button
                    type='button'
                    className='absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white'
                    onClick={() => removeImageAt(idx)}
                  >
                    <X className='h-4 w-4' />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* FILE UPLOAD */}
          <Label className='hover:bg-muted/50 mt-3 flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed'>
            <Upload className='mb-2 h-6 w-6' />
            <span>Click to upload</span>
            <Input
              type='file'
              accept='image/*'
              multiple
              className='hidden'
              onChange={handleImageChange}
            />
          </Label>

          <div className='mt-4 flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                imagePayloads.length === 0 ||
                AddVenueImageLoading ||
                deleteImageLoading
              }
            >
              {AddVenueImageLoading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
