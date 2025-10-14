import VenueViewPage from '@/features/venue/components/view-venue'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/venue-view/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <VenueViewPage/>
}
