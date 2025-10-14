'use client'

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import {
  ChefHat,
  MoreHorizontal,
  Plus,
  Clock,
  Leaf,
  Zap,
  Flame,
  Loader2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { DeleteModal } from '@/components/model/delete-model'
import { useGetMenuCategories } from '@/features/admin-menu-categories/services'
import {
  useCreateMenuData,
  useDeleteMenuData,
  useGetMenuByVenueId,
  useUpdateMenuData,
} from '../services'
import { MenuItemFormModal } from './menu-items-model'

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  isAvailable: boolean
  preparationTime: number
  calories?: number
  isVegetarian: boolean
  category: {
    id: number
    name: string
  }
}

interface MenuItemsProps {
  venueId: number | string
  refetch?: any
}

export default function MenuItems({ venueId }: MenuItemsProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  )
  const [formOpen, setFormOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<any>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null)

  // Fetch categories

  // Fetch menu items with selected category filter
  const {
    data: menuList,
    isPending: menuListPending,
    refetch,
  }: any = useGetMenuByVenueId(venueId, {
    pagination: false,
    categoryId: selectedCategoryId,
  })

  const { data: categoryList, isPending: categoryListPending }: any =
    useGetMenuCategories()

  const onsuccessAddVenueMenuData = () => {
    refetch()
    setFormOpen(false)
  }

  const { mutate: createMutate, isPending: isCreateLoading } =
    useCreateMenuData(onsuccessAddVenueMenuData)

  const onSuccessUpdateMenuData = () => {
    refetch()
    setIsEditOpen(false)
    setItemToEdit(null)
  }

  const { mutate: updateMutate, isPending: isUpdateLoading } =
    useUpdateMenuData(selectedItemId, onSuccessUpdateMenuData)

  const onsuccessDeleteMenu = () => {
    refetch()
    setDeleteOpen(false)
    setItemToDelete(null)
  }

  const { mutate: deleteMutate, isPending: isDeleteLoading } =
    useDeleteMenuData(selectedItemId, onsuccessDeleteMenu)

  const menuItems = menuList?.data || []

  const handleSubmitMenuItem = async (data: any, resetForm?: () => void) => {
    console.log('🚀 ~ handleSubmitMenuItem ~ data:', data)

    const payload = {
      venueId: venueId,
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      price: data.price,
      isAvailable: data.isAvailable,
      preparationTime: data.preparationTime,
      calories: data.calories,
      isVegetarian: data.isVegetarian,
    }

    try {
      // API call to add menu item would go here
      createMutate(payload)
      resetForm?.()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEditMenuItem = async (data: any, resetForm?: () => void) => {
    console.log('🚀 ~ handleEditMenuItem ~ data:', data)

    const payload = {
      venueId: venueId,
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      price: data.price,
      isAvailable: data.isAvailable,
      preparationTime: data.preparationTime,
      calories: data.calories,
      isVegetarian: data.isVegetarian,
    }

    try {
      // API call to update menu item would go here
      updateMutate(payload)
      resetForm?.()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteMenuItem = async () => {
    if (!itemToDelete) return

    try {
      deleteMutate()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            {/* Left: Title */}
            <div className='flex items-center gap-2'>
              <ChefHat className='h-5 w-5' />
              <span className='text-lg font-semibold'>Menu Items</span>
            </div>

            {/* Right: Category Dropdown */}
            <div className='w-full sm:w-36'>
              {categoryListPending ? (
                <Button
                  variant='outline'
                  disabled
                  className='w-full justify-center'
                >
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Loading...
                </Button>
              ) : (
                <Select
                  onValueChange={(value) =>
                    setSelectedCategoryId(
                      value === 'all' ? null : Number(value)
                    )
                  }
                  value={
                    selectedCategoryId ? String(selectedCategoryId) : 'all'
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select Category' />
                  </SelectTrigger>
                  <SelectContent className='max-h-60 overflow-y-auto'>
                    {/* 👆 scroll if more than ~240px */}
                    <SelectItem value='all'>All Categories</SelectItem>
                    {categoryList?.data?.map((cat: any) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        {menuListPending ? (
          <CardContent className='flex items-center justify-center py-20'>
            <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
            Loading...
          </CardContent>
        ) : menuItems && menuItems.length > 0 ? (
          <CardContent className='flex flex-col'>
            {/* Menu Items Grid */}
            <div className='grid max-h-[500px] grid-cols-1 gap-4 overflow-y-auto pr-2 sm:grid-cols-2 lg:grid-cols-3'>
              {menuItems?.map((item: MenuItem) => (
                <div key={item.id} className='space-y-3 rounded-lg border p-4'>
                  {/* Dropdown Actions */}
                  <div className='flex items-start justify-between'>
                    <Badge
                      variant={item?.isAvailable ? 'default' : 'secondary'}
                    >
                      {item?.isAvailable ? 'Available' : 'Unavailable'}
                    </Badge>
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
                            setItemToEdit(item)
                            setIsEditOpen(true)
                            setSelectedItemId(item?.id)
                          }}
                        >
                          Edit Item
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-red-600 focus:bg-red-50 focus:text-red-600'
                          onClick={() => {
                            setItemToDelete(item)
                            setDeleteOpen(true)
                            setSelectedItemId(item?.id)
                          }}
                        >
                          Delete Item
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Item Info */}
                  <div className='space-y-2'>
                    <h4 className='text-foreground text-lg font-semibold'>
                      {item?.name}
                    </h4>

                    <p className='text-muted-foreground line-clamp-2 text-sm'>
                      {item?.description}
                    </p>

                    <div className='flex items-center gap-2 text-sm'>
                      <Badge variant='outline'>{item.category.name}</Badge>

                      {item?.isVegetarian ? (
                        <Badge
                          variant='outline'
                          className='border-green-600 text-green-600'
                        >
                          <Leaf className='mr-1 h-3 w-3' />
                          Veg
                        </Badge>
                      ) : (
                        <Badge
                          variant='outline'
                          className='border-red-600 text-red-600'
                        >
                          <Flame className='mr-1 h-3 w-3' />
                          Non-Veg
                        </Badge>
                      )}
                    </div>

                    <Separator />

                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Price:</span>
                        <span className='text-primary font-semibold'>
                          {item?.price
                            ? `$${Number(item.price).toFixed(2)}`
                            : 'N/A'}
                        </span>
                      </div>

                      <div className='flex justify-between'>
                        <span className='text-muted-foreground flex items-center gap-1'>
                          <Clock className='h-3 w-3' />
                          Prep time:
                        </span>
                        <span className='font-medium'>
                          {item?.preparationTime} min
                        </span>
                      </div>

                      {item?.calories && (
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground flex items-center gap-1'>
                            <Zap className='h-3 w-3' />
                            Calories:
                          </span>
                          <span className='font-medium'>
                            {item.calories} kcal
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Menu Item Button */}
            <div className='mt-6 flex shrink-0 justify-end'>
              <Button variant='default' onClick={() => setFormOpen(true)}>
                <Plus className='mr-2 h-4 w-4' />
                Add Menu Item
              </Button>
            </div>
          </CardContent>
        ) : (
          <CardContent className='flex flex-col items-center justify-center py-10'>
            <div className='flex flex-col items-center space-y-4'>
              <div className='bg-muted rounded-full p-4'>
                <ChefHat className='h-8 w-8' />
              </div>
              <div className='text-center'>
                <p className='text-foreground text-base font-medium'>
                  No menu items yet
                </p>
                <p className='text-muted-foreground text-sm'>
                  Add menu items to showcase your offerings.
                </p>
              </div>
              <Button
                variant='default'
                className='mt-2'
                onClick={() => setFormOpen(true)}
              >
                <Plus className='mr-2 h-4 w-4' />
                Add Menu Item
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Add Menu Item Modal */}
      <MenuItemFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmitMenuItem}
        venueId={venueId}
        isSubmitting={isCreateLoading}
        categoryList={categoryList || []}
      />

      {/* Edit Menu Item Modal */}
      <MenuItemFormModal
        open={isEditOpen}
        onClose={() => {
          setIsEditOpen(false)
          setItemToEdit(null)
        }}
        onSubmit={handleEditMenuItem}
        venueId={venueId}
        initialData={itemToEdit}
        isSubmitting={isUpdateLoading}
        categoryList={categoryList || []}
      />

      {/* Delete confirmation */}
      <DeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteMenuItem}
        itemName={itemToDelete?.name ?? 'menu item'}
        loading={isDeleteLoading}
      />
    </>
  )
}
