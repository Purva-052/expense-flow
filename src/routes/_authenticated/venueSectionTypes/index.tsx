import { createFileRoute } from '@tanstack/react-router'
import VenueSectionTypes from '@/features/venueSectionTypes'

export const Route = createFileRoute('/_authenticated/venueSectionTypes/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <VenueSectionTypes />
}
