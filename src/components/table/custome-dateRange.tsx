/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react'
import { CalendarIcon, X } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '../ui/button'
import { format, isSameDay } from 'date-fns'

export default function DateRangeFilter({
  placeholder,
  onChange,
}: {
  placeholder?: string
  onChange?: (val: { from: Date; to?: Date } | undefined) => void
}) {
  const [date, setDate] = useState<{ from: Date; to?: Date } | undefined>()
  const [open, setOpen] = useState(false)

  const handleClear = useCallback(
    (e?: any) => {
      if (e && e.stopPropagation) {
        e.stopPropagation()
        e.preventDefault()
      }
      setDate(undefined)
      if (onChange) onChange(undefined)
      setOpen(false)
    },
    [onChange]
  )

  const atLocalNoon = (d: Date) => {
    const nd = new Date(d)
    nd.setHours(12, 0, 0, 0)
    return nd
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={`w-[260px] justify-between text-left font-normal ${
            !date ? 'text-muted-foreground' : ''
          }`}
        >
          <div className='flex items-center'>
            <CalendarIcon className='mr-2 h-4 w-4' />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} -{' '}
                  {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </div>

          {date && (
            // Use a proper button so we can intercept pointerDown before PopoverTrigger
            <button
              type='button'
              aria-label='Clear date range'
              className='hover:bg-muted ml-2 flex h-6 w-6 items-center justify-center rounded'
              onPointerDown={(e) => {
                // stop the pointer event so PopoverTrigger doesn't open
                e.stopPropagation()
                e.preventDefault()
              }}
              onClick={(e) => {
                // extra safety: stop propagation and run clear logic
                e.stopPropagation()
                e.preventDefault()
                handleClear()
              }}
            >
              <X className='text-muted-foreground h-4 w-4' />
            </button>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='range'
          selected={date}
          onSelect={(range: any) => {
            let next = range
            if (range?.from && range?.to && isSameDay(range.from, range.to) && !date?.from) {
              next = { from: range.from, to: undefined }
            }
            // normalize to local noon to avoid UTC date shifting when serialized
            if (next?.from) next = { ...next, from: atLocalNoon(next.from) }
            if (next?.to) next = { ...next, to: atLocalNoon(next.to) }

            setDate(next)
            if (onChange) onChange(next)
            if (next?.from && next?.to) {
              setOpen(false)
            }
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}
