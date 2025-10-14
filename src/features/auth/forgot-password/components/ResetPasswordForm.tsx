import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { resetPasswordSchema, TResetPasswordSchema } from '../schema'
import FormPasswordField from '../../sign-in/components/form-password-field'

type ResetPasswordFormProps = {
  onSubmit: (data: TResetPasswordSchema) => void
  isSubmitting: boolean
}

export const ResetPasswordForm = ({ onSubmit, isSubmitting }: ResetPasswordFormProps) => {
  const form = useForm<TResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4'>
        {/* 🔐 New Password Field */}
        <FormPasswordField
          form={form}
          name='newPassword'
          label='New Password'
        />

        {/* 🔁 Confirm Password Field */}
        <FormPasswordField
          form={form}
          name='confirmPassword'
          label='Confirm Password'
        />

        {/* Submit Button */}
        <Button type='submit' disabled={isSubmitting} className='mt-2'>
          {isSubmitting ? 'Updating...' : 'Reset Password'}
        </Button>
      </form>
    </Form>
  )
}
