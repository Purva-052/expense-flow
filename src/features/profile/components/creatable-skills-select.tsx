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
import { ChevronsUpDown, Plus, X } from "lucide-react";
import * as React from "react";
import { Skill } from "../services";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

type CreatableSkillsSelectProps = {
  options: Skill[];
  selected: Skill[];
  onChange: (value: Skill[]) => void;
  onCreateSkill: (skillName: string) => Promise<Skill | void>;
  className?: string;
  placeholder?: string;
  maxHeight?: number;
  maxSelectedShow?: number;
  loading?: boolean;
  creating?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function CreatableSkillsSelect({
  options,
  selected,
  onChange,
  onCreateSkill,
  className,
  placeholder = "Select or create skills...",
  maxHeight = 200,
  maxSelectedShow = 3,
  loading,
  creating,
  onOpenChange,
}: CreatableSkillsSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  // When the dropdown opens, focus the search input WITHOUT letting the
  // browser scroll the page to bring it into view (which caused the
  // auto-scroll-to-top bug).
  React.useEffect(() => {
    onOpenChange?.(open);
    if (open && inputRef.current) {
      // Small timeout ensures the dropdown DOM is mounted before focusing
      const timer = setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, onOpenChange]);

  const handleUnselect = (skillId: string) => {
    onChange(selected.filter((s) => s.id !== skillId));
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current;
    if (!input) return;

    // Handle backspace to remove last selected skill
    if (
      (e.key === "Delete" || e.key === "Backspace") &&
      input.value === "" &&
      selected.length > 0
    ) {
      onChange(selected.slice(0, -1));
      return;
    }

    // Handle Enter to create new skill
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();

      // Check if skill already exists in options
      const existingSkill = options.find(
        (opt) =>
          opt?.skillName.toLowerCase() === inputValue.trim().toLowerCase()
      );

      if (existingSkill) {
        // If exists and not selected, add it
        if (!selected.find((s) => s.id === existingSkill.id)) {
          onChange([...selected, existingSkill]);
        }
      } else {
        // Create new skill
        const newSkill = await onCreateSkill(inputValue.trim());
        if (newSkill) {
          onChange([...selected, newSkill]);
        }
      }

      setInputValue("");
      return;
    }

    if (e.key === "Escape") {
      input.blur();
      setOpen(false);
    }
  };

  const visibleBadges = selected.slice(0, maxSelectedShow);
  const hiddenCount = Math.max(0, selected.length - maxSelectedShow);

  // Filter options: exclude already selected and filter by input
  const selectables = options.filter(
    (option) =>
      !selected.find((s) => s.id === option.id) &&
      option?.skillName?.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Check if input matches any existing option
  const exactMatch = options.find(
    (opt) => opt?.skillName?.toLowerCase() === inputValue.trim().toLowerCase()
  );
  const showCreateOption = inputValue.trim() && !exactMatch;

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <Command
      onKeyDown={handleKeyDown}
      className={cn("overflow-visible bg-transparent relative", className)}
    >
      <div
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "w-full group relative flex items-center rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all cursor-pointer"
        )}
      >
        <div className="flex flex-wrap gap-1 items-center flex-1">
          {visibleBadges.map((skill) => (
            <Badge key={skill.id} variant="secondary">
              {skill.skillName}
              <button
                className="ml-1 rounded-full outline-none"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnselect(skill.id);
                }}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          {hiddenCount > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="cursor-help">
                    +{hiddenCount} more
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-col gap-1">
                    {selected.slice(maxSelectedShow).map((skill) => (
                      <span key={skill.id}>{skill.skillName}</span>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
          <CommandList>
            <div
              style={{ maxHeight: `${maxHeight}px` }}
              className="flex flex-col overflow-y-auto"
            >
              <CommandInput
                ref={inputRef}
                value={inputValue}
                onValueChange={setInputValue}
                onBlur={() => setOpen(false)}
                placeholder={placeholder}
                className="border-none focus:ring-0"
              />
              {(loading || creating) && (
                <div className="flex flex-col justify-center items-center py-10 gap-3">
                  <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary"></div>
                  <span className="text-sm text-muted-foreground">
                    {creating ? "Creating skill..." : "Loading..."}
                  </span>
                </div>
              )}

              {!loading && !creating && (
                <>
                  {/* Show create option */}
                  {showCreateOption && (
                    <CommandGroup>
                      <CommandItem
                        onMouseDown={(e) => e.preventDefault()}
                        onSelect={async () => {
                          const newSkill = await onCreateSkill(
                            inputValue.trim()
                          );
                          if (newSkill) {
                            onChange([...selected, newSkill]);
                          }
                          setInputValue("");
                        }}
                        className="cursor-pointer text-primary"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create "{inputValue.trim()}"
                      </CommandItem>
                    </CommandGroup>
                  )}

                  {/* Show existing options */}
                  {selectables.length === 0 && !showCreateOption && (
                    <CommandEmpty>No skills found.</CommandEmpty>
                  )}

                  {selectables.length > 0 && (
                    <CommandGroup className="overflow-y-auto">
                      {selectables.map((option) => (
                        <CommandItem
                          key={option.id}
                          onMouseDown={(e) => e.preventDefault()}
                          onSelect={() => {
                            setInputValue("");
                            onChange([...selected, option]);
                          }}
                          className="cursor-pointer"
                        >
                          {option.skillName}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </div>
          </CommandList>
        </div>
      )}
    </Command>
  );
}
