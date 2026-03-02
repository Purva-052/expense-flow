import useDebounce from "@/hooks/use-debaunce";
import { useState } from "react";
import { useGetTechnologyDropdownList } from "../technology/services";
import { FilterConfig } from "@/components/table/table-toolbar";
import PageLayout from "@/components/layout/layout-provider";
import TablePageHeader from "@/components/table/table-page-header";
import GlobalFilterSection from "@/components/table/global-table-filter";
import MeetingsOverviewTab from "./components/meetings-overviewTab";

const MeetingsOverviewPage = () => {
  const [search, _] = useState<string>("");
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const debouncedSearch = useDebounce(search, 500);
  const { data: technologies, isPending: techLoading }: any =
    useGetTechnologyDropdownList();

  const handleTechChange = (value: any) => {
    const val = value ?? [];
    setSelectedTech(Array.isArray(val) ? val : [val]);
  };

  const filters: FilterConfig[] = [
    // {
    //   type: "search",
    //   placeholder: "Search by name ...",
    //   key: "search",
    //   value: search,
    //   onChange: (val) => setSearch(val ?? ""),
    // },
    {
      type: "select",
      key: "technologyId",
      placeholder: "Filter by Technology",
      options:
        technologies?.data?.map((tech: any) => ({
          value: tech.id,
          label: tech.name,
        })) ?? [],
      value: selectedTech,
      onChange: handleTechChange,
      isLoading: techLoading,
      multiple: true,
    },
  ];

  return (
    <PageLayout>
      <TablePageHeader title="Meetings Overview">
        View and manage internal meetings across all projects.
      </TablePageHeader>

      {/* 1. Global Filters */}
      <GlobalFilterSection filters={filters} />

      <div className="flex-1 min-h-0 h-[calc(100vh-180px)] mt-2">
        <MeetingsOverviewTab
          search={debouncedSearch}
          technologyIds={selectedTech}
        />
      </div>
    </PageLayout>
  );
};

export default MeetingsOverviewPage;
