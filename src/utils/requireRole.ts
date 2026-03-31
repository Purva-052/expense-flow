/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/requireRole.ts
import { redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/use-auth-store'

type RequireRoleOptions = {
  allowUserIDs?: number[]
}

export function requireRole(roles: any, options?: RequireRoleOptions) {
  const { user } = useAuthStore.getState()
  const userRole = user?.user?.role || ''
  const userId = user?.user?.id
  const hasRoleAccess = roles.includes(userRole)
  const hasUserIdAccess = options?.allowUserIDs?.includes(userId) ?? false

  if (!user || (!hasRoleAccess && !hasUserIdAccess)) {
    throw redirect({ to: '/unauthorized' })
  }
}