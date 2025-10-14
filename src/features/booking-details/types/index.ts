/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PreOrder {
  id: number
  menuItemId: number
  menuItemName: string
  quantity: number
  unitPrice: string
  totalPrice: string
  status: string
  description: string
}

export interface Guest {
  id: number
  fullName: string
  email: string
  phoneNumber: string
}

export interface BookingDetails {
  id: number
  bookingId: string
  userId: number
  venueId: number
  bookingDateTime: string   // e.g., "2025-09-26T18:00:00.000Z"
  endDateTime: string       // e.g., "2025-09-26T20:00:00.000Z"
  numberOfGuests: number
  actualTableNumber: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  specialRequests: string
  totalAmount: string
  depositAmount: string
  preOrderAmount: string
  isPreOrderRequired: boolean
  customerNotes: string
  venueNotes: string
  createdAt: string
  updatedAt: string
  userName: string
  userEmail: string
  userPhone: string
  venueName: string
  venueAddress: string
  sectionCapacity: number
  numberOfTables: number
  preOrders: PreOrder[]
  guests: Guest[]
  paymentTotalAmount:any
  paymentStatus:any
  paymentSubTotal:any
  applicationFeeAmount:any
  paymentApplicationTaxPercentage:any
  paymentApplicationTaxValue:any
  paymentGateway:any
  paymentMethod:any
}

export interface BookingDetailsResponse {
  success: boolean
  statusCode: number
  message: string
  data: BookingDetails
} 