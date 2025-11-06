/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/requireRole.ts
import { redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/use-auth-store'

export function requireRole(roles: any) {
  const { user } = useAuthStore.getState()
  if (!user || !roles.includes(user?.user?.role?.name || '')) {
    throw redirect({ to: '/unauthorized' })
  }
}