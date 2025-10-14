import Operators from '@/features/operator-magement'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/operator-magement/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Operators />
}
