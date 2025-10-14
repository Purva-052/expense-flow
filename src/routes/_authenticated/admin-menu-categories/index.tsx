import { createFileRoute } from '@tanstack/react-router'
import AdminMenuCategories from '@/features/admin-menu-categories'

export const Route = createFileRoute('/_authenticated/admin-menu-categories/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AdminMenuCategories />
}
