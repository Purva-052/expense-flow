import { createFileRoute } from '@tanstack/react-router'
import HRPolicyPage from '@/features/hr-policy'

export const Route = createFileRoute('/_authenticated/hr-policy/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <HRPolicyPage />
}
