/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataTableToolbarCompact, FilterConfig } from "./table-toolbar";

const GlobalFilterSection = ({
  filters,
  className = "my-4",
}: {
  filters: FilterConfig[];
  className?: any;
}) => {
  return (
    <div className={className}>
      <DataTableToolbarCompact filters={filters} />
    </div>
  );
};

export default GlobalFilterSection;
