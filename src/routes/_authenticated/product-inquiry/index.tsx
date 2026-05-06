import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/product-inquiry/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/product-inquiry/"!</div>
}
