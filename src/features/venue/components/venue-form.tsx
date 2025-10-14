/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import API from '@/config/api/api'
import {
  Upload,
  X,
  MapPin,
  Clock,
  Building2,
  ImageIcon,
  Star,
  Contact,
  Loader2,
  SquareUser,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PhoneNumberInput } from '@/components/shared/custome-phoneNumberInput'
// Custom dropdown
import CustomDropDownSearchable from '@/components/shared/custome-searchable-dropdown'
import TimePicker from '@/components/shared/custome-timepicker'
// Hooks to fetch dropdown options
import {
  useGetDropdownOptions,
  useCreateDropdownOption,
} from '@/features/venue/services/useDropdown'
import { getVenueFormSchema, TVenueFormSchema } from '../schema'
// Schema
import { useCreateVenueOwner } from '../services'
import { useAddSection, useAddVenueImage } from '../services'

interface VenueFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: TVenueFormSchema) => void
  loading?: boolean
  currentRow?: any
  venueId: number | null
  currentStep: any
  setCurrentStep: any
  setOpen: any
  setVenueId: any
}

export function VenueForm({
  open,
  onOpenChange,
  onSubmit,
  loading,
  currentRow,
  venueId,
  currentStep,
  setVenueId,
  setCurrentStep,
  setOpen,
}: Readonly<VenueFormProps>) {
  const [previews, setPreviews] = useState<string[]>([])
  const [selectedCountryID, setSelectedCountryID] = useState(null)
  const [selectedStateID, setSelectedStateID] = useState(null)
  const [selectedCityID, setSelectedCityID] = useState(null)
  const [imagePayloads, setImagePayloads] = useState<any[]>([])
  const [loader, setLoader] = useState(false)

  const isEdit = !!currentRow?.id

  const form = useForm<TVenueFormSchema>({
    resolver: zodResolver(getVenueFormSchema(isEdit)),
    defaultValues: currentRow ?? {},
    mode: 'onChange',
  })

  const onsuccess = (data: any) => {
    console.log('🚀 ~ onsuccess ~ data:', data)
  }

  const { mutateAsync: AddVenueImage } = useAddVenueImage(onsuccess)

  const { mutate: CreateVenueOwner } = useCreateVenueOwner()

  // Reset form when editing
  useEffect(() => {
    if (currentRow) {
      form.reset({
        ...currentRow,
        country: currentRow?.country ? String(currentRow.country.id) : null,
        state: currentRow?.state ? String(currentRow.state.id) : null,
        city: currentRow?.city ? String(currentRow.city.id) : null,
        locality: currentRow?.locality ? String(currentRow.locality.id) : null,
        venueType: currentRow?.venueType ? currentRow.venueType.id : null,
        phone: currentRow?.phone ?? '',
        phoneNumberCountryCode:
          currentRow?.phoneNumberCountryCode ??
          currentRow?.country?.dialCode ??
          undefined,
        phoneNumberCountryId: currentRow?.phoneNumberCountryId ?? undefined,
      })

      // Populate existing images
      if (currentRow.images && currentRow.images.length > 0) {
        const toUrl = (p: string | undefined) => {
          if (!p) return null as unknown as string
          if (/^https?:\/\//.test(p)) return p
          const base = (import.meta as any)?.env?.VITE_API_BASE_URL as string
          return base ? `${base}/${p}` : p
        }
        const initialPreviews = currentRow.images
          .map((img: any) => toUrl(img.lowQualityImage || img.highQualityImage))
          .filter(Boolean) as string[]
        setPreviews(initialPreviews)
        // Existing images are already uploaded; do not enqueue payloads for them
        setImagePayloads([])
      } else {
        setPreviews([])
      }

      // Populate existing sections
      if (currentRow.venueSections && currentRow.venueSections.length > 0) {
        form.setValue(
          'sections',
          currentRow.venueSections.map((section: any) => ({
            venueSectionType:
              section.venueSectionType?.id || section.id || null,
            numberOfTables: section.numberOfTables,
            seatingCapacity: section.seatingCapacity,
            images: section.images?.length ? section.images : [],
          }))
        )
      } else {
        // If no sections, ensure there's at least one empty section as per your current logic
        form.setValue('sections', [
          {
            venueSectionType: null,
            numberOfTables: 0,
            seatingCapacity: 0,
            images: [],
          },
        ])
      }
      setVenueId(currentRow.id || null)
    }
  }, [currentRow, form])

  useEffect(() => {
    const subscription = form.watch((_, { name }) => {
      if (name === 'country') {
        form.setValue('state', null)
        form.setValue('city', null)
        form.setValue('locality', null)
      }

      if (name === 'state') {
        form.setValue('city', null)
        form.setValue('locality', null)
      }

      if (name === 'city') {
        form.setValue('locality', null)
      }
    })

    return () => subscription.unsubscribe()
  }, [form])
  const { control } = form // Destructure getValues from form
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sections',
  })

  // Dropdown queries
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
  const { data: localityOptions = [], isLoading: isLoadingLocality }: any =
    useGetDropdownOptions(
      API.venue.locality,
      {
        pagination: false,
        countryId: selectedCountryID,
        stateId: selectedStateID,
        cityId: selectedCityID,
      },
      !!selectedCountryID && !!selectedStateID && !!selectedCityID
    )
  const { data: venueTypeOptions = [], isLoading: isLoadingVenueType }: any =
    useGetDropdownOptions(API.venue.venueTypes, { pagination: false })
  const {
    data: venueSectionTypeOptions = [],
    isLoading: isLoadingVenueSectionType,
  }: any = useGetDropdownOptions(API.venue.venueSectionType, {
    pagination: false,
  })

  const isDropdownsLoading =
    isLoadingCountry || isLoadingVenueType || isLoadingVenueSectionType

  const onsuccessAddSection = (data: any) => {
    console.log('🚀 ~ onsuccessAddSection ~ data:', data)
  }

  const { mutateAsync: addState } = useCreateDropdownOption(API.venue.addState)
  const { mutateAsync: AddSections } = useAddSection(onsuccessAddSection)
  const { mutateAsync: addCity } = useCreateDropdownOption(API.venue.addCity)
  const { mutateAsync: addLocality } = useCreateDropdownOption(
    API.venue.addLocality
  )
  const { mutateAsync: addVenueType } = useCreateDropdownOption(
    API.venue.addVenueType
  )

  const { mutateAsync: addVenueSectionType } = useCreateDropdownOption(
    API.venue.addVenueSectionType
  )

  const handleCountryChange = (val: any) => {
    setSelectedCountryID(val)
    setSelectedStateID(null)
    setSelectedCityID(null)
    form.setValue('country', val)
    form.setValue('state', null)
    form.setValue('city', null)
  }

  // when State changes
  const handleStateChange = (val: any) => {
    setSelectedStateID(val)
    setSelectedCityID(null)
    form.setValue('state', val)
    form.setValue('city', null)
  }

  // when City changes
  const handleCityChange = (val: any) => {
    setSelectedCityID(val)
    form.setValue('city', val)
  }

  const handleNext = async () => {
    // Define the fields that belong to Step 1 for validation purposes.
    const step1Fields: (keyof TVenueFormSchema)[] = [
      'name',
      'country',
      'state',
      'city',
      'locality',
      'venueType',
      'address',
      'phone',
      'openingTime',
      'closingTime',
    ]

    const isValid = await form.trigger(step1Fields, { shouldFocus: true })

    if (!isValid) {
      return // Stop execution if step 1 is not valid
    }
    if (venueId || currentRow?.id) {
      setCurrentStep((s: number) => s + 1)
    } else {
      onSubmit(form.getValues())
    }
  }

  const handlePrev = () => setCurrentStep((s: any) => s - 1)

  const [sectionImageFiles, setSectionImageFiles] = useState<{
    [key: string]: File[]
  }>({})

  const handleSubmit = async (value: any) => {
    console.log('🚀 ~ handleSubmit ~ value:', value)

    const promises: any[] = []

    if (!currentRow?.id) {
      // Create separate API calls for each section
      value.sections.forEach((section: any, sectionIndex: number) => {
        const sectionFormData = new FormData()
        sectionFormData.append(`typeId`, String(section.venueSectionType))
        sectionFormData.append(`numberOfTables`, String(section.numberOfTables))
        sectionFormData.append(
          `seatingCapacity`,
          String(section.seatingCapacity)
        )
        sectionFormData.append(`venueId`, String(venueId))

        // Append images for this section
        const sectionImages = sectionImageFiles[`section_${sectionIndex}`] || []
        sectionImages.forEach((file) => {
          sectionFormData.append(`images`, file)
        })

        console.log(`🚀 ~ Section ${sectionIndex} FormData:`, sectionFormData)

        // Push a separate API call for this section
        promises.push(AddSections(sectionFormData))
      })

      // Owner details API call (still only one)
      const OwnerDetailsPayload = {
        email: value.owner.email,
        password: value.owner.password,
        name: value.owner.name,
        phoneNumberCountryId: value.owner.phoneNumberCountryId,
        phoneNumberCountryCode: value.owner.phoneNumberCountryCode,
        phone: value.owner.phone,
        venueId: venueId,
      }
      console.log('🚀 ~ OwnerDetailsPayload:', OwnerDetailsPayload)

      promises.push(CreateVenueOwner(OwnerDetailsPayload))
    }

    // Venue images API call
    if (imagePayloads && imagePayloads.length > 0) {
      const formData = new FormData()
      formData.append('venueId', String(venueId))
      imagePayloads.forEach((payload, index) => {
        formData.append(`images`, payload.image)
        formData.append(`orderNo[${index}]`, String(1))
      })
      promises.push(AddVenueImage(formData))
    }

    // Execute all API calls in parallel
    try {
      setLoader(true)
      const Result = await Promise.allSettled(promises)

      const allSucceeded = Result.every(
        (result: any) => result.status === 'fulfilled'
      )

      if (allSucceeded) {
        setCurrentStep(1)
        setOpen(false)
        form.reset()
        setSectionImageFiles({})
      } else {
        // Optionally, you can handle which section failed here
        console.log(Result, 'Some API calls failed')
        throw new Error('Failed to upload venue or some sections')
      }
    } catch (e) {
      console.log(e, 'error')
      throw new Error('Failed to upload venue')
    } finally {
      setLoader(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const nextPreviews: string[] = []
    const nextPayloads: any[] = []

    Array.from(files).forEach((file, idx) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.warn(`File ${file.name} is not an image`)
        return
      }

      const url = URL.createObjectURL(file)
      nextPreviews.push(url)
      nextPayloads.push({
        image: file, // This is already a File object
        venueId: venueId as number,
        orderNo: (imagePayloads?.length || previews.length) + idx + 1,
      })
    })

    setPreviews((prev) => [...prev, ...nextPreviews])
    setImagePayloads((prev) => [...prev, ...nextPayloads])
  }

  const removeImageAt = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index))
    setImagePayloads((prev) => prev.filter((_, i) => i !== index)) // Also remove from payloads
  }
  const venueSections = form.getValues('sections')

  useEffect(() => {
    if (!venueSections) return
    form.setValue(
      'sections',
      venueSections?.length
        ? venueSections
        : [
            {
              venueSectionType: null,
              numberOfTables: 0,
              seatingCapacity: 0,
              images: [],
            },
          ]
    )
  }, [form, venueSections?.length])

  // Per-section image upload handler
  const handleSectionImageUpload = (index: number, files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files).filter((file) =>
      file.type.startsWith('image/')
    )
    const urls = fileArray.map((f) => URL.createObjectURL(f))

    // Store actual File objects
    const sectionKey = `section_${index}`
    setSectionImageFiles((prev) => ({
      ...prev,
      [sectionKey]: [...(prev[sectionKey] || []), ...fileArray],
    }))

    // Update form with URLs for preview
    const currentImages =
      (form.getValues(`sections.${index}.images`) as string[] | undefined) || []
    form.setValue(`sections.${index}.images`, [...currentImages, ...urls], {
      shouldDirty: true,
    })
  }

  // Updated remove image function for sections
  const removeSectionImage = (sectionIndex: number, imageIndex: number) => {
    const sectionKey = `section_${sectionIndex}`
    const currentFiles = sectionImageFiles[sectionKey] || []
    const currentImages =
      (form.getValues(`sections.${sectionIndex}.images`) as
        | string[]
        | undefined) || []

    // Remove from files
    const newFiles = currentFiles.filter((_, i) => i !== imageIndex)
    setSectionImageFiles((prev) => ({
      ...prev,
      [sectionKey]: newFiles,
    }))

    // Remove from form (URLs)
    const newImages = currentImages.filter((_, i) => i !== imageIndex)
    form.setValue(`sections.${sectionIndex}.images`, newImages, {
      shouldDirty: true,
    })

    // Revoke the URL to free memory
    URL.revokeObjectURL(currentImages[imageIndex])
  }

  useEffect(() => {
    if (currentRow) {
      const { country, state, city } = currentRow
      setSelectedCountryID(country?.id?.toString() || null)
      setSelectedStateID(state?.id?.toString() || null)
      setSelectedCityID(city?.id?.toString() || null)
      form.reset({
        ...form.getValues(),
        country: country?.id?.toString() || null,
        state: state?.id?.toString() || null,
        city: city?.id?.toString() || null,
      })
    }
  }, [currentRow])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex h-[90vh] min-w-3xl flex-col'>
        <DialogHeader>
          <DialogTitle>
            {currentRow ? 'Edit Venue' : 'Create Venue'}
          </DialogTitle>
        </DialogHeader>

        {isDropdownsLoading ? (
          <div className='flex flex-1 items-center justify-center p-10'>
            <div className='text-muted-foreground flex items-center gap-2'>
              <Loader2 className='h-5 w-5 animate-spin' /> Loading form...
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => {
                if (currentRow) {
                  // EDIT MODE -> only step 1
                  onSubmit(form.getValues()) // pass updated data to parent
                  // setOpen(false) // close modal immediately
                  // form.reset()
                } else {
                  // ADD MODE
                  if (currentStep === 2) {
                    handleSubmit(values)
                  }
                }
              })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && currentStep < 2 && !currentRow) {
                  e.preventDefault()
                }
              }}
              className='flex flex-1 flex-col overflow-hidden'
            >
              {/* SCROLLABLE CONTENT */}
              <div className='flex-1 space-y-6 overflow-y-auto pr-2'>
                {/* STEP 1 */}
                {currentStep === 1 && (
                  <div className='space-y-6'>
                    {/* Venue Name + Description */}
                    <Card>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                          <Building2 className='h-5 w-5' /> Basic Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-4'>
                        <div className='space-y-2'>
                          <Label>Venue Name</Label>
                          <Input
                            {...form.register('name')}
                            placeholder='Enter venue name'
                          />
                          {form.formState.errors.name && (
                            <p className='text-sm text-red-500'>
                              {form.formState.errors.name.message}
                            </p>
                          )}
                        </div>
                        <div className='space-y-2'>
                          <Label>Description</Label>
                          <Textarea
                            {...form.register('description')}
                            placeholder='Enter description'
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Location */}
                    <Card>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                          <MapPin className='h-5 w-5' /> Location Details
                        </CardTitle>
                      </CardHeader>

                      <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {/* Country */}
                        <CustomDropDownSearchable
                          form={form}
                          name='country'
                          label='Country'
                          options={countryOptions?.data?.map((c: any) => ({
                            value: c.id.toString(), // still using string, we can switch to number later
                            label: c.name,
                          }))}
                          onChangeValue={handleCountryChange}
                          placeholder='Search country'
                          isLoading={isLoadingCountry}
                        />

                        {/* State */}
                        <CustomDropDownSearchable
                          form={form}
                          name='state'
                          label='State'
                          options={stateOptions?.data?.map((s: any) => ({
                            value: s.id.toString(),
                            label: s.name,
                          }))}
                          placeholder='Search state'
                          allowCreate
                          onChangeValue={handleStateChange}
                          onCreateOption={async (val) => {
                            const payload = {
                              name: val,
                              code: String(val).slice(0, 2).toUpperCase(), // auto-generate short code
                              countryId: selectedCountryID,
                            }
                            const res: any = await addState(payload)
                            return {
                              value: res?.id.toString(),
                              label: res?.name,
                            }
                          }}
                          disabled={!form.watch('country')}
                          isLoading={isLoadingState}
                        />

                        {/* City */}
                        <CustomDropDownSearchable
                          form={form}
                          name='city'
                          label='City'
                          options={cityOptions?.data?.map((c: any) => ({
                            value: c.id.toString(),
                            label: c.name,
                          }))}
                          onChangeValue={handleCityChange}
                          placeholder='Search city'
                          allowCreate
                          onCreateOption={async (val) => {
                            const payload = {
                              name: val,
                              stateId: selectedStateID,
                              countryId: selectedCountryID,
                            }
                            const res: any = await addCity(payload)

                            console.log('🚀 ~ res:', res)

                            return {
                              value: res?.id.toString(),
                              label: res?.name,
                            }
                          }}
                          disabled={!form.watch('state')}
                          isLoading={isLoadingCity}
                        />

                        {/* Locality */}
                        <CustomDropDownSearchable
                          form={form}
                          name='locality'
                          label='Locality'
                          options={localityOptions?.data?.map((l: any) => ({
                            value: l.id.toString(),
                            label: l.name,
                          }))}
                          placeholder='Search locality'
                          allowCreate
                          onCreateOption={async (val) => {
                            const payload = {
                              name: val,
                              countryId: selectedCountryID,
                              stateId: selectedStateID,
                              cityId: selectedCityID,
                            }
                            const res: any = await addLocality(payload)
                            return {
                              value: res?.id.toString(),
                              label: res?.name,
                            }
                          }}
                          disabled={!form.watch('city')}
                          isLoading={isLoadingLocality}
                        />

                        {/* Address */}
                        <div className='col-span-2 space-y-2'>
                          <Label>Address</Label>
                          <Textarea
                            {...form.register('address')}
                            placeholder='Enter address'
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Contact */}
                    <Card>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                          <Contact className='h-5 w-5' />
                          Contact & Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-6'>
                        {/* Phone Number */}
                        <PhoneNumberInput
                          form={form}
                          countries={countryOptions?.data}
                          isLoading={isLoadingCountry}
                        />

                        {/* Rating, Reviews, Price Range */}
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                          <div className='space-y-2'>
                            <Label
                              htmlFor='rating'
                              className='flex items-center gap-2 text-sm font-medium'
                            >
                              <Star className='text-muted-foreground h-4 w-4' />
                              Rating
                            </Label>
                            <Input
                              id='rating'
                              type='number'
                              min='0'
                              max='5'
                              step='0.1'
                              className='h-11'
                              {...form.register('rating', {
                                valueAsNumber: true,
                              })}
                            />
                            {form.formState.errors.rating && (
                              <p className='flex items-center gap-1 text-sm text-red-600'>
                                <X className='h-3 w-3' />
                                {form.formState.errors.rating.message}
                              </p>
                            )}
                          </div>

                          <div className='space-y-2'>
                            <Label
                              htmlFor='totalReviews'
                              className='text-sm font-medium'
                            >
                              Total Reviews
                            </Label>
                            <Input
                              id='totalReviews'
                              type='number'
                              min='0'
                              className='h-11'
                              {...form.register('totalReviews', {
                                valueAsNumber: true,
                              })}
                            />
                            {form.formState.errors.totalReviews && (
                              <p className='flex items-center gap-1 text-sm text-red-600'>
                                <X className='h-3 w-3' />
                                {form.formState.errors.totalReviews.message}
                              </p>
                            )}
                          </div>

                          <div className='space-y-2'>
                            <Label
                              htmlFor='priceRange'
                              className='text-sm font-medium'
                            >
                              Price Range
                            </Label>
                            <Input
                              id='priceRange'
                              placeholder='$$ - $$$'
                              className='h-11'
                              {...form.register('priceRange')}
                            />
                            {form.formState.errors.priceRange && (
                              <p className='flex items-center gap-1 text-sm text-red-600'>
                                <X className='h-3 w-3' />
                                {form.formState.errors.priceRange.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Classification */}
                    <Card>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                          <Building2 className='h-5 w-5' /> Venue Classification
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <CustomDropDownSearchable
                          form={form}
                          name='venueType'
                          label='Venue Type'
                          options={venueTypeOptions?.data?.map((t: any) => ({
                            value: t.id,
                            label: t.name,
                          }))}
                          placeholder='Select venue type'
                          allowCreate
                          onCreateOption={async (val) => {
                            const res: any = await addVenueType({ name: val })
                            return { value: res?.id, label: res?.name }
                          }}
                          isLoading={isLoadingVenueType}
                        />
                      </CardContent>
                    </Card>

                    {/* Timing */}
                    <Card>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                          <Clock className='h-5 w-5' /> Operating Hours
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <TimePicker
                          value={form.watch('openingTime')}
                          onChange={(val) => form.setValue('openingTime', val)}
                          placeholder='Opening Time'
                        />
                        <TimePicker
                          value={form.watch('closingTime')}
                          onChange={(val) => form.setValue('closingTime', val)}
                          placeholder='Closing Time'
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                  <div className='space-y-6'>
                    {/* Image Upload */}
                    <Card>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                          <ImageIcon className='h-5 w-5' /> Upload Image
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {previews.length > 0 ? (
                          <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
                            {previews.map((src, idx) => (
                              <div
                                key={`${src}-${idx}`}
                                className='relative h-32 w-32'
                              >
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
                        ) : null}
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
                      </CardContent>
                    </Card>

                    {/* Owner Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                          <SquareUser className='h-5 w-5' /> Owner Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='space-y-1'>
                          <Label htmlFor='owner.name'>Owner Name</Label>
                          <Input
                            {...form.register('owner.name')}
                            placeholder='Enter owner name'
                          />
                        </div>

                        <div className='space-y-1'>
                          <Label htmlFor='owner.email'>Email</Label>
                          <Input
                            {...form.register('owner.email')}
                            type='email'
                            placeholder='Enter email address'
                          />
                        </div>

                        <div className='space-y-1'>
                          <Label htmlFor='owner.password'>Password</Label>
                          <Input
                            {...form.register('owner.password')}
                            type='password'
                            placeholder='Enter password'
                          />
                        </div>

                        <PhoneNumberInput
                          form={form}
                          fieldName='owner.phone'
                          countries={countryOptions?.data}
                          isLoading={isLoadingCountry}
                        />
                      </CardContent>
                    </Card>

                    {/* Multiple Sections */}
                    {fields.map((field, index) => (
                      <Card key={field.id}>
                        <CardHeader className='flex items-center justify-between'>
                          <CardTitle className='flex items-center gap-2'>
                            <Building2 className='h-5 w-5' /> Section{' '}
                            {index + 1}
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
                          <CustomDropDownSearchable
                            form={form}
                            name={`sections.${index}.venueSectionType`}
                            label='Section Type'
                            options={venueSectionTypeOptions?.data?.map(
                              (s: any) => ({
                                value: s.id,
                                label: s.name,
                              })
                            )}
                            placeholder='Select section type'
                            allowCreate
                            onCreateOption={async (val) => {
                              const res: any = await addVenueSectionType({
                                name: val,
                              })
                              return { value: res?.id, label: res?.name }
                            }}
                            isLoading={isLoadingVenueSectionType}
                          />
                          <div className='space-y-1'>
                            <Label htmlFor={`sections.${index}.numberOfTables`}>
                              Number of Tables
                            </Label>
                            <Input
                              {...form.register(
                                `sections.${index}.numberOfTables`,
                                {
                                  valueAsNumber: true,
                                }
                              )}
                              type='number'
                              placeholder='Enter number of tables'
                            />
                          </div>

                          <div className='space-y-1'>
                            <Label
                              htmlFor={`sections.${index}.seatingCapacity`}
                            >
                              Seating Capacity per Table
                            </Label>
                            <Input
                              {...form.register(
                                `sections.${index}.seatingCapacity`,
                                {
                                  valueAsNumber: true,
                                }
                              )}
                              type='number'
                              placeholder='Enter seating capacity'
                            />
                          </div>

                          {/* Per-section Image Upload */}
                          <div className='space-y-1 md:col-span-2'>
                            <Label>Upload Images</Label>
                            {(() => {
                              const images =
                                (form.watch(`sections.${index}.images`) as
                                  | string[]
                                  | undefined) || []
                              return (
                                images.length > 0 && (
                                  <div className='flex flex-wrap gap-2'>
                                    {images.map((src: string, idx: number) => (
                                      <div
                                        key={`${src}-${idx}`}
                                        className='relative h-32 w-32'
                                      >
                                        <img
                                          src={src}
                                          alt={`preview-${idx}`}
                                          className='h-32 w-32 rounded-md object-cover'
                                        />
                                        <button
                                          type='button'
                                          className='absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white'
                                          onClick={() =>
                                            removeSectionImage(index, idx)
                                          }
                                        >
                                          <X className='h-4 w-4' />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )
                              )
                            })()}
                            <Label className='hover:bg-muted/50 mt-3 flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed'>
                              <Upload className='mb-2 h-6 w-6' />
                              <span>Click to upload</span>
                              <Input
                                type='file'
                                accept='image/*'
                                multiple
                                className='hidden'
                                onChange={(e) =>
                                  handleSectionImageUpload(
                                    index,
                                    e.target.files
                                  )
                                }
                              />
                            </Label>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <Button
                      type='button'
                      variant='outline'
                      onClick={() =>
                        append({
                          venueSectionType: null,
                          numberOfTables: 0,
                          seatingCapacity: 0,
                          images: [],
                        })
                      }
                    >
                      + Add Another Section
                    </Button>
                  </div>
                )}
              </div>

              {/* FIXED FOOTER */}
              <div className='mt-4 flex w-full justify-between border-t pt-6'>
                <div>
                  {!currentRow && currentStep > 1 && (
                    <Button
                      type='button'
                      variant='outline'
                      onClick={handlePrev}
                    >
                      Previous
                    </Button>
                  )}
                </div>

                <div>
                  {currentRow ? (
                    // EDIT MODE -> direct update
                    <Button
                      type='submit'
                      disabled={loading || form.formState.isSubmitting}
                    >
                      {loading || form.formState.isSubmitting ? (
                        <div className='flex items-center gap-2'>
                          <Loader2 className='h-4 w-4 animate-spin' />{' '}
                          Updating...
                        </div>
                      ) : (
                        'Update Venue'
                      )}
                    </Button>
                  ) : currentStep < 2 ? (
                    <Button
                      type='button'
                      onClick={handleNext}
                      disabled={loading}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type='button'
                      onClick={form.handleSubmit(handleSubmit)}
                      disabled={
                        loading || loader || form.formState.isSubmitting
                      }
                    >
                      {loading || loader || form.formState.isSubmitting ? (
                        <div className='flex items-center gap-2'>
                          <Loader2 className='h-4 w-4 animate-spin' /> Saving...
                        </div>
                      ) : (
                        'Create Venue'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
