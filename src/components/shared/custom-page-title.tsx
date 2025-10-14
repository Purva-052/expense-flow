import { cn } from '@/lib/utils'

export interface PageTitleProps {
  children?: React.ReactNode
  className?: string
  title?: string
}
const PageTitle = ({ children, className }: Readonly<PageTitleProps>) => {
  return (
    <div className={cn(`flex items-center space-x-4  ${className}`)}>
      <h1 className='text-2xl font-semibold tracking-tight'>{children}</h1>
    </div>
  )
}

export default PageTitle
