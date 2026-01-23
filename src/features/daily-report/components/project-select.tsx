import { useEffect, useState, useRef } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetProjectSDropdownList } from "@/features/Project-type/services";

interface ProjectSelectProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ProjectSelect({
  value,
  onChange,
  disabled,
}: ProjectSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [width, setWidth] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const { data: projectsData, isPending: isLoading }: any =
    useGetProjectSDropdownList({
      search: debouncedSearch,
    });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (triggerRef.current) {
      setWidth(triggerRef.current.offsetWidth);
    }
  }, [triggerRef.current, open]);

  const projects = projectsData?.data || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {value
            ? projects.find(
                (project: any) => String(project.id) === String(value)
              )?.name || "Select project..."
            : "Select project..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        align="start"
        style={{ width: width ? `${width}px` : "auto" }}
      >
        <Command>
          <CommandInput
            placeholder="Search project..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            {isLoading && (
              <div className="p-2 flex justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
            {!isLoading && projects.length === 0 && (
              <CommandEmpty>No project found.</CommandEmpty>
            )}
            <CommandGroup>
              {!isLoading &&
                projects.map((project: any) => (
                  <CommandItem
                    key={project.id}
                    value={project.name}
                    onSelect={() => {
                      onChange(String(project.id));
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        String(value) === String(project.id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {project.name}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
