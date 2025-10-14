/* eslint-disable @typescript-eslint/no-explicit-any */
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

type Day = { day: string; active: boolean }

type DaysToggleProps = {
  days:any
  onToggle?: (index: number, updatedDay: Day) => void
}

export function DaysToggle({ days, onToggle }: DaysToggleProps) {
  const handleToggle = (index: number) => {
    const updatedDay = { ...days[index], active: !days[index].active }
    onToggle?.(index, updatedDay)
  }

  return (
    <div>
      <h3 className='mb-3 text-lg font-medium'>Active Days</h3>
      <div className='grid grid-cols-3 gap-4 sm:grid-cols-7'>
        {days.map((d:any, i:any) => (
          <div
            key={d.day}
            className='flex flex-col items-center justify-center space-y-2 rounded-md border p-3 hover:bg-gray-50'
          >
            <Label className='text-sm font-medium'>{d.day}</Label>
            <Switch
              checked={d.active}
              onCheckedChange={() => handleToggle(i)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
