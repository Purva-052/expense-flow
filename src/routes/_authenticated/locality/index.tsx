import { createFileRoute } from '@tanstack/react-router'
import LocalityPage from '@/features/locality'

export const Route = createFileRoute('/_authenticated/locality/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <LocalityPage />
}
