import { useAuthStore } from "@/stores/use-auth-store";
import { useGetUserDetails } from "@/features/users/services";

export const useSidebarAccess = () => {
  const { user } = useAuthStore();
  const role = user?.user?.role || "";
  const id = user?.user?.id;

  const { data: userDetails }: any = useGetUserDetails(user?.user?.id);
  const technologyId = userDetails?.data?.technology?.id;
  const restrictedTechnologyIds = [29];
  const isRestrictedTechnologyUser = restrictedTechnologyIds.includes(technologyId);

  const hasSidebarAccess = (item: {
    requiredRoles?: string[];
    allowUserIDs?: number[];
    allowedTech?: number[];
  }) => {
    const hasRoleAccess = item.requiredRoles?.includes(role) ?? false;
    const hasUserIDsAccess = item.allowUserIDs?.includes(id) ?? false;
    const hasTechAccess = item.allowedTech?.includes(technologyId) ?? false;

    if (isRestrictedTechnologyUser) {
      return hasUserIDsAccess || hasTechAccess;
    }

    return hasRoleAccess || hasUserIDsAccess || hasTechAccess;
  };

  return {
    role,
    id,
    technologyId,
    hasSidebarAccess,
  };
};
