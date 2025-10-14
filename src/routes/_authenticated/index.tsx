/* eslint-disable no-console */
import Dashboard from '@/features/dashboard'
import { createFileRoute } from '@tanstack/react-router'


// import { requireRole } from '@/utils/requireRole'


export const Route = createFileRoute('/_authenticated/')({
  component: Dashboard,
})
