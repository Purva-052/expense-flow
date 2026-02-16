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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface SimpleDropDownProps {
  options: { label: string; value: string }[];
  value?: string | string[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxHeight?: number;
  allowCreate?: boolean;
  onCreateOption?: (input: string) => Promise<any> | any;
  isLoading?: boolean;
  loadingText?: string;
  onChange?: (value: any) => void;
  allowClear?: boolean;
  multiple?: boolean;
}

const SimpleDropDownSearchable = ({
  options,
  value,
  placeholder,
  className,
  disabled = false,
  maxHeight = 200,
  allowCreate = false,
  onCreateOption,
  isLoading = false,
  loadingText = "Loading...",
  onChange,
  allowClear = true,
  multiple = false,
}: SimpleDropDownProps) => {
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
    (option) =>
      typeof option?.label === "string" &&
      option.label.toLowerCase().includes(searchValue.toLowerCase() || "")
  );

  const exactMatchExists = options?.some(
    (o) => o?.label?.toLowerCase() === searchValue.toLowerCase()
  );

  const handleCreate = async () => {
    if (!allowCreate || !onCreateOption || !searchValue.trim()) return;
    try {
      setIsCreating(true);
      const result = await onCreateOption(searchValue.trim());
      const createdValue = result?.value ?? searchValue.trim();
      onChange?.(createdValue);
      setOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="relative">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={triggerRef}
              variant="outline"
              className={cn(
                "m-0 h-10 w-full justify-between pr-8 rounded-full bg-white",
                !value && "text-muted-foreground"
              )}
              disabled={disabled || isLoading}
            >
              <span className="block truncate">
                {Array.isArray(value)
                  ? value.length > 0
                    ? (() => {
                        const first = options?.find(
                          (item) => String(item.value) === String(value[0])
                        )?.label;
                        const more = value.length - 1;
                        return more > 0 ? `${first} +${more} more` : first;
                      })()
                    : placeholder || "Select an option"
                  : value === null || value === undefined
                    ? placeholder || "Select an option"
                    : options?.find(
                        (item) => String(item.value) === String(value)
                      )?.label}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            style={{ width: popoverWidth }}
            className="p-0"
            align="start"
          >
            <Command shouldFilter={false} className="overflow-hidden">
              <CommandInput
                placeholder="Search..."
                value={searchValue}
                onValueChange={setSearchValue}
                disabled={isLoading}
              />
              <div style={{ maxHeight: `${maxHeight}px` }}>
                <CommandList
                  onWheel={(e) => {
                    e.stopPropagation();
                  }}
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
                        {filteredOptions?.map((item) => {
                          const isSelected = Array.isArray(value)
                            ? value.some(
                                (v) => String(v) === String(item.value)
                              )
                            : String(item.value) === String(value);

                          return (
                            <CommandItem
                              value={item.label}
                              key={item.value}
                              onSelect={() => {
                                if (multiple) {
                                  const current = Array.isArray(value)
                                    ? [...value]
                                    : [];
                                  const exists = current.some(
                                    (v) => String(v) === String(item.value)
                                  );
                                  const newVal = exists
                                    ? current.filter(
                                        (v) => String(v) !== String(item.value)
                                      )
                                    : [...current, item.value];
                                  onChange?.(newVal.length ? newVal : null);
                                } else {
                                  onChange?.(item.value);
                                  setOpen(false);
                                }
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  isSelected ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {item.label}
                            </CommandItem>
                          );
                        })}
                        {allowCreate && !!searchValue && !exactMatchExists && (
                          <CommandItem
                            value={`__create__:${searchValue}`}
                            onSelect={handleCreate}
                            disabled={isCreating}
                            className="text-primary"
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {isCreating ? "Adding…" : `Add "${searchValue}"`}
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

        {allowClear &&
          !disabled &&
          (Array.isArray(value)
            ? value.length > 0
            : value !== null && value !== undefined) && (
            <X
              className="absolute top-1/2 right-8 h-4 w-4 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-red-500"
              onClick={() => onChange?.(null)}
            />
          )}
      </div>
    </div>
  );
};

export default SimpleDropDownSearchable;
