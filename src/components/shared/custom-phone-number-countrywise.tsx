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
        <label className="text-sm font-medium text-foreground">{label}</label>
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
              className="phone-input-container"
              inputClassName="phone-input-field"
              countrySelectorStyleProps={{
                buttonClassName: "phone-country-button",
                dropdownStyleProps: {
                  className: "phone-country-dropdown",
                  listItemClassName: "phone-country-dropdown-item",
                  listItemSelectedClassName:
                    "phone-country-dropdown-item-selected",
                  listItemCountryNameClassName:
                    "phone-country-dropdown-item-country-name",
                  listItemDialCodeClassName:
                    "phone-country-dropdown-item-dial-code",
                },
              }}
            />

            {fieldState.error?.message && (
              <p className="text-red-500 text-xs mt-1">
                {String(fieldState.error.message)}
              </p>
            )}
          </>
        )}
      />

      <style>{`
        .phone-input-container {
          --react-international-phone-border-color: var(--input);
          --react-international-phone-background-color: var(--background);
          --react-international-phone-text-color: var(--foreground);
          --react-international-phone-selected-country-z-index: 10;
          
          display: flex;
          align-items: center;
          height: 36px;
          border: 1px solid var(--input);
          border-radius: 6px;
          overflow: hidden;
          background-color: var(--background);
        }

        .phone-input-field {
          width: 100% !important;
          background-color: transparent !important;
          color: var(--foreground) !important;
          border: none !important;
          font-size: 0.875rem !important;
          height: 100% !important;
        }

        .phone-country-button {
          background-color: transparent !important;
          border: none !important;
          border-right: 1px solid var(--input) !important;
          height: 100% !important;
          padding: 0 8px !important;
          transition: background-color 0.2s;
        }

        .phone-country-button:hover {
          background-color: var(--muted) !important;
        }

        .phone-country-dropdown {
          background-color: var(--popover) !important;
          border: 1px solid var(--border) !important;
          color: var(--popover-foreground) !important;
          z-index: 50 !important;
        }

        .phone-country-dropdown .react-international-phone-country-selector-list {
          background-color: var(--popover) !important;
          border: 1px solid var(--border) !important;
          padding: 4px 0 !important;
        }

        .phone-country-dropdown-item {
          background-color: transparent !important;
          color: var(--popover-foreground) !important;
          padding: 8px 12px !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }

        .phone-country-dropdown-item:hover {
          background-color: var(--accent) !important;
          color: var(--accent-foreground) !important;
        }

        .phone-country-dropdown-item-selected {
          background-color: var(--accent) !important;
          color: var(--accent-foreground) !important;
        }

        .phone-country-dropdown-item-country-name,
        .phone-country-dropdown-item-dial-code {
          color: inherit !important;
        }
      `}</style>
    </div>
  );
}
