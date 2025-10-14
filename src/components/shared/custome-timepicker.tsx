/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react'
import { Clock } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

interface TimePickerProps {
  value: any
  onChange: (val: string) => void
  placeholder?: string
}

const TimePicker = ({ value, onChange, placeholder }: TimePickerProps) => {
  const [open, setOpen] = useState(false)
  const [selectedHour, setSelectedHour] = useState('00')
  const [selectedMinute, setSelectedMinute] = useState('00')
  const hoursRef = useRef<HTMLDivElement>(null)
  const minutesRef = useRef<HTMLDivElement>(null)

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, '0')
  )

  // Update selected hour/minute if value changes
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':')
      setSelectedHour(h)
      setSelectedMinute(m)
    }
  }, [value])

  // Scroll selected hour into view
  useEffect(() => {
    if (open && hoursRef.current) {
      const selected = hoursRef.current.querySelector(
        `div:nth-child(${Number(selectedHour) + 1})`
      )
      selected?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [open, selectedHour])

  // Scroll selected minute into view
  useEffect(() => {
    if (open && minutesRef.current) {
      const selected = minutesRef.current.querySelector(
        `div:nth-child(${Number(selectedMinute) + 1})`
      )
      selected?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [open, selectedMinute])

  const handleNow = () => {
    const now = new Date()
    const h = String(now.getHours()).padStart(2, '0')
    const m = String(now.getMinutes()).padStart(2, '0')
    setSelectedHour(h)
    setSelectedMinute(m)
    onChange(`${h}:${m}`)
    setOpen(false)
  }

  const handleConfirm = () => {
    onChange(`${selectedHour}:${selectedMinute}`)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className='relative'>
          <Input
            value={value}
            placeholder={placeholder || 'Select time'}
            readOnly
            onClick={() => setOpen(true)}
          />
          <Clock
            className='absolute top-1/2 right-2 h-5 w-5 -translate-y-1/2 cursor-pointer text-gray-500'
            onClick={() => setOpen(true)}
          />
        </div>
      </PopoverTrigger>

      <PopoverContent className='flex w-48 flex-col gap-2 overflow-visible p-2'>
        <div className='flex gap-2'>
          {/* Hour Column */}
          <div
            className='h-40 flex-1 overflow-y-auto scroll-smooth rounded border'
            ref={hoursRef}
            onWheel={(e) => e.currentTarget.scrollBy({ top: e.deltaY })}
          >
            {hours.map((h) => (
              <div
                key={h}
                className={`cursor-pointer p-2 text-center ${
                  h === selectedHour ? 'bg-blue-500 text-white' : ''
                }`}
                onClick={() => setSelectedHour(h)}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Minute Column */}
          <div
            className='h-40 flex-1 overflow-y-auto scroll-smooth rounded border'
            ref={minutesRef}
            onWheel={(e) => e.currentTarget.scrollBy({ top: e.deltaY })}
          >
            {minutes.map((m) => (
              <div
                key={m}
                className={`cursor-pointer p-2 text-center ${
                  m === selectedMinute ? 'bg-blue-500 text-white' : ''
                }`}
                onClick={() => setSelectedMinute(m)}
              >
                {m}
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className='mt-2 flex justify-between'>
          <Button size='sm' variant='outline' onClick={handleNow}>
            Now
          </Button>
          <Button size='sm' onClick={handleConfirm}>
            OK
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default TimePicker
