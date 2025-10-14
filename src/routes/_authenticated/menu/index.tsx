import { createFileRoute } from '@tanstack/react-router'
import { requireRole } from '@/utils/requireRole'
import MenuPage from '@/features/menu'

export const Route = createFileRoute('/_authenticated/menu/')({
  component: RouteComponent,
  beforeLoad: () => {
    requireRole(['venue_owner'])
  },
})

function RouteComponent() {
  return <MenuPage />
}
