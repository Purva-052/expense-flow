import { createFileRoute } from '@tanstack/react-router'
import VenueSectionPage from '@/features/venue-sections'

export const Route = createFileRoute('/_authenticated/venue-sections/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <VenueSectionPage />
}
