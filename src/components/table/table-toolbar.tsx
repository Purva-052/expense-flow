/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import useDebounce from "@/hooks/use-debaunce";
import SimpleDropDownSearchable from "../shared/custome-simple-dropdown";
import { Input } from "../ui/input";
import DateRangeFilter from "./custome-dateRange";
import { SingleDateFilter } from "./custom-single-datepicker";
import { cn } from "@/lib/utils";

// type FilterType = "select" | "search" | "dateRange";

export interface FilterConfig {
  type: any;
  key: string;
  placeholder?: string;
  value?: any;
  options?: Option[];
  onChange?: (value?: any) => void;
  isLoading?: any;
  disable?: any;
  className?: any;
  multiple?: boolean;
  component?: any;
}

interface DataTableToolbarProps {
  filters?: FilterConfig[];
  className?: string;
}

export interface Option {
  label: string;
  value: string;
}

export function DataTableToolbarCompact({
  filters = [],
  className = "",
}: Readonly<DataTableToolbarProps>) {
  const searchFilter = filters.find((f) => f.type === "search");
  const [search, setSearch] = useState(searchFilter?.value ?? "");
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (searchFilter?.onChange) {
      searchFilter.onChange(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <div
      className={`grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2 px-1 w-full ${className}`}
    >
      {filters.map((filter: any) => {
        if (filter.type === "search") {
          return (
            <Input
              key={filter.key}
              type="search"
              placeholder={filter.placeholder ?? "Search..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "col-span-2 sm:col-span-auto w-full sm:w-[200px] lg:w-[280px] min-w-0 rounded-full",
                filter.className
              )}
            />
          );
        }

        if (filter.type === "select") {
          return (
            <SimpleDropDownSearchable
              key={filter.key}
              options={filter.options ?? []}
              value={filter.value}
              placeholder={filter.placeholder ?? "Select..."}
              onChange={(val: any) => filter.onChange?.(val)}
              multiple={filter.multiple}
              className={cn("w-full sm:w-[180px] min-w-0", filter.className)}
              disabled={filter.disable}
            />
          );
        }

        if (filter.type === "dateRange") {
          return (
            <DateRangeFilter
              key={filter.key}
              placeholder={filter.placeholder ?? "Pick a date range"}
              value={filter.value}
              onChange={filter.onChange}
              disabled={filter.disable}
              className={cn("w-full sm:w-auto", filter.className)}
            />
          );
        }

        if (filter.type === "date") {
          return (
            <SingleDateFilter
              key={filter.key}
              placeholder={filter.placeholder ?? "Pick a date"}
              value={filter.value}
              onChange={filter.onChange}
              disabled={filter.disable}
              className={cn("w-full sm:w-auto", filter.className)}
            />
          );
        }

        if (filter.type === "custom") {
          return (
            <div key={filter.key} className={cn("col-span-2 sm:col-span-auto", filter.className)}>
              {filter.component}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
