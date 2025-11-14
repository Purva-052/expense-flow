/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller } from "react-hook-form";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

interface Props {
  form: any;
  name: string;
  label?: string;
}

export function PhoneInputField({ form, name, label }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <Controller
        control={form.control}
        name={name}
        render={({ field }: any) => (
          <PhoneInput
            defaultCountry="in"
            value={field.value}
            onChange={(phone: any, meta: any) => {
              const digits = phone.replace(/\D/g, ""); // only numbers
              const max = meta?.maxLength ?? 15;

              // Block input if exceeds max digits
              if (digits.length <= max) {
                field.onChange(phone);
              }
            }}
            className="phone-input !border !border-gray-300 !rounded-md !shadow-none focus:!ring-0 focus:!border-gray-400"
            inputClassName="!border-none !shadow-none focus:!ring-0 focus:!border-none"
          />
        )}
      />

      {form.formState.errors[name]?.message && (
        <p className="text-red-500 text-xs">
          {String(form.formState.errors[name]?.message)}
        </p>
      )}
    </div>
  );
}
