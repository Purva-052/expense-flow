import { createFileRoute } from '@tanstack/react-router'
import CustomerPage from '@/features/customers'

export const Route = createFileRoute('/_authenticated/customers/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CustomerPage />
}
