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
}

const TablePageHeader = ({
  title,
  children,
  buttonText = "Add",
  onButtonClick,
  ActionButtonIcon = null,
  showActionButton = true,
  showActionButtonIcon = true,
}: Readonly<TablePageHeaderProps>) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <PageTitle>{title}</PageTitle>
        <span className="text-sm font-normal text-[#848485]">{children}</span>
      </div>
      {showActionButton && (
        <div>
          <Button onClick={onButtonClick}>
            {showActionButtonIcon &&
              (ActionButtonIcon ? ActionButtonIcon : <Plus />)}
            {buttonText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TablePageHeader;
