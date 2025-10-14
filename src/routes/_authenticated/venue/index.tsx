import { createFileRoute } from '@tanstack/react-router'
import { requireRole } from '@/utils/requireRole'
import Vanue from '@/features/venue'

export const Route = createFileRoute('/_authenticated/venue/')({
  component: RouteComponent,
  beforeLoad: () => requireRole(['super_admin']),
})

function RouteComponent() {
  return <Vanue />
}
