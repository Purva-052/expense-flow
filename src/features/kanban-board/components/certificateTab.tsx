/* eslint-disable @typescript-eslint/no-explicit-any */
import GlobalFilterSection from "@/components/table/global-table-filter";
import { FilterConfig } from "@/components/table/table-toolbar";
// import { Card } from "@/components/ui/card";
import { useGetUsersList } from "@/features/users/services";
import { Users } from "lucide-react";
import { useMemo, useState } from "react";
// import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";
import { useGetCertificatesDropdown } from "@/features/profile/services";
import { CertificateCard } from "./certificate-card";

const CertificateTab = () => {
  const [selectedCertificates, setSelectedCertificates] = useState<
    Array<string | number>
  >([]);
  const [searchQuery, setSearchQuery] = useState<string | undefined>();

  //   const user = useAuthStore((state) => state.user);
  //   const userRole = user?.user?.role;

  // Fetch all available certificates for dropdown
  const { data: certificatesData, isPending: certificatesLoading }: any =
    useGetCertificatesDropdown();

  // Build API params - include selected certificate IDs if any
  const apiParams = {
    pagination: false,
    ...(searchQuery && { search: searchQuery }),
    ...(selectedCertificates &&
      selectedCertificates.length > 0 && {
        certificateId: selectedCertificates,
      }),
    status: "active",
  };

  // Fetch all users with status active (server-side filtered by certificateId when provided)
  const { data: usersData, isPending: usersListLoading }: any =
    useGetUsersList(apiParams);

  const usersList = useMemo(() => usersData?.data ?? [], [usersData]);

  // Filter users by selected certificates
  const filteredUsers = useMemo(() => {
    if (selectedCertificates.length === 0) return usersList;

    return usersList.filter((u: any) =>
      u.certificates?.some((cert: any) =>
        selectedCertificates.includes(cert.id)
      )
    );
  }, [usersList, selectedCertificates]);

  // Filter users based on role (exclude ADMIN and PROJECT_MANAGER)
  const finalUsers = useMemo(() => {
    let users = filteredUsers.filter(
      (u: any) => u.role !== roles.ADMIN && u.role !== roles.PROJECT_MANAGER
    );

    // ✅ DEFAULT: show only users having certificates
    if (selectedCertificates.length === 0 && !searchQuery) {
      users = users.filter(
        (u: any) => u.certificates && u.certificates.length > 0
      );
    }

    // 🔍 SEARCH MODE: show all users (even without certificates)
    // nothing to do, users already contains all

    return users;
  }, [filteredUsers, selectedCertificates, searchQuery]);

  const handleCertificateChange = (value: any) => {
    const val = value ?? null;
    setSelectedCertificates(val && Array.isArray(val) ? val : val ? [val] : []);
  };

  const handleSearch = (search: string | undefined) => {
    setSearchQuery(search ?? undefined);
  };

  const certificateFilters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search by user name ...",
      key: "search",
      value: searchQuery,
      onChange: handleSearch,
    },
    {
      type: "select",
      key: "certificateId",
      placeholder: "Filter by Certificate",
      options: certificatesData?.data?.map((cert: any) => ({
        value: cert.certificateId ?? cert.id,
        label: cert.name,
      })),
      value: selectedCertificates,
      onChange: handleCertificateChange,
      isLoading: certificatesLoading,
      multiple: true,
    },
  ];

  const isLoading = usersListLoading || certificatesLoading;

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-4">
      <GlobalFilterSection filters={certificateFilters} />
      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-10 gap-3 flex-1 min-h-0">
          <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary"></div>
          <span className="text-sm text-muted-foreground">Loading ...</span>
        </div>
      ) : finalUsers?.length > 0 ? (
        <div className="flex-1 min-h-0 space-y-4 overflow-y-auto [scrollbar-gutter:stable] p-2">
          {finalUsers.map((u: any) => (
            <CertificateCard key={u.id} user={u} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-lg mt-4">
          <div className="mb-3 p-3 rounded-full bg-muted">
            <Users className="h-10 w-10 text-muted-foreground/70" />
          </div>
          <h3 className="text-lg font-semibold text-muted-foreground">
            No users found
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedCertificates.length > 0
              ? "There are no users with the selected certificates."
              : searchQuery
                ? "No users matching your search."
                : "There are no users available."}
          </p>
        </div>
      )}
    </div>
  );
};

export default CertificateTab;
