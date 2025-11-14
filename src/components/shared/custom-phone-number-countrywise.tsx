/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

export function PhoneInputField({ form, name, label }: any) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="space-y-2">
          <FormLabel>{label}</FormLabel>

          <FormControl>
            <PhoneInput
              {...field}
              value={field.value || ""}
              onChange={(value) => field.onChange(value)}
              defaultCountry="IN"
              international
              withCountryCallingCode
              placeholder="Enter phone number"
              className={`
                w-full rounded-md border px-3 py-2 text-sm bg-background
                ${fieldState.error ? "border-red-500" : "border-input"}
              `}
            />
          </FormControl>

          {/* THIS WILL NOW SHOW PROPERLY */}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
