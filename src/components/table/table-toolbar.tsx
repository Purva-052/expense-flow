/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import useDebounce from "@/hooks/use-debaunce";
import SimpleDropDownSearchable from "../shared/custome-simple-dropdown";
import { Input } from "../ui/input";
import DateRangeFilter from "./custome-dateRange";

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
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter: any) => {
          if (filter.type === "search") {
            return (
              <Input
                key={filter.key}
                type="search"
                placeholder={filter.placeholder ?? "Search..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={filter.className ?? "w-[150px] lg:w-[350px]"}
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
                onChange={(val: any) => filter.onChange?.(val ?? undefined)}
                multiple={filter.multiple}
                className="w-[200px]"
                disabled={filter.disable}
              />
            );
          }

          if (filter.type === "dateRange") {
            return (
              <DateRangeFilter
                key={filter.key}
                placeholder={filter.placeholder ?? "Pick a date range"}
                onChange={filter.onChange}
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
