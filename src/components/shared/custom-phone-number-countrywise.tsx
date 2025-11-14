/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller } from "react-hook-form";
import { PhoneInput, parseCountry } from "react-international-phone";
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

                // ★ FIX: If the value consists ONLY of the dial code, treat it as empty.
                // This prevents the component from saving "+91" on its own when the modal loads.
                if (digits === dialCode) {
                  field.onChange(null);
                  return;
                }

                // If nothing is entered → null
                if (digits.length === 0) {
                  field.onChange(null);
                  return;
                }

                // Block extra digits
                const max = meta?.maxLength ?? 15;
                if (digits.length <= max) {
                  field.onChange(phone);
                }
              }}
              onBlur={() => {
                const phone = field.value || "";
                const digits = phone.replace(/\D/g, "");

                // CASE 1: No number entered → null
                if (digits.length === 0) {
                  field.onChange(null);
                  form.clearErrors(name);
                  return;
                }

                const MINIMUM_DIGITS_THRESHOLD = 5;
                if (digits.length < MINIMUM_DIGITS_THRESHOLD) {
                  field.onChange(null);
                  form.setError(name, {
                    type: "manual",
                    message: `Please enter a valid phone number`,
                  });
                  return;
                }

                const meta: any = parseCountry(phone);
                const min = meta?.minLength ?? 8;

                // CASE 2: Too short → invalid → null
                if (digits.length < min) {
                  field.onChange(null);
                  form.setError(name, {
                    type: "manual",
                    message: `Enter at least ${min} digits`,
                  });
                  return;
                }

                // CASE 3: Valid → convert to E.164
                const e164 = `+${meta.countryCode}${digits.slice(meta.countryCode.length)}`;
                field.onChange(e164);
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
