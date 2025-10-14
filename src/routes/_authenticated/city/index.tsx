import { createFileRoute } from '@tanstack/react-router'
import CityPage from '@/features/city'

export const Route = createFileRoute('/_authenticated/city/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CityPage />
}
