/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { cn } from '@/lib/utils'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select as BaseSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps
  extends React.ComponentPropsWithoutRef<typeof BaseSelect> {
  options: SelectOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      options,
      placeholder = 'Select an option',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div>
        <BaseSelect disabled={disabled} {...props}>
          <SelectTrigger
            ref={ref}
            className={cn(
              'border-input bg-background text-foreground h-10 w-full min-w-[160px] rounded-md border px-3 py-2 text-sm',
              'focus:ring-ring focus:ring-offset-background focus:ring-2 focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent
            className={cn(
              'border-input bg-background text-foreground rounded-md border shadow-lg',
              'max-h-60 overflow-y-auto' // <-- scrollbar behavior
            )}
          >
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className='hover:bg-accent hover:text-accent-foreground cursor-pointer px-3 py-2'
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </BaseSelect>
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select, type SelectOption }

// ================= CustomSelect for react-hook-form =================

interface CustomSelectProps {
  name: string
  label: string
  placeholder?: string
  disabled?: boolean
  form: UseFormReturn<any> // Adjust type as needed
  options: SelectOption[]
}

const CustomSelect = ({
  name,
  label,
  placeholder = 'Select an option',
  disabled = false,
  form,
  options,
  ...props
}: CustomSelectProps) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Select
            options={options}
            placeholder={placeholder}
            disabled={disabled}
            value={field.value}
            className='w-full'
            onValueChange={field.onChange}
            aria-required='true'
            {...props}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)

export default CustomSelect
