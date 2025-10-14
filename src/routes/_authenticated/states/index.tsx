import StatesPage from '@/features/states'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/states/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <StatesPage/>
}
