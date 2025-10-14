import MenuCategories from '@/features/menu-categories'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/menu-categories/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <MenuCategories/>
}
