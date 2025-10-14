import TablesManagement from '@/features/tables-management'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/tables-management/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <TablesManagement />
}
