// src/features/operators/components/action-form.tsx

import CustomButton from '@/components/shared/custom-button'
import { TextInputField } from '@/components/shared/custom-input-field'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { formSchema, TFormSchema } from '../schema'
import { Operator } from '../types'
import FormPasswordField from '@/features/auth/sign-in/components/form-password-field'

interface Props {
  currentRow?: Operator
  open: boolean
  onOpenChange: (open: boolean) => void
  loading?: boolean
  onSubmit: (values: TFormSchema) => void
}

export function ActionForm({
  currentRow,
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading,
}: Readonly<Props>) {
  const isEdit = !!currentRow

  const form = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow?.name ?? '',
          email: currentRow?.email ?? '',
          mobile: currentRow?.mobile ?? '',
          user_name: currentRow?.user_name ?? '',
          password: '', // Password is not pre-filled for security
          isEdit,
        }
      : {
          name: '',
          email: '',
          mobile: '',
          user_name: '',
          password: '',
          isEdit,
        },
  })

  const onSubmit: SubmitHandler<TFormSchema> = (values) => {
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
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <DialogTitle>{isEdit ? 'Edit Operator' : 'Add Operator'}</DialogTitle>
        </DialogHeader>
        <div className='-mr-4 h-fit w-full overflow-y-auto py-1 '>
          <Form {...form}>
            <form
              id='operator-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <TextInputField
                control={form.control}
                name='name'
                label='Full Name'
                placeholder='Enter the operator’s full name'
              />
              <TextInputField
                control={form.control}
                name='email'
                label='Email Address'
                placeholder='Enter a valid email address'
              />
              <TextInputField
                control={form.control}
                name='mobile'
                label='Mobile Number'
                placeholder='Enter a mobile number'
              />
              <TextInputField
                control={form.control}
                name='user_name'
                label='Username (Optional)'
                placeholder='Enter a unique username'
              />
              <FormPasswordField
                // control={form.control}
                form={form}
                name='password'
                label='Password'
                key={'password'}
                // type='password'
                // placeholder={
                //   isEdit
                //     ? 'Leave blank to keep current password'
                //     : 'Enter a strong password'
                // }
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <CustomButton type='submit' loading={loading} form='operator-form'>
            Save Changes
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}