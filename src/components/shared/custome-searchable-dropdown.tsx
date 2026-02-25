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
  label?: React.ReactNode;
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
  multiple?: boolean;
  searchEnabled?: boolean;
  showClearButton?: boolean;
  sortOptions?: boolean;
  triggerClassName?: string;
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
  triggerClassName,
  allowCreate = false,
  onCreateOption,
  showClearButton = true,
  isLoading = false,
  loadingText = "Loading...",
  onChangeValue,
  multiple = false,
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

  const safeOptions = Array.isArray(options) ? options : [];

  const filteredOptions = safeOptions.filter(
    (option: any) =>
      typeof option?.label === "string" &&
      option.label.toLowerCase().includes((searchValue || "").toLowerCase())
  );

  const sortArray = (arr: any[]) =>
    [...arr].sort((a: any, b: any) => {
      const labelA = (a?.label ?? "").toString();
      const labelB = (b?.label ?? "").toString();
      const extractName = (label: string) => {
        const match = label.match(/\)\s*(.+)$/);
        return match ? match[1].trim() : label;
      };
      return extractName(labelA)
        .toLowerCase()
        .localeCompare(extractName(labelB).toLowerCase());
    });

  const finalOptions = sortOptions
    ? sortArray(filteredOptions)
    : filteredOptions;

  // Loose equality so numbers and strings cross-match (e.g. 3 == "3")
  const isSelected = (itemValue: any, valueArray: any[]) =>
    valueArray.some((v) => v == itemValue);

  const exactMatchExists = finalOptions.some(
    (o: any) =>
      typeof o?.label === "string" &&
      o.label.toLowerCase() === (searchValue || "").toLowerCase()
  );

  // ✅ Central setter — always goes through form.setValue with shouldValidate: true
  // This is the KEY fix: field.onChange alone does NOT trigger RHF revalidation,
  // so errors from a previous cleared state never get cleared on re-selection.
  const setFieldValue = (value: any) => {
    form.setValue(name, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleCreate = async () => {
    if (!allowCreate || !onCreateOption || !searchValue?.trim()) return;
    try {
      setIsCreating(true);
      const result = await onCreateOption(searchValue.trim());
      const createdValue = result?.value ?? searchValue.trim();
      if (multiple) {
        const current = Array.isArray(form.getValues(name))
          ? form.getValues(name)
          : [];
        setFieldValue([...current, createdValue]);
      } else {
        setFieldValue(createdValue);
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
        // Build valueArray preserving original types — no stringification
        let valueArray: any[] = [];
        if (multiple) {
          valueArray =
            Array.isArray(field.value) && field.value.length > 0
              ? field.value
              : [];
        } else {
          // Treat null, undefined, and blank string all as "nothing selected"
          const isEmpty =
            field.value === null ||
            field.value === undefined ||
            field.value === "" ||
            (typeof field.value === "string" && field.value.trim() === "");
          valueArray = isEmpty ? [] : [field.value];
        }

        return (
          <FormItem className={`flex flex-col ${className}`}>
            {!!label && <FormLabel>{label}</FormLabel>}
            <div className="relative">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      ref={triggerRef}
                      variant="outline"
                      className={cn(
                        "m-0 h-10 w-full min-w-0 justify-between pr-8 overflow-hidden",
                        valueArray.length === 0 && "text-muted-foreground",
                        triggerClassName
                      )}
                      disabled={disabled || isLoading}
                    >
                      {valueArray.length > 0 ? (
                        (() => {
                          const entries = valueArray.map((val: any) => {
                            const opt = options?.find(
                              (o: any) => o.value == val
                            );
                            return {
                              label: opt?.label ?? val,
                              icon: opt?.icon,
                            };
                          });

                          const renderIcon = (icon: any) => {
                            if (!icon) return null;
                            if (typeof icon === "string")
                              return <span className="text-sm">{icon}</span>;
                            const IconComp: any = icon;
                            return <IconComp className="h-4 w-4 shrink-0" />;
                          };

                          if (!multiple) {
                            const selected = entries[0];
                            return (
                              <span className="min-w-0 truncate">
                                <span className="inline-flex max-w-full min-w-0 items-center gap-2">
                                  {renderIcon(selected?.icon)}
                                  <span className="truncate max-w-[15ch]">
                                    {selected?.label}
                                  </span>
                                </span>
                              </span>
                            );
                          }

                          const shown = entries.slice(0, 3);
                          const remainingCount = entries.length - 3;

                          return (
                            <span className="min-w-0 flex flex-1 flex-wrap items-center gap-1">
                              {shown.map((entry: any, i: any) => (
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
                              ))}
                              {remainingCount > 0 && (
                                <span className="text-muted-foreground ml-1">
                                  +{remainingCount} more
                                </span>
                              )}
                            </span>
                          );
                        })()
                      ) : (
                        <span className="min-w-0 flex-1 truncate text-left">
                          {isLoading
                            ? loadingText
                            : placeholder || "Select an option"}
                        </span>
                      )}
                      {!(valueArray.length > 0 && showClearButton) && (
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      )}
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
                                      const exists = isSelected(
                                        item.value,
                                        valueArray
                                      );
                                      const newValue = exists
                                        ? valueArray.filter(
                                            (v: any) => v != item.value
                                          )
                                        : [...valueArray, item.value];
                                      // ✅ form.setValue triggers revalidation; field.onChange does NOT
                                      setFieldValue(newValue);
                                      onChangeValue?.(newValue);
                                    } else {
                                      // ✅ form.setValue triggers revalidation; field.onChange does NOT
                                      setFieldValue(item.value);
                                      onChangeValue?.(item.value);
                                      setOpen(false);
                                    }
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      isSelected(item.value, valueArray)
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
                    // ✅ Use "" for single (matches z.string() schemas), [] for multiple
                    // setFieldValue ensures shouldValidate fires so the error shows immediately
                    setFieldValue(multiple ? [] : "");
                  }}
                />
              )}
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default CustomDropDownSearchable;
