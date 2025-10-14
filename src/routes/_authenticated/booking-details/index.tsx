import { createFileRoute } from '@tanstack/react-router'
import BookingDetailsPage from '@/features/booking-details'

export const Route = createFileRoute('/_authenticated/booking-details/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <BookingDetailsPage />
}
