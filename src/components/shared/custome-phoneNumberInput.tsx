/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { Label } from '@/components/ui/label'

const countryPhoneRules: Record<
  string,
  { regex: RegExp; message: string; maxLength: number }
> = {
  IN: {
    regex: /^[6-9]\d{9}$/,
    message: 'Enter a valid 10-digit Indian mobile number',
    maxLength: 10,
  },
  US: {
    regex: /^\d{10}$/,
    message: 'Enter a valid 10-digit US phone number',
    maxLength: 10,
  },
  UK: {
    regex: /^7\d{9}$/,
    message: 'Enter a valid 10-digit UK phone number',
    maxLength: 10,
  },
  AE: {
    regex: /^5\d{8}$/,
    message: 'Enter a valid 9-digit UAE mobile number (e.g., 5XXXXXXXX)',
    maxLength: 9,
  },
  AU: {
    regex: /^4\d{8}$/,
    message: 'Enter a valid 9-digit Australian mobile number (e.g., 4XXXXXXXX)',
    maxLength: 9,
  },
  DE: {
    regex: /^\d{10,11}$/,
    message: 'Enter a valid 10–11 digit German phone number',
    maxLength: 11,
  },
  ZA: {
    regex: /^0\d{9}$/,
    message:
      'Enter a valid 10-digit South African phone number (e.g., 0XXXXXXXXX)',
    maxLength: 10,
  },
}

interface PhoneNumberInputProps {
  form: any
  fieldName?: string // nested form field e.g., 'owner.phone'
  countries?: any[]
  isLoading?: boolean
}

export const PhoneNumberInput = ({
  form,
  fieldName = 'phone',
  countries = [],
  isLoading = false,
}: PhoneNumberInputProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const countriesList = useMemo(
    () => (Array.isArray(countries) ? countries : []),
    [countries]
  )
  const phoneCountryId = form?.watch?.(`${fieldName}NumberCountryId`)
  const phoneCountryCode = form?.watch?.(`${fieldName}NumberCountryCode`)
  const phoneNumber: string = form?.watch?.(fieldName) ?? ''

  const selectedCountry = useMemo(() => {
    if (phoneCountryId)
      return countriesList.find((c: any) => c.id === phoneCountryId)
    if (phoneCountryCode)
      return countriesList.find((c: any) => c.dialCode === phoneCountryCode)
    return undefined
  }, [countriesList, phoneCountryId, phoneCountryCode])

  const handleCountrySelect = (country: any) => {
    setIsOpen(false)
    form?.setValue(`${fieldName}NumberCountryId`, country?.id)
    form?.setValue(`${fieldName}NumberCountryCode`, country?.dialCode)
    form?.clearErrors(fieldName)
  }

  const handlePhoneNumberChange = (e: any) => {
    let value = e.target.value.replace(/\D/g, '')
    const rule = selectedCountry
      ? countryPhoneRules[selectedCountry?.code]
      : undefined
    if (rule) value = value.slice(0, rule.maxLength)
    form?.setValue(fieldName, value)

    if (value && rule && !rule.regex.test(value)) {
      form?.setError(fieldName, { type: 'manual', message: rule.message })
    } else {
      form?.clearErrors(fieldName)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.country-dropdown'))
        setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className='space-y-1'>
      <Label htmlFor={fieldName}>Phone Number</Label>
      <div className='flex h-9'>
        {/* Country Selector */}
        <div className='country-dropdown relative'>
          <button
            type='button'
            onClick={() => setIsOpen(!isOpen)}
            disabled={isLoading || countriesList.length === 0}
            className={`flex h-full items-center gap-2 rounded-l-md border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium hover:bg-gray-50 focus:border-gray-300 focus:ring-[3px] focus:ring-gray-300 ${
              isLoading || countriesList.length === 0
                ? 'cursor-not-allowed opacity-50'
                : ''
            }`}
          >
            {selectedCountry?.flag && (
              <img
                src={selectedCountry.flag}
                alt={selectedCountry.name}
                className='h-4 w-6 object-cover'
              />
            )}
            <span>{selectedCountry?.dialCode || 'Select'}</span>
            <ChevronDown
              className={`ml-auto h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isOpen && (
            <div className='absolute top-full left-0 z-50 mt-1 max-h-60 w-64 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg'>
              {countriesList.map((country: any) => (
                <button
                  key={country.code ?? country.id}
                  type='button'
                  onClick={() => handleCountrySelect(country)}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                    country.id === selectedCountry?.id ||
                    country.dialCode === selectedCountry?.dialCode
                      ? 'bg-blue-50'
                      : ''
                  }`}
                >
                  {country.flag && (
                    <img
                      src={country.flag}
                      alt={country.name}
                      className='h-4 w-6 object-cover'
                    />
                  )}
                  <span className='flex-1'>
                    {country.name} ({country.dialCode})
                  </span>
                </button>
              ))}
              {isLoading && (
                <div className='px-3 py-2 text-center text-sm text-gray-500'>
                  Loading countries...
                </div>
              )}
              {!isLoading && countriesList.length === 0 && (
                <div className='px-3 py-2 text-center text-sm text-gray-500'>
                  No countries available
                </div>
              )}
            </div>
          )}
        </div>

        {/* Phone Input */}
        <input
          id={fieldName}
          type='tel'
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder='Enter phone number'
          maxLength={
            selectedCountry
              ? countryPhoneRules[selectedCountry?.code]?.maxLength || 10
              : 10
          }
          className={`flex-1 rounded-r-md border border-l-0 border-gray-300 px-2 py-2 text-sm focus:border-gray-300 focus:ring-[3px] focus:ring-gray-300 focus:outline-none ${
            form?.formState?.errors?.[fieldName]
              ? 'border-red-500 focus:ring-red-500'
              : ''
          }`}
        />
      </div>

      {form?.formState?.errors?.[fieldName] && (
        <p className='flex items-center gap-1 text-sm text-red-600'>
          <X className='h-3 w-3' />
          {form.formState.errors[fieldName].message}
        </p>
      )}
    </div>
  )
}
