/* eslint-disable @typescript-eslint/no-explicit-any */
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import CustomButton from '@/components/shared/custom-button'
import { TextInputField } from '@/components/shared/custom-input-field'
import {
  VenueSectionTypeFormSchema,
  TVenueSectionTypeFormSchema,
} from '../schema'

interface Props {
  currentRow?: any
  open: boolean
  onOpenChange: (open: boolean) => void
  loading?: boolean
  onSubmit: (values: TVenueSectionTypeFormSchema) => void
}

export function VenueSectionTypeActionForm({
  currentRow,
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading,
}: Readonly<Props>) {
  const isEdit = !!currentRow

  const form = useForm<TVenueSectionTypeFormSchema>({
    resolver: zodResolver(VenueSectionTypeFormSchema),
    defaultValues: isEdit
      ? {
          name: currentRow?.name ?? '',
          isEdit,
        }
      : {
          name: '',
          isEdit,
        },
  })

  const onSubmit: SubmitHandler<TVenueSectionTypeFormSchema> = (values) => {
    onSubmitValues(values)
  }

  return (
    <Dialog
      open={open}
      modal
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-left">
          <DialogTitle>
            {isEdit ? 'Edit Venue Section Type' : 'Add Venue Section Type'}
          </DialogTitle>
        </DialogHeader>
        <div className="-mr-4 h-fit w-full overflow-y-auto py-1">
          <Form {...form}>
            <form
              id="venue-section-type-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              <TextInputField
                control={form.control}
                name="name"
                label="Venue Section Type Name"
                placeholder="Enter venue section type name"
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <CustomButton
            type="submit"
            loading={loading}
            form="venue-section-type-form"
          >
            Save Changes
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
