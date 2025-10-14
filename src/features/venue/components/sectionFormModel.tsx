/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm, useFieldArray, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Upload, X } from 'lucide-react'
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
import CustomDropDownSearchable from '@/components/shared/custome-searchable-dropdown'

// 🟢 Schema
const SectionSchema = z.object({
  sections: z.array(
    z.object({
      venueSectionType: z.any().nullable(),
      numberOfTables: z.number().min(1, 'Required'),
      seatingCapacity: z.number().min(1, 'Required'),
      images: z
        .array(z.union([z.instanceof(File), z.string(), z.any()])) // allow File, string, or object
        .optional()
        .refine((val) => val && val.length > 0, {
          message: 'At least one image is required',
        }),
      removedImages: z.array(z.any()), // 🟢 NEW FIELD
    })
  ),
})

type SectionFormValues = z.infer<typeof SectionSchema>

export function SectionFormModal({
  open,
  onClose,
  initialData,
  onSubmit,
  venueSectionTypeOptions,
  isLoadingVenueSectionType,
  addVenueSectionType,
  isSubmitting,
  allowAddMore = true,
}: any) {
  const form = useForm<SectionFormValues>({
    resolver: zodResolver(SectionSchema),
    defaultValues: {
      sections: initialData || [
        {
          venueSectionType: null,
          numberOfTables: 0,
          seatingCapacity: 0,
          images: [],
          removedImages: [],
        },
      ],
    },
  })

  const {
    control,
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors },
  } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sections',
  })

  const [objectURLs, setObjectURLs] = useState<string[]>([])

  // Reset form when API data changes
  useEffect(() => {
    if (initialData) {
      const mappedData = initialData.map((section: any) => ({
        ...section,
        venueSectionType: section.venueSectionType?.id ?? null,
        removedImages: [], // 🟢 ensure removedImages exists
      }))
      form.reset({ sections: mappedData })
    }
  }, [initialData, form])

  // Cleanup
  useEffect(() => {
    return () => {
      objectURLs.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [objectURLs])

  const handleImageUpload = (index: number, files: FileList | null) => {
    if (!files) return
    const fileArray = Array.from(files)
    const currentImages = form.getValues(`sections.${index}.images`) || []
    setValue(`sections.${index}.images`, [...currentImages, ...fileArray], {
      shouldDirty: true,
    })
    const urls = fileArray.map((file) => URL.createObjectURL(file))
    setObjectURLs((prev) => [...prev, ...urls])
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          const resetSections = initialData
            ? initialData.map((section: any) => ({
                ...section,
                venueSectionType: section.venueSectionType?.id ?? null,
                removedImages: [],
              }))
            : [
                {
                  venueSectionType: null,
                  numberOfTables: 0,
                  seatingCapacity: 0,
                  images: [],
                  removedImages: [],
                },
              ]
          form.reset({ sections: resetSections })
          onClose()
        }
      }}
    >
      <DialogContent
        className='!max-h-[70vh] !min-h-[50vh] w-full !max-w-[800px] flex-col gap-10 overflow-y-auto'
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Manage Seating Sections</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form
            onSubmit={handleSubmit((data) =>
              onSubmit(data, () => form.reset())
            )}
            className='space-y-6'
          >
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardHeader className='flex items-center justify-between'>
                  <CardTitle className='flex items-center gap-2'>
                    <Building2 className='h-5 w-5' /> Section {index + 1}
                  </CardTitle>
                  {fields.length > 1 && (
                    <Button
                      type='button'
                      variant='destructive'
                      size='sm'
                      onClick={() => remove(index)}
                    >
                      Remove
                    </Button>
                  )}
                </CardHeader>

                <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {/* Section Type */}
                  <CustomDropDownSearchable
                    form={form}
                    name={`sections.${index}.venueSectionType`}
                    label='Section Type'
                    options={venueSectionTypeOptions?.map((s: any) => ({
                      value: s.id,
                      label: s.name,
                    }))}
                    placeholder='Select section type'
                    allowCreate
                    onCreateOption={async (val) => {
                      const res: any = await addVenueSectionType({ name: val })
                      return { value: res?.id, label: res?.name }
                    }}
                    isLoading={isLoadingVenueSectionType}
                  />

                  {/* Number of Tables */}
                  <div className='space-y-1'>
                    <Label>Number of Tables</Label>
                    <Input
                      {...register(`sections.${index}.numberOfTables`, {
                        valueAsNumber: true,
                      })}
                      type='number'
                    />
                  </div>

                  {/* Seating Capacity */}
                  <div className='space-y-1'>
                    <Label>Seating Capacity</Label>
                    <Input
                      {...register(`sections.${index}.seatingCapacity`, {
                        valueAsNumber: true,
                      })}
                      type='number'
                    />
                  </div>

                  {/* Image Upload */}
                  <div className='space-y-1 md:col-span-2'>
                    <Label>Upload Images</Label>

                    {/* PREVIEWS */}
                    {(() => {
                      const images: any =
                        watch(`sections.${index}.images`) || []
                      if (images.length === 0) return null

                      return (
                        <div className='flex flex-wrap gap-2'>
                          {images.map((file: any, idx: number) => {
                            let src = ''
                            if (typeof file === 'string') src = file
                            else if (file instanceof File)
                              src = URL.createObjectURL(file)
                            else if (file.highQualityImage)
                              src = file.highQualityImage
                            else return null

                            return (
                              <div key={idx} className='relative h-32 w-32'>
                                <img
                                  src={src}
                                  alt={`preview-${idx}`}
                                  className='h-32 w-32 rounded-md object-cover'
                                />
                                <button
                                  type='button'
                                  className='absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white'
                                  onClick={() => {
                                    const newImgs = images.filter(
                                      (_: any, i: any) => i !== idx
                                    )

                                    // 🟢 Track removed images (only if it's from the API)
                                    if (typeof file === 'string' || file?.id) {
                                      const removed =
                                        form.getValues(
                                          `sections.${index}.removedImages`
                                        ) || []
                                      const identifier = file?.id || file
                                      setValue(
                                        `sections.${index}.removedImages`,
                                        [...removed, identifier],
                                        { shouldDirty: true }
                                      )
                                    }

                                    // Update visible images
                                    setValue(
                                      `sections.${index}.images`,
                                      newImgs,
                                      { shouldDirty: true }
                                    )

                                    if (file instanceof File)
                                      URL.revokeObjectURL(src)
                                  }}
                                >
                                  <X className='h-4 w-4' />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()}

                    {/* FILE UPLOAD */}
                    <Label className='hover:bg-muted/50 mt-3 flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300'>
                      <Upload className='mb-2 h-6 w-6' />
                      <span>Click to upload</span>
                      <Input
                        type='file'
                        accept='image/*'
                        multiple
                        className='hidden'
                        onChange={(e) =>
                          handleImageUpload(index, e.target.files)
                        }
                      />
                    </Label>

                    {errors.sections?.[index]?.images && (
                      <p className='mt-1 text-sm text-red-500'>
                        {errors.sections[index].images?.message as string}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add New Section */}
            {allowAddMore && (
              <Button
                type='button'
                variant='outline'
                onClick={() =>
                  append({
                    venueSectionType: null,
                    numberOfTables: 0,
                    seatingCapacity: 0,
                    images: [],
                    removedImages: [],
                  })
                }
              >
                + Add Another Section
              </Button>
            )}

            {/* Submit */}
            <div className='flex justify-end'>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Sections'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
