import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrength?: boolean
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  className,
  showStrength = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [strength, setStrength] = useState(0)

  const calculateStrength = (password: string) => {
    let score = 0
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    return score
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (showStrength) {
      setStrength(calculateStrength(value))
    }
    props.onChange?.(e)
  }

  const getStrengthColor = () => {
    if (strength <= 2) return '#ef4444'
    if (strength <= 3) return '#f59e0b'
    return '#68883A'
  }

  const getStrengthText = () => {
    if (strength <= 2) return 'Weak'
    if (strength <= 3) return 'Medium'
    return 'Strong'
  }

  return (
    <div className='space-y-2'>
      <div className='relative'>
        <input
          type={showPassword ? 'text' : 'password'}
          className={cn(
            'flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400',
            className
          )}
          onChange={handlePasswordChange}
          {...props}
        />
        <button
          type='button'
          className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700'
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {showStrength && props.value && (
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <div className='h-1 flex-1 overflow-hidden rounded-full bg-gray-200'>
              <div
                className='h-full transition-all duration-300'
                style={{
                  width: `${(strength / 5) * 100}%`,
                  backgroundColor: getStrengthColor(),
                }}
              />
            </div>
            <span className='text-xs text-gray-500'>{getStrengthText()}</span>
          </div>
        </div>
      )}
    </div>
  )
}
