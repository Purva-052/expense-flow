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
        render={({ field, fieldState }) => (
          <>
            <PhoneInput
              defaultCountry="in"
              value={field.value || ""}
              onChange={(phone: string, meta: any) => {
                const digits = phone.replace(/\D/g, "");
                const dialCode = meta.country.dialCode;

                if (digits === dialCode) {
                  field.onChange(null);
                  return;
                }

                if (digits.length === 0) {
                  field.onChange(null);
                  return;
                }

                field.onChange(phone);
              }}
              onBlur={() => {
                const phone = field.value || "";
                const digits = phone.replace(/\D/g, "");

                if (digits.length === 0) {
                  field.onChange(null);
                  form.clearErrors(name);
                  return;
                }

                form.clearErrors(name);

                field.onBlur();
              }}
              className="phone-input !border !border-gray-300 !rounded-md !shadow-none focus:!ring-0 focus:!border-gray-300"
              inputClassName="!border-none !shadow-none focus:!ring-0 focus:!border-none"
            />

            {fieldState.error?.message && (
              <p className="text-red-500 text-xs mt-1">
                {String(fieldState.error.message)}
              </p>
            )}
          </>
        )}
      />
    </div>
  );
}
