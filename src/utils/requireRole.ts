/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/requireRole.ts
import { redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/use-auth-store";
import instance from "@/config/instance/instance";
import API from "@/config/api/api";

type RequireRoleOptions = {
  allowUserIDs?: number[];
  allowedTech?: number[];
};

export async function requireRole(roles: any, options?: RequireRoleOptions) {
  const { user } = useAuthStore.getState();
  if (!user) {
    throw redirect({ to: "/unauthorized" });
  }

  const userRole = user?.user?.role || "";
  const userId = user?.user?.id;
  const hasRoleAccess = roles.includes(userRole);
  const hasUserIdAccess = options?.allowUserIDs?.includes(userId) ?? false;

  let technologyId = user?.user?.technology_id || user?.user?.technology?.id;

  if (userId && technologyId === undefined && options?.allowedTech) {
    try {
      const response = await instance.get<any>({ url: `${API.users.list}/${userId}` });
      technologyId = response?.data?.technology?.id;
    } catch (e) {
      console.error("Failed to fetch user details in requireRole:", e);
    }
  }

  const hasTechAccess =
    options?.allowedTech?.includes(technologyId || -1) ?? false;

  if (!hasRoleAccess && !hasUserIdAccess && !hasTechAccess) {
    throw redirect({ to: "/unauthorized" });
  }
}

