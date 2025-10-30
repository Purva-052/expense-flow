/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useEffect } from "react";
import { Check, ChevronsUpDown, PlusCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface CustomDropDownProps {
  options: any;
  label: string;
  form: any;
  name: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxHeight?: number;
  allowCreate?: boolean;
  onCreateOption?: (input: string) => Promise<any> | any;
  isLoading?: boolean;
  loadingText?: string;
  onChangeValue?: any;
  multiple?: boolean; // ✅ new prop
  searchEnabled?: boolean; // ✅ new prop
}

const CustomDropDownSearchable = ({
  form,
  label,
  name,
  options,
  placeholder,
  className,
  disabled = false,
  maxHeight = 200,
  allowCreate = false,
  onCreateOption,
  isLoading = false,
  loadingText = "Loading...",
  onChangeValue,
  multiple = false, // default false
  searchEnabled = true,
}: CustomDropDownProps) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popoverWidth, setPopoverWidth] = useState<string | number>("auto");
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!open) setSearchValue("");
    const updateWidth = () => {
      if (triggerRef.current) {
        setPopoverWidth(triggerRef.current.getBoundingClientRect().width);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [open]);

  const filteredOptions = options?.filter(
    (option: any) =>
      typeof option?.label === "string" &&
      option.label.toLowerCase().includes(searchValue?.toLowerCase() || "")
  );

  const exactMatchExists = options?.some(
    (o: any) =>
      typeof o?.label === "string" &&
      o?.label?.toLowerCase() === searchValue?.toLowerCase()
  );

  const handleCreate = async () => {
    if (!allowCreate || !onCreateOption || !searchValue?.trim()) return;
    try {
      setIsCreating(true);
      const result = await onCreateOption(searchValue.trim());
      const createdValue = result?.value ?? searchValue.trim();
      if (multiple) {
        const current = form.getValues(name) || [];
        form.setValue(name, [...current, createdValue], {
          shouldDirty: true,
          shouldTouch: true,
        });
      } else {
        form.setValue(name, createdValue, {
          shouldDirty: true,
          shouldTouch: true,
        });
      }
      setOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <FormField
      control={form?.control}
      name={name}
      render={({ field }: any) => {
        const valueArray = multiple
          ? field.value || []
          : [field.value].filter(Boolean);
        return (
          <FormItem className={`flex flex-col ${className}`}>
            <FormLabel>{label}</FormLabel>
            <div className="relative">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      ref={triggerRef}
                      variant="outline"
                      className={cn(
                        "m-0 h-10 w-full justify-between pr-8",
                        valueArray.length === 0 && "text-muted-foreground"
                      )}
                      disabled={disabled || isLoading}
                    >
                      {valueArray.length > 0 ? (
                        <span className="flex flex-wrap gap-1">
                          {valueArray
                            .map(
                              (val: any) =>
                                options?.find(
                                  (opt: any) =>
                                    String(opt.value) === String(val)
                                )?.label ?? val
                            )
                            .join(", ")}
                        </span>
                      ) : (
                        <span>
                          {isLoading
                            ? loadingText
                            : placeholder || "Select an option"}
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>

                <PopoverContent
                  style={{ width: popoverWidth }}
                  className="p-0"
                  align="start"
                >
                  <Command shouldFilter={false} className="overflow-hidden">
                    {searchEnabled && (
                      <CommandInput
                        placeholder="Search..."
                        value={searchValue}
                        onValueChange={setSearchValue}
                        disabled={isLoading}
                      />
                    )}

                    <div style={{ maxHeight: `${maxHeight}px` }}>
                      <CommandList
                        onWheel={(e) => e.stopPropagation()}
                        style={{ maxHeight: `${maxHeight}px` }}
                      >
                        {isLoading ? (
                          <CommandEmpty>{loadingText}</CommandEmpty>
                        ) : (
                          <>
                            {filteredOptions?.length === 0 && (
                              <CommandEmpty>No option found.</CommandEmpty>
                            )}
                            <CommandGroup>
                              {filteredOptions?.map((item: any) => (
                                <CommandItem
                                  value={item.label}
                                  key={item.value}
                                  onSelect={() => {
                                    if (multiple) {
                                      const exists = valueArray.includes(
                                        item.value
                                      );
                                      const newValue = exists
                                        ? valueArray.filter(
                                            (v: any) => v !== item.value
                                          )
                                        : [...valueArray, item.value];
                                      field.onChange(newValue);
                                      onChangeValue?.(newValue);
                                    } else {
                                      field.onChange(item.value);
                                      onChangeValue?.(item.value);
                                      setOpen(false);
                                    }
                                    field.onBlur();
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      valueArray.includes(item.value)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {item.label}
                                </CommandItem>
                              ))}
                              {allowCreate &&
                                !!searchValue &&
                                !exactMatchExists && (
                                  <CommandItem
                                    value={`__create__:${searchValue}`}
                                    onSelect={handleCreate}
                                    disabled={isCreating}
                                    className="text-primary"
                                  >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    {isCreating
                                      ? "Adding…"
                                      : `Add "${searchValue}"`}
                                  </CommandItem>
                                )}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </div>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Clear button */}
              {valueArray.length > 0 && (
                <X
                  className="absolute top-1/2 right-9 h-4 w-4 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-red-500"
                  onClick={() => {
                    form.setValue(name, multiple ? [] : null, {
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                  }}
                />
              )}
            </div>
            <div className="relative">
              <FormMessage className="absolute !mt-[-0.25rem]" />
            </div>
          </FormItem>
        );
      }}
    />
  );
};

export default CustomDropDownSearchable;
