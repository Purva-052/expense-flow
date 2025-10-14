import { Plus } from 'lucide-react'
import PageTitle from '../shared/custom-page-title'
import { Button } from '../ui/button'

interface TablePageHeaderProps {
  title?: string
  children?: React.ReactNode
  buttonText?: string
  onButtonClick?: () => void
  showActionButton?: boolean
}

const TablePageHeader = ({
  title,
  children,
  buttonText = 'Add',
  onButtonClick,
  showActionButton = true,
}: Readonly<TablePageHeaderProps>) => {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <PageTitle>{title}</PageTitle>
        <span className='text-sm font-normal text-[#848485]'>{children}</span>
      </div>
      {showActionButton && (
        <div>
          <Button onClick={onButtonClick}>
            <Plus />
            {buttonText}
          </Button>
        </div>
      )}
    </div>
  )
}

export default TablePageHeader
