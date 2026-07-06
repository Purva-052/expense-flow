import { Plus } from "lucide-react";
import PageTitle from "../shared/custom-page-title";
import { Button } from "../ui/button";

interface TablePageHeaderProps {
  title?: string | React.ReactNode;
  children?: React.ReactNode;
  buttonText?: string;
  ActionButtonIcon?: React.ReactNode;
  onButtonClick?: () => void;
  showActionButton?: boolean;
  showActionButtonIcon?: boolean;
  actions?: React.ReactNode;
}

const TablePageHeader = ({
  title,
  children,
  buttonText = "Add",
  onButtonClick,
  ActionButtonIcon = null,
  showActionButton = true,
  showActionButtonIcon = true,
  actions,
}: Readonly<TablePageHeaderProps>) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 w-full sm:w-auto">
      {(title || children) && (
        <div className="text-center sm:text-left">
          {title && <PageTitle>{title}</PageTitle>}
          {children && <span className="text-sm font-normal text-[#848485]">{children}</span>}
        </div>
      )}
      <div className="flex flex-row items-center justify-center sm:justify-end gap-2 w-full sm:w-auto [&>button]:flex-1 sm:[&>button]:flex-none [&>button]:w-full sm:[&>button]:w-auto [&>a]:flex-1 sm:[&>a]:flex-none [&>a]:w-full sm:[&>a]:w-auto">
        {actions}
        {showActionButton && (
          <Button onClick={onButtonClick}>
            {showActionButtonIcon &&
              (ActionButtonIcon ? ActionButtonIcon : <Plus />)}
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TablePageHeader;
