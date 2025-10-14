import Cookies from 'js-cookie'
// import { Navigate, Outlet } from '@tanstack/react-router'
// import { useAuthStore } from '@/stores/use-auth-store'
import { cn } from '@/lib/utils'
import { SearchProvider } from '@/context/search-context'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import SkipToMain from '@/components/skip-to-main'
import AppTopSidebar from './app-top-sidebar'
import { Navigate, Outlet } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/use-auth-store'

interface Props {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: Readonly<Props>) {
  const defaultOpen = Cookies.get('sidebar_state') !== 'false'
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return Navigate({ to: '/sign-in' })
  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SkipToMain />
        <AppSidebar />
        <div
          id='content'
          className={cn(
            'ml-auto w-full max-w-full',
            'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
            'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
            'sm:transition-[width] sm:duration-200 sm:ease-linear',
            'flex h-svh flex-col',
            'group-data-[scroll-locked=1]/body:h-full',
            'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh'
          )}
        >
          <AppTopSidebar />
          {children || <Outlet />}
        </div>
      </SidebarProvider>
    </SearchProvider>
  )
}
