/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { ActionFormModal } from "./components/action";
import { columns } from "./components/columns";
import { ViewUserModal } from "./components/view-model";
import { useUsersStore } from "./stores/useUsersStore";
import {
  useGetUsersList,
  useGetUsersRoles,
  useExportCSV,
  useImportUsers,
} from "./services";
import { useGetTechnologyDropdownList } from "../technology/services";
import { useAuthStore } from "@/stores/use-auth-store";
import { roleLabels, roles } from "@/utils/constant";
import { ViewUserProfileModal } from "../profile/components/view-user-modal";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { Button } from "@/components/ui/button";
import { Download, FileDown } from "lucide-react";
import { toast } from "sonner";
import {
  ExcelImportPreview,
  ExcelPreviewData,
} from "@/features/kanban-board/components/project-view/excel-import-preview";
import * as ExcelJS from "exceljs";
import { useQueryClient } from "@tanstack/react-query";
import API from "@/config/api/api";
import { OrgChart } from "./components/org-chart";
import { cn } from "@/lib/utils";

function extractUsersArray(response: unknown) {
  if (Array.isArray(response)) return response;
  if (Array.isArray((response as any)?.data)) return (response as any).data;
  if (Array.isArray((response as any)?.data?.data))
    return (response as any).data.data;
  return [];
}

const UsersPage = () => {
  const { open, setOpen } = useUsersStore();
  const user = useAuthStore((state) => state.user);
  const UserRole = user?.user?.role;
  const isNewJoinee = location.pathname.includes("/New-joinees");
  const [queryParams, setQueryParams] = useQueryStates({
    pageSize: parseAsInteger.withDefault(10),
    currentPage: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    role: parseAsString,
    status: parseAsString,
    technologyId: parseAsInteger,
  });

  const listParams = {
    pageSize: queryParams.pageSize,
    currentPage: queryParams.currentPage,
    search: queryParams.search,
    role: queryParams.role,
    status: queryParams.status ?? undefined,
    technologyId: queryParams.technologyId,
  };

  // const [listParams, setQueryParams] = useState({
  //   pageSize: 10,
  //   currentPage: 1,
  //   search: "",
  //   role: undefined,
  //   technologyId: null,
  //   status: "active",
  // });

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    pagination: true,
    role: listParams.role,
    technologyId: listParams.technologyId,
    status: listParams.status,
  };

  const didInitStatus = useRef(false);
  useEffect(() => {
    if (didInitStatus.current) return;
    didInitStatus.current = true;
    if (queryParams.status == null) {
      setQueryParams({ status: "active" });
    }
  }, [queryParams.status, setQueryParams]);

  const { data: listData, isPending: loading } = useGetUsersList({
    ...apiParams,
    ...(isNewJoinee ? { is_joining: false } : { is_joining: true }),
  });

  const [activeTab, setActiveTab] = useState<"directory" | "org-chart">(
    "directory"
  );

  const { data: allUsersResponse, isPending: allUsersLoading } =
    useGetUsersList({
      pagination: false,
    });
  const allActiveUsers = extractUsersArray(allUsersResponse);

  const { mutate: exportCSV, isPending: exportCSVLoading } = useExportCSV();
  const canExportCSV =
    UserRole === roles.ADMIN || UserRole === roles.PROJECT_MANAGER;
  const canImportUsers =
    UserRole === roles.ADMIN || UserRole === roles.PROJECT_MANAGER;

  // --- Import Users state ---
  const queryClient = useQueryClient();
  const [previewData, setPreviewData] = useState<ExcelPreviewData | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const { isUploading: isImportUploading, uploadFile: importUploadFile } =
    useImportUsers();

  const handleExportCSV = () => {
    const payload = Object.fromEntries(
      Object.entries({
        ...apiParams,
        ...(isNewJoinee ? { is_joining: false } : { is_joining: true }),
      }).filter(
        ([, value]) => value !== "" && value !== null && value !== undefined
      )
    );

    exportCSV(payload, {
      onSuccess: (response: any) => {
        const fileBlob = response?.blob;
        const filename =
          response?.filename ||
          `users_export_${new Date().toISOString().split("T")[0]}.xlsx`;

        if (fileBlob) {
          const fileUrl = URL.createObjectURL(fileBlob);
          const link = document.createElement("a");
          link.href = fileUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(fileUrl);
          toast.success("CSV export generated successfully");
        } else {
          console.error("No file URL found in response:", response);
          toast.error("Failed to generate CSV file");
        }
      },
      onError: (error: Error) => {
        console.error("CSV export failed:", error);
        toast.error(error.message || "Failed to generate CSV file");
      },
    });
  };

  // --- Import Users handlers ---
  const handleImportFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid Excel or CSV file.");
      event.target.value = "";
      return;
    }
    setIsParsingFile(true);
    setSelectedFile(file);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const workbook = new ExcelJS.Workbook();
          if (file.name.endsWith(".csv")) {
            await workbook.csv.read(new Response(arrayBuffer).body! as any);
          } else {
            await workbook.xlsx.load(arrayBuffer);
          }
          const worksheet = workbook.worksheets[0];
          if (!worksheet) throw new Error("No worksheet found");
          const jsonData: any[][] = [];
          worksheet.eachRow({ includeEmpty: true }, (row: ExcelJS.Row) => {
            const values = Array.isArray(row.values) ? row.values.slice(1) : [];
            const cleanValues = values.map((v: any) => {
              if (v && typeof v === "object" && "richText" in v)
                return v.richText.map((t: any) => t.text).join("");
              if (v && typeof v === "object" && "result" in v) return v.result;
              return v;
            });
            jsonData.push(cleanValues);
          });
          if (jsonData.length > 0) {
            const headers = jsonData[0].map((h) => String(h || ""));
            const rows = jsonData.slice(1);
            setPreviewData({ headers, rows });
            setPreviewOpen(true);
          } else {
            toast.error("No data found in the Excel file.");
          }
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          toast.error("Please check the file format.");
        } finally {
          setIsParsingFile(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error reading file:", error);
      setIsParsingFile(false);
    }
    event.target.value = "";
  };

  const handleImportPreviewConfirm = async () => {
    if (!selectedFile) return;
    const response = await importUploadFile(selectedFile);
    if (response?.statusCode === 200 || response?.statusCode === 201) {
      queryClient.invalidateQueries({ queryKey: [API.users.list] });
    }
    setPreviewOpen(false);
    setPreviewData(null);
    setSelectedFile(null);
  };

  const { data: technologyList, isPending: technologyListLoading }: any =
    useGetTechnologyDropdownList();

  const { data: roleList, isPending: roleListLoading }: any =
    useGetUsersRoles();

  const totalCount = (listData as any)?.metadata?.totalCount;

  const handleSearch = (search: string | undefined) => {
    setQueryParams({ ...listParams, search: search ?? "", currentPage: 1 });
  };

  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setQueryParams({
      ...listParams,
      pageSize: newPagination.pageSize,
      currentPage: newPagination.pageIndex + 1,
    });
  };

  const handleTechnologyChange = (value: any) => {
    setQueryParams({
      ...listParams,
      technologyId: value ?? null,
      currentPage: 1,
    });
  };

  const handleRoleChange = (value: any) => {
    setQueryParams({
      ...listParams,
      role: value ?? null,
      currentPage: 1,
    });
  };
  const handleStatusChange = (value: any) => {
    setQueryParams({
      ...listParams,
      status: value ?? null,
      currentPage: 1,
    });
  };

  const filters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search by name ...",
      key: "search",
      value: listParams.search,
      onChange: handleSearch,
    },
    {
      type: "select",
      key: "role",
      placeholder: "Filter by Role",
      options: roleList?.data?.map((role: any) => ({
        value: role,
        label: roleLabels[role]
          ? roleLabels[role]
          : role
              .split("_")
              .map((word: string) => word[0].toUpperCase() + word.slice(1))
              .join(" "),
      })),
      value: listParams.role,
      onChange: handleRoleChange,
      isLoading: roleListLoading,
    },
    {
      type: "select",
      key: "technologyId",
      placeholder: "Filter by Technology",
      options: technologyList?.data?.map((technology: any) => {
        return { value: technology.id, label: technology.name };
      }),
      value: listParams.technologyId, // 👈 pre-selects if set
      onChange: handleTechnologyChange,
      isLoading: technologyListLoading,
    },
    {
      type: "select",
      key: "status",
      placeholder: "Filter by Status",
      options: [
        {
          value: "active",
          label: "Active",
        },
        {
          value: "inactive",
          label: "Inactive",
        },
      ],
      value: listParams.status, // 👈 pre-selects if set
      onChange: handleStatusChange,
    },
  ];

  const handleAdd = () => {
    setOpen("add");
  };

  return (
    <PageLayout>
      <TablePageHeader
        title={`${isNewJoinee ? "New Joinee" : "Users"}`}
        buttonText="Add User"
        onButtonClick={handleAdd}
        actions={
          <div className="flex items-center gap-2">
            {canImportUsers && (
              <>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImportFileChange}
                  disabled={isImportUploading}
                  className="hidden"
                  id="user-import-file-input"
                />
                <Button
                  onClick={() =>
                    document.getElementById("user-import-file-input")?.click()
                  }
                  disabled={isImportUploading || isParsingFile}
                  // variant="outline"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  {isImportUploading || isParsingFile
                    ? "Importing..."
                    : "Import Users"}
                </Button>
              </>
            )}
            {canExportCSV && (
              <Button onClick={handleExportCSV} disabled={exportCSVLoading}>
                <Download className="w-4 h-4 mr-2" />
                {exportCSVLoading ? "Exporting CSV ..." : "Export CSV"}
              </Button>
            )}
          </div>
        }
        showActionButton={
          UserRole === roles.ADMIN || UserRole === roles.PROJECT_MANAGER
            ? true
            : false
        }
      >
        {isNewJoinee
          ? "Manage your New Joinee here."
          : "Manage your Users here"}
        .
      </TablePageHeader>
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("directory")}
            className={cn(
              "border-b-2 py-4 px-1 text-sm font-medium transition-all duration-200",
              activeTab === "directory"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            )}
          >
            Directory
          </button>
          {/* <button
            onClick={() => setActiveTab("org-chart")}
            className={cn(
              "border-b-2 py-4 px-1 text-sm font-medium transition-all duration-200",
              activeTab === "org-chart"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            )}
          >
            Org Chart
          </button> */}
        </nav>
      </div>

      {activeTab === "directory" ? (
        <>
          <GlobalFilterSection filters={filters ?? []} />
          <GlobalTable
            pageSize={listParams.pageSize}
            currentPage={listParams.currentPage}
            totalCount={totalCount ?? 0}
            data={(listData as any)?.data ?? []}
            onPaginationChange={handlePaginationChange}
            columns={columns}
            loading={loading}
            isPaginationEnabled
          />
        </>
      ) : (
        <OrgChart users={allActiveUsers} loading={allUsersLoading} />
      )}
      {open && (
        <ActionFormModal
          technologyList={technologyList}
          technologyListLoading={technologyListLoading}
          roleList={roleList}
          roleListLoading={roleListLoading}
        />
      )}
      <ViewUserModal />
      <ViewUserProfileModal />
      <ExcelImportPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        data={previewData}
        fileName={selectedFile?.name || ""}
        isLoading={isParsingFile}
        onConfirm={handleImportPreviewConfirm}
      />
    </PageLayout>
  );
};

export default UsersPage;
