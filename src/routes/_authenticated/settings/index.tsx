import { createFileRoute } from '@tanstack/react-router'
import SettingPage from '@/features/settings'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingPage />
}
