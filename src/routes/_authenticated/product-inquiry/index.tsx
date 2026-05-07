import ProductInquiryPage from '@/features/product-inquiry'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/product-inquiry/')({
  component: ProductInquiryPage,
})
