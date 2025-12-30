import ServerPage from '@/features/server'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/server/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ServerPage/>
}
