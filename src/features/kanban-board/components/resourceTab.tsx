// src/components/resource-tab.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Users } from "lucide-react";
import { useGetTechnologyData } from "@/features/technology/services";
import { ResourceCard } from "./resource-card";
import GlobalFilterSection from "@/components/table/global-table-filter";
import { FilterConfig } from "@/components/table/table-toolbar";
import { useGetUsersList } from "@/features/users/services";

const ResourceTab = () => {
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [listParams, setListParams] = useState({
    technologyId: null,
  });

  const apiParams = {
    pagination: false,
    technologyId: listParams.technologyId,
  };

  const { data: usersList, isPending: usersListLoading }: any =
    useGetUsersList(apiParams);
  const { data: technologies, isPending: techLoading }: any =
    useGetTechnologyData({
      pagination: false,
    });

  // Handler for technology change
  const handleTechnologyChange = (value: any) => {
    setSelectedTech(value ?? null);
    setListParams({
      ...listParams,
      technologyId: value ?? null,
    });
  };

  // Filter configuration
  const filters: FilterConfig[] = [
    {
      type: "select",
      key: "technologyId",
      placeholder: "Filter by Technology",
      options: technologies?.data?.map((technology: any) => ({
        value: technology.id,
        label: technology.name,
      })),
      value: selectedTech,
      onChange: handleTechnologyChange,
      isLoading: techLoading,
    },
  ];

  return (
    <>
      {usersListLoading || techLoading ? (
        // --- Loading Spinner ---
        <div className="flex flex-col justify-center items-center py-10 gap-3 h-full">
          <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary"></div>
          <span className="text-sm text-muted-foreground">Loading ...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* --- Technology Filter --- */}
          <GlobalFilterSection filters={filters ?? []} />

          {/* --- Main Content --- */}
          {!selectedTech ? (
            // --- Fallback UI (No Tech Selected) ---
            <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-lg mt-4">
              <div className="mb-3 p-3 rounded-full bg-muted">
                <Users className="h-10 w-10 text-muted-foreground/70" />
              </div>
              <h3 className="text-lg font-semibold text-muted-foreground">
                Please select a technology
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a technology from the dropdown to view available
                resources.
              </p>
            </div>
          ) : usersList?.data?.length > 0 ? (
            // --- Resource Grid ---
            <div className="space-y-4">
              {usersList?.data?.map((dev: any) => (
                <ResourceCard key={dev?.id} developer={dev} />
              ))}
            </div>
          ) : (
            // --- No Resources Found ---
            <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-lg mt-4">
              <h3 className="text-lg font-semibold text-muted-foreground">
                No resources found
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                There are no developers available for the selected technology.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ResourceTab;
