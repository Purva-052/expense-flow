/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

export interface TextInputFieldProps {
  control: any;
  name: string;
  label: string;
  placeholder: string;
  type?: React.HTMLInputTypeAttribute; // 👈 add this
  className?: string;
  valueAsNumber?: boolean; // 👈 add this
  min?: number;
  max?: number;
  autoComplete?: string; // ✅ add this prop
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement> | undefined; // ✅ add this prop
  onPaste?: React.ClipboardEventHandler<HTMLInputElement> | undefined; // ✅ add this prop
  disabled?: boolean;
}

export function TextInputField({
  control,
  name,
  label,
  placeholder,
  className,
  min,
  max,
  type = "text", // 👈 default to text
  valueAsNumber = false, // 👈 default false
  autoComplete = "off", // ✅ default to off
  onKeyDown = undefined, // ✅ add this prop
  onPaste = undefined, // ✅ add this prop
  disabled = false,
}: Readonly<TextInputFieldProps>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="text-right">{label}</FormLabel>
          <div>
            <FormControl>
              <Input
                placeholder={placeholder}
                className={`p-5 ${className}`}
                type={type} // 👈 use type here
                min={min}
                max={max}
                {...field}
                autoComplete={autoComplete} // ✅ pass down to input
                {...(valueAsNumber ? { valueAsNumber: true } : {})} // 👈 forward valueAsNumber
                onKeyDown={onKeyDown}
                onPaste={onPaste}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage className="col-start-3" />
          </div>
        </FormItem>
      )}
    />
  );
}
