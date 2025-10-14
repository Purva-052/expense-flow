'use client'

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react'
import { z } from 'zod'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChefHat, DollarSign, Clock, Zap } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import CustomDropDownSearchable from '@/components/shared/custome-searchable-dropdown'
import { useCreateMenuCategories } from '@/features/admin-menu-categories/services'

// Schema for menu item form
const MenuItemSchema: any = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  categoryId: z
    .any()
    .nullable()
    .refine((val) => val !== null, 'Category is required'),
  isAvailable: z.boolean().default(true),
  preparationTime: z
    .number()
    .min(1, 'Preparation time must be at least 1 minute'),
  calories: z.number().optional(),
  isVegetarian: z.boolean().default(false),
})

type MenuItemFormValues = z.infer<typeof MenuItemSchema>

interface MenuItemFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: MenuItemFormValues, resetForm?: () => void) => void
  venueId?: number | string
  initialData?: any
  isSubmitting?: boolean
  categoryList: any
}

export function MenuItemFormModal({
  open,
  onClose,
  onSubmit,
  venueId,
  initialData,
  isSubmitting = false,
  categoryList,
}: MenuItemFormModalProps) {
  console.log('🚀 ~ MenuItemFormModal ~ venueId:', venueId)

  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateMenuCategories()

  const form: any = useForm<MenuItemFormValues>({
    resolver: zodResolver(MenuItemSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      categoryId: null,
      isAvailable: true,
      preparationTime: 15,
      calories: undefined,
      isVegetarian: false,
    },
  })

  const { handleSubmit, register, setValue, watch, reset } = form

  // Reset form when initial data changes (for edit mode)
  useEffect(() => {
    console.log('🚀 ~ MenuItemFormModal ~ initialData:', initialData)

    if (initialData) {
      reset({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || 0,
        categoryId: String(initialData.category?.id ?? ''),
        isAvailable: initialData.isAvailable ?? true,
        preparationTime: initialData.preparationTime || 15,
        calories: initialData.calories || undefined,
        isVegetarian: initialData.isVegetarian || false,
      })
    }
  }, [initialData, reset])

  const handleFormSubmit = (data: MenuItemFormValues) => {
    onSubmit(data, () => {
      reset()
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          reset()
          onClose()
        }
      }}
    >
      <DialogContent
        className='!max-h-[80vh] !min-h-[60vh] w-full !max-w-[600px] flex-col gap-6 overflow-y-auto'
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <ChefHat className='h-5 w-5' />
            {initialData ? 'Edit Menu Item' : 'Add Menu Item'}
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Item Name */}
                <div className='space-y-2'>
                  <Label htmlFor='name'>Item Name *</Label>
                  <Input
                    id='name'
                    {...register('name')}
                    placeholder='Enter item name'
                  />
                  {form.formState.errors.name && (
                    <p className='text-sm text-red-500'>
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className='space-y-2'>
                  <Label htmlFor='description'>Description *</Label>
                  <Textarea
                    id='description'
                    {...register('description')}
                    placeholder='Describe the menu item'
                    rows={3}
                  />
                  {form.formState.errors.description && (
                    <p className='text-sm text-red-500'>
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>

                {/* Category */}
                <CustomDropDownSearchable
                  form={form}
                  name='categoryId'
                  label='Menu Category'
                  options={categoryList?.data?.map((c: any) => ({
                    value: c.id.toString(),
                    label: c.name,
                  }))}
                  placeholder='Select or create category'
                  allowCreate
                  onCreateOption={async (val) => {
                    const payload = {
                      name: val,
                    }
                    const res: any = await createMutate(payload)

                    console.log('🚀 ~ res:', res)
                    return {
                      value: res?.id.toString(),
                      label: res?.name,
                    }
                  }}
                  isLoading={isCreateLoading}
                />
              </CardContent>
            </Card>

            {/* Pricing & Details */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Pricing & Details</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {/* Price */}
                  <div className='space-y-2'>
                    <Label htmlFor='price' className='flex items-center gap-2'>
                      <DollarSign className='h-4 w-4' />
                      Price *
                    </Label>
                    <Input
                      id='price'
                      type='number'
                      step='0.01'
                      min='0'
                      {...register('price', { valueAsNumber: true })}
                      placeholder='0.00'
                    />
                    {form.formState.errors.price && (
                      <p className='text-sm text-red-500'>
                        {form.formState.errors.price.message}
                      </p>
                    )}
                  </div>

                  {/* Preparation Time */}
                  <div className='space-y-2'>
                    <Label
                      htmlFor='preparationTime'
                      className='flex items-center gap-2'
                    >
                      <Clock className='h-4 w-4' />
                      Prep Time (minutes) *
                    </Label>
                    <Input
                      id='preparationTime'
                      type='number'
                      min='1'
                      {...register('preparationTime', { valueAsNumber: true })}
                      placeholder='15'
                    />
                    {form.formState.errors.preparationTime && (
                      <p className='text-sm text-red-500'>
                        {form.formState.errors.preparationTime.message}
                      </p>
                    )}
                  </div>

                  {/* Calories */}
                  <div className='space-y-2'>
                    <Label
                      htmlFor='calories'
                      className='flex items-center gap-2'
                    >
                      <Zap className='h-4 w-4' />
                      Calories (optional)
                    </Label>
                    <Input
                      id='calories'
                      type='number'
                      min='0'
                      {...register('calories', {
                        valueAsNumber: true,
                        setValueAs: (value: any) =>
                          value === '' ? undefined : Number(value),
                      })}
                      placeholder='250'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Availability & Options */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>
                  Availability & Options
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Is Available */}
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <Label htmlFor='isAvailable'>Available for Order</Label>
                    <p className='text-muted-foreground text-sm'>
                      Toggle to make this item available or unavailable
                    </p>
                  </div>
                  <Switch
                    id='isAvailable'
                    checked={watch('isAvailable')}
                    onCheckedChange={(checked) =>
                      setValue('isAvailable', checked)
                    }
                  />
                </div>

                {/* Is Vegetarian */}
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <Label htmlFor='isVegetarian'>Vegetarian</Label>
                    <p className='text-muted-foreground text-sm'>
                      Mark if this item is vegetarian
                    </p>
                  </div>
                  <Switch
                    id='isVegetarian'
                    checked={watch('isVegetarian')}
                    onCheckedChange={(checked) =>
                      setValue('isVegetarian', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  reset()
                  onClose()
                }}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting
                  ? 'Saving...'
                  : initialData
                    ? 'Update Item'
                    : 'Add Item'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
