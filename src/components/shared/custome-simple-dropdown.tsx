/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useEffect } from 'react'
import { Check, ChevronsUpDown, PlusCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

interface SimpleDropDownProps {
  options: { label: string; value: string }[]
  value?: string
  placeholder?: string
  className?: string
  disabled?: boolean
  maxHeight?: number
  allowCreate?: boolean
  onCreateOption?: (input: string) => Promise<any> | any
  isLoading?: boolean
  loadingText?: string
  onChange?: (value: string | null) => void
}

const SimpleDropDownSearchable = ({
  options,
  value,
  placeholder,
  className,
  disabled = false,
  maxHeight = 200,
  allowCreate = false,
  onCreateOption,
  isLoading = false,
  loadingText = 'Loading...',
  onChange,
}: SimpleDropDownProps) => {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [popoverWidth, setPopoverWidth] = useState<string | number>('auto')
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (!open) setSearchValue('')
    const updateWidth = () => {
      if (triggerRef.current) {
        setPopoverWidth(triggerRef.current.getBoundingClientRect().width)
      }
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [open])

  const filteredOptions = options?.filter(
    (option) =>
      typeof option?.label === 'string' &&
      option.label.toLowerCase().includes(searchValue.toLowerCase() || '')
  )

  const exactMatchExists = options?.some(
    (o) => o.label.toLowerCase() === searchValue.toLowerCase()
  )

  const handleCreate = async () => {
    if (!allowCreate || !onCreateOption || !searchValue.trim()) return
    try {
      setIsCreating(true)
      const result = await onCreateOption(searchValue.trim())
      const createdValue = result?.value ?? searchValue.trim()
      onChange?.(createdValue)
      setOpen(false)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <div className='relative'>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={triggerRef}
              variant='outline'
              className={cn(
                'm-0 h-10 w-full justify-between pr-8',
                !value && 'text-muted-foreground'
              )}
              disabled={disabled || isLoading}
            >
              {value
                ? options?.find((item) => String(item.value) === String(value))
                    ?.label
                : placeholder || 'Select an option'}
              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            style={{ width: popoverWidth }}
            className='p-0'
            align='start'
          >
            <Command shouldFilter={false} className='overflow-hidden'>
              <CommandInput
                placeholder='Search...'
                value={searchValue}
                onValueChange={setSearchValue}
                disabled={isLoading}
              />
              <div style={{ maxHeight: `${maxHeight}px` }}>
                <CommandList
                  onWheel={(e) => {
                    e.stopPropagation()
                  }}
                >
                  {isLoading ? (
                    <CommandEmpty>{loadingText}</CommandEmpty>
                  ) : (
                    <>
                      {filteredOptions?.length === 0 && (
                        <CommandEmpty>No option found.</CommandEmpty>
                      )}
                      <CommandGroup>
                        {filteredOptions?.map((item) => (
                          <CommandItem
                            value={item.label}
                            key={item.value}
                            onSelect={() => {
                              onChange?.(item.value)
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                String(item.value) === String(value)
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {item.label}
                          </CommandItem>
                        ))}
                        {allowCreate && !!searchValue && !exactMatchExists && (
                          <CommandItem
                            value={`__create__:${searchValue}`}
                            onSelect={handleCreate}
                            disabled={isCreating}
                            className='text-primary'
                          >
                            <PlusCircle className='mr-2 h-4 w-4' />
                            {isCreating ? 'Adding…' : `Add "${searchValue}"`}
                          </CommandItem>
                        )}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </div>
            </Command>
          </PopoverContent>
        </Popover>

        {value && (
          <X
            className='absolute top-1/2 right-9 h-4 w-4 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-red-500'
            onClick={() => onChange?.(null)}
          />
        )}
      </div>
    </div>
  )
}

export default SimpleDropDownSearchable
