import ServerPage from '@/features/server'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/Server/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ServerPage/>
}
