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
  
  // First try exact match
  let title = URL_TO_TITLE_MAP[pathname]
  
  // If no exact match, find the matching base path (for detail/edit pages)
  if (!title) {
    const matchedKey = Object.keys(URL_TO_TITLE_MAP).find((key) => {
      // Skip root path to avoid matching everything
      if (key === '/') return false
      // Check if current pathname starts with this key
      return pathname.startsWith(key + '/')
    })
    
    if (matchedKey) {
      title = URL_TO_TITLE_MAP[matchedKey]
    }
  }
  
  return (
    <h2 className='text-lg font-semibold tracking-tight'>
      {title ?? ''}
    </h2>
  )
}
