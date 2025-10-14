import { createFileRoute } from '@tanstack/react-router'
import CountryPage from '@/features/country'

export const Route = createFileRoute('/_authenticated/country/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CountryPage />
}
