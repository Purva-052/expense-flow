import Cookies from 'js-cookie';
// import { Navigate, Outlet } from '@tanstack/react-router'
// import { useAuthStore } from '@/stores/use-auth-store'
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SearchProvider } from '@/context/search-context';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/use-auth-store';
import { Navigate, Outlet } from '@tanstack/react-router';
import AppTopSidebar from './app-top-sidebar';

interface Props {
  children?: React.ReactNode;
}

export function AuthenticatedLayout({ children }: Readonly<Props>) {
  const defaultOpen = Cookies.get('sidebar_state') !== 'false';
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        {/* <SkipToMain /> */}
        <AppSidebar />
        <div
          id="content"
          data-scroll-allow
          className={cn(
            'ml-auto w-full max-w-full',
            'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
            'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
            'sm:transition-[width] sm:duration-200 sm:ease-linear',
            'flex h-svh flex-col overflow-y-auto overflow-x-hidden'
          )}
        >
          <AppTopSidebar />
          {children || <Outlet />}
        </div>
      </SidebarProvider>
    </SearchProvider>
  );
}
