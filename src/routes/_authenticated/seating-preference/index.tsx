import SeatingPreference from '@/features/seating-preference'
import { requireRole } from '@/utils/requireRole'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/seating-preference/')({
  component: RouteComponent,
   beforeLoad: () => {
      requireRole(['club-admin'])
    },
})

function RouteComponent() {
  return <SeatingPreference />
}
