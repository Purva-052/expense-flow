import { createFileRoute } from '@tanstack/react-router'
import VenueTypesPage from '@/features/venue-types'

export const Route = createFileRoute('/_authenticated/venue-types/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <VenueTypesPage />
}
