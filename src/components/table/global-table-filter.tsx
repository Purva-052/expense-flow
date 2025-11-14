/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataTableToolbarCompact, FilterConfig } from "./table-toolbar";

const GlobalFilterSection = ({
  filters,
  className = "my-4",
  extraItem = null,
  extraItemClassName = "mx-2",
  extraItemShow = false,
}: {
  filters: FilterConfig[];
  className?: any;
  extraItem?: React.ReactNode;
  extraItemClassName?: any;
  extraItemShow?: boolean;
}) => {
  return (
    <div className={className}>
      <DataTableToolbarCompact filters={filters} />
      {extraItemShow && extraItem && (
        <div className={extraItemClassName}>{extraItem}</div>
      )}
    </div>
  );
};

export default GlobalFilterSection;
