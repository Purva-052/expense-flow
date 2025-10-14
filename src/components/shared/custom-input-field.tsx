/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'

export interface TextInputFieldProps {
  control: any
  name: string
  label: string
  placeholder: string
  type?: React.HTMLInputTypeAttribute // 👈 add this
  className?: string
  valueAsNumber?: boolean // 👈 add this
}

export function TextInputField({
  control,
  name,
  label,
  placeholder,
  className,
  type = 'text', // 👈 default to text
  valueAsNumber = false, // 👈 default false
}: Readonly<TextInputFieldProps>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className='flex flex-col'>
          <FormLabel className='text-right'>{label}</FormLabel>
          <div>
            <FormControl>
              <Input
                placeholder={placeholder}
                className={`p-5 ${className}`}
                type={type} // 👈 use type here
                autoComplete='off'
                {...field}
                {...(valueAsNumber ? { valueAsNumber: true } : {})} // 👈 forward valueAsNumber
              />
            </FormControl>
            <FormMessage className='col-start-3' />
          </div>
        </FormItem>
      )}
    />
  )
}
