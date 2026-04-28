import { Moon, Sun } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useTheme } from '@/context/theme-context'
import { Label } from '@/components/ui/label'

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const isDark = theme === 'dark'

  const toggleTheme = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light')
  }

  return (
    <div className='flex items-center space-x-2'>
      <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-muted-foreground' />
      <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-muted-foreground' />
      <Switch
        id='theme-mode'
        checked={isDark}
        onCheckedChange={toggleTheme}
        aria-label='Toggle theme'
      />
      <Label htmlFor='theme-mode' className='sr-only'>
        Toggle theme
      </Label>
    </div>
  )
}
