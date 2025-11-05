"use client";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, X } from "lucide-react";
import * as React from "react";

export type Option = Record<"value" | "label", string>;

type MultiSelectProps = {
  options: Option[];
  selected: string[];
  onChange: (value: string[]) => void;
  className?: string;
  placeholder?: string;
  maxHeight?: number;
  fullWidth?: boolean;
  maxSelectedShow?: number;
};

export function CustomMultiSelect({
  options,
  selected,
  onChange,
  className,
  placeholder = "Select...",
  maxHeight = 200,
  maxSelectedShow = 2,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleUnselect = (value: string) => {
    onChange(selected.filter((s) => s !== value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current;
    if (!input) return;
    if (
      (e.key === "Delete" || e.key === "Backspace") &&
      input.value === "" &&
      selected.length > 0
    ) {
      onChange(selected.slice(0, -1));
    }
    if (e.key === "Escape") input.blur();
  };

  const selectedValues = options.filter((option) =>
    selected.includes(option.value)
  );
  const visibleBadges = selectedValues.slice(0, maxSelectedShow);
  const hiddenCount = Math.max(0, selectedValues.length - maxSelectedShow);
  const selectables = options.filter(
    (option) =>
      !selected.includes(option.value) &&
      option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <Command
      onKeyDown={handleKeyDown}
      className={cn("overflow-visible bg-transparent", className)}
    >
      <div
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "w-full group relative flex items-center rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all cursor-pointer"
        )}
      >
        <div className="flex flex-wrap gap-1 items-center flex-1">
          {visibleBadges.map((option) => (
            <Badge key={option.value} variant="secondary">
              {option.label}
              <button
                className="ml-1 rounded-full outline-none"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnselect(option.value);
                }}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          {hiddenCount > 0 && (
            <Badge variant="secondary">+{hiddenCount} more</Badge>
          )}
          {!selected.length && (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>

        {/* Always visible Chevrons + hover-only Clear button */}
        <div className="ml-2 flex items-center gap-1">
          {selected.length > 0 && (
            <button
              onClick={clearAll}
              className="hover:bg-muted rounded transition hidden group-hover:block"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
          <ChevronsUpDown
            className={`h-4 w-4 text-muted-foreground ${selected.length > 0 ? "group-hover:hidden" : ""}`}
          />
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="relative mt-2 w-full">
          <CommandList>
            <div
              style={{ maxHeight: `${maxHeight}px` }}
              className="absolute top-0 left-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in"
            >
              <CommandInput
                ref={inputRef}
                value={inputValue}
                onValueChange={setInputValue}
                onBlur={() => setOpen(false)}
                placeholder={placeholder}
                autoFocus
              />
              {selectables?.length === 0 && (
                <CommandEmpty>No option found.</CommandEmpty>
              )}
              {/* Options list */}
              <CommandGroup
                className="overflow-y-auto"
                style={{ maxHeight: maxHeight - 40 }}
              >
                {selectables.length > 0 ? (
                  selectables.map((option) => (
                    <CommandItem
                      key={option.value}
                      onMouseDown={(e) => e.preventDefault()}
                      onSelect={() => {
                        setInputValue("");
                        onChange([...selected, option.value]);
                      }}
                      className="cursor-pointer"
                    >
                      {option.label}
                    </CommandItem>
                  ))
                ) : (
                  <div className="text-center py-2 text-sm text-muted-foreground">
                    No Data
                  </div>
                )}
              </CommandGroup>
            </div>
          </CommandList>
        </div>
      )}
    </Command>
  );
}
