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
  showClearButton?: boolean;
  sortOptions?: boolean;
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
  showClearButton = true,
  isLoading = false,
  loadingText = "Loading...",
  onChangeValue,
  multiple = false, // default false
  searchEnabled = true,
  sortOptions = true,
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

  // ---------- Filtering + Sorting (replace the previous declarations) ----------
  const safeOptions = Array.isArray(options) ? options : [];

  // filter by search
  const filteredOptions = safeOptions.filter(
    (option: any) =>
      typeof option?.label === "string" &&
      option.label.toLowerCase().includes((searchValue || "").toLowerCase())
  );

  // non-mutating sort - extract location name after GMT offset for timezone sorting
  const sortArray = (arr: any[]) =>
    [...arr].sort((a: any, b: any) => {
      const labelA = (a?.label ?? "").toString();
      const labelB = (b?.label ?? "").toString();

      // Extract text after GMT offset (e.g., "(GMT-11:00) Midway Island" -> "Midway Island")
      const extractName = (label: string) => {
        const match = label.match(/\)\s*(.+)$/);
        return match ? match[1].trim() : label;
      };

      const nameA = extractName(labelA);
      const nameB = extractName(labelB);

      return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
    });

  // final list used throughout the UI
  const finalOptions = sortOptions
    ? sortArray(filteredOptions)
    : filteredOptions;

  // Use a check against finalOptions when determining exact-match
  const exactMatchExists = finalOptions.some(
    (o: any) =>
      typeof o?.label === "string" &&
      o.label.toLowerCase() === (searchValue || "").toLowerCase()
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
        // Preserve boolean false as a valid selected value for single select
        const valueArray = multiple
          ? Array.isArray(field.value)
            ? field.value
            : []
          : field.value === null || field.value === undefined
          ? []
          : [field.value];
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
                        <span className="flex flex-wrap gap-1 items-center">
                          {(() => {
                            const entries = valueArray.map((val: any) => {
                              const opt = options?.find(
                                (o: any) => String(o.value) === String(val)
                              );
                              return {
                                label: opt?.label ?? val,
                                icon: opt?.icon,
                              };
                            });

                            const shown = entries.slice(0, 3);
                            const remainingCount = entries.length - 3;

                            return (
                              <>
                                {shown.map((entry: any, i: any) => {
                                  const renderIcon = (icon: any) => {
                                    if (!icon) return null;
                                    if (typeof icon === "string")
                                      return (
                                        <span className="text-sm">{icon}</span>
                                      );
                                    const IconComp: any = icon;
                                    return <IconComp className="h-4 w-4" />;
                                  };

                                  return (
                                    <span
                                      key={i}
                                      className="inline-flex items-center gap-2"
                                    >
                                      {renderIcon(entry.icon)}
                                      <span>
                                        {entry.label}
                                        {i < shown.length - 1 && ","}
                                      </span>
                                    </span>
                                  );
                                })}
                                {remainingCount > 0 && (
                                  <span className="text-muted-foreground ml-1">
                                    +{remainingCount} more
                                  </span>
                                )}
                              </>
                            );
                          })()}
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
                              {finalOptions?.map((item: any) => (
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
                                  <span className="inline-flex items-center gap-2">
                                    {(() => {
                                      if (!item.icon) return null;
                                      if (typeof item.icon === "string")
                                        return (
                                          <span className="text-lg">
                                            {item.icon}
                                          </span>
                                        );
                                      const IconComp: any = item.icon;
                                      return <IconComp className="h-4 w-4" />;
                                    })()}
                                    <span>{item.label}</span>
                                  </span>
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
              {valueArray.length > 0 && showClearButton && (
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
