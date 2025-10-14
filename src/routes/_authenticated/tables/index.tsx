import TablesComponent from '@/features/tables'
import { requireRole } from '@/utils/requireRole'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/tables/')({
  component: RouteComponent,
  beforeLoad: () => {
    requireRole(['master-admin'])
  },
})

function RouteComponent() {
  return <TablesComponent />
}
