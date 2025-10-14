/* eslint-disable @typescript-eslint/no-explicit-any */
import { Lock } from 'lucide-react'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from './password-input'

const FormPasswordField = ({
  form,
  name,
  label,
}: {
  form: any
  name: string
  label: string
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className='relative'>
              <Lock
                className='absolute top-1/2 left-3 -translate-y-1/2 text-gray-400'
                size={18}
              />
              <PasswordInput
                placeholder='Enter your password'
                className='text-black'
                {...field}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default FormPasswordField
