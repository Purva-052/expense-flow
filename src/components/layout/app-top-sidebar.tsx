import { useLocation } from '@tanstack/react-router'
import { ProfileDropdown } from '../profile-dropdown'
import { URL_TO_TITLE_MAP } from './data/header-data'
import { Header } from './header'

const AppTopSidebar = () => {
  return (
    <Header className='shadow-sm' fixed>
      <HeaderTitle />
      <div className='ml-auto flex items-center space-x-4'>
        <ProfileDropdown />
      </div>
    </Header>
  )
}

export default AppTopSidebar

export const HeaderTitle = () => {
  const pathname = useLocation({ select: (location) => location.pathname })
  return (
    <h2 className='text-lg font-semibold tracking-tight'>
      {URL_TO_TITLE_MAP[pathname] ?? ''}
    </h2>
  )
}
