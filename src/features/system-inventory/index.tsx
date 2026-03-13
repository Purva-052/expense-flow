/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";
import { ActionFormModal } from "./components/action";
import {
  buildSystemInventoryPayload,
  SystemInventoryActionForm,
} from "./components/action-form";
import { columns } from "./components/columns";
import {
  useCreateSystemInventoryData,
  useGetBrandDropdown,
  useGetHeadphoneBrandDropdown,
  useGetMonitorsizeDropdown,
  useGetProcessorDropdown,
  useGetRamDropdown,
  useGetStorageDropdown,
  useGetSystemInventoryData,
} from "./services";
import { useSystemInventoryStore } from "./stores/useSystemInventoryStore";
import { useGetUserDropdownList } from "../users/services";
import { normalizeSystemInventoryRecord } from "./components/helperFunction";
import { TSystemInventorySchema } from "./schema";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const extractDataArray = (response: unknown): unknown[] => {
  if (!isObject(response)) {
    return [];
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};

const extractInventoryRows = (response: unknown): any[] => {
  if (!isObject(response)) {
    return [];
  }

  const data = response.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (isObject(data) && Array.isArray(data.data)) {
    return data.data;
  }

  if (isObject(data)) {
    return [data];
  }

  return [];
};

const getInventoryOwnerId = (inventory: any) => {
  return (
    inventory?.userId ??
    inventory?.createdById ??
    inventory?.user?.id ??
    inventory?.createdBy?.id
  );
};

const SystemInventoryPage = () => {
  const { open } = useSystemInventoryStore();
  const user = useAuthStore((state) => state.user);

  const userRole = user?.user?.role ?? user?.role;
  const isAdmin = userRole === roles.ADMIN;

  const currentUserId = user?.user?.id ?? user?.user_id;

  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    // search: "",
    userId: undefined,
    ownershipType: undefined,
    processorId: undefined,
    storageId: undefined,
    ramId: undefined,
  });

  const adminListParams = useMemo(
    () => ({
      page: listParams.currentPage,
      limit: listParams.pageSize,
      userId: listParams.userId,
      ownershipType: listParams.ownershipType,
      processorId: listParams.processorId,
      storageId: listParams.storageId,
      ramId: listParams.ramId,
      // search: listParams.search,
      pagination: true,
    }),
    [listParams]
  );

  const ownListParams = useMemo(
    () => ({
      pagination: false,
      userId: currentUserId ?? undefined,
    }),
    [currentUserId]
  );

  const { data: processorDropdown, isPending: processorLoading } =
    useGetProcessorDropdown();
  const { data: ramDropdown, isPending: ramLoading } = useGetRamDropdown();
  const { data: storageDropdown, isPending: storageLoading } =
    useGetStorageDropdown();
  const { data: brandDropdown, isPending: brandLoading } =
    useGetBrandDropdown();
  const { data: headphoneBrandDropdown, isPending: headphoneBrandLoading } =
    useGetHeadphoneBrandDropdown();
  const { data: monitorSizeDropdown, isPending: monitorSizeLoading } =
    useGetMonitorsizeDropdown();

  const { data: adminListData, isPending: adminListLoading } =
    useGetSystemInventoryData(adminListParams, isAdmin);

  const { data: ownInventoryData, isPending: ownInventoryLoading } =
    useGetSystemInventoryData(ownListParams, !isAdmin);

  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateSystemInventoryData();

  const { data: usersList, isPending: usersListLoading }: any =
    useGetUserDropdownList({
      role: [
        roles.TEAM_LEAD,
        roles.ADMIN,
        roles.PROJECT_MANAGER,
        roles.DEVELOPER,
      ],
      status: "active",
    });

  const processorList = useMemo(
    () => extractDataArray(processorDropdown),
    [processorDropdown]
  );
  const ramList = useMemo(() => extractDataArray(ramDropdown), [ramDropdown]);
  const storageList = useMemo(
    () => extractDataArray(storageDropdown),
    [storageDropdown]
  );
  const brandList = useMemo(
    () => extractDataArray(brandDropdown),
    [brandDropdown]
  );
  const headphoneBrandList = useMemo(
    () => extractDataArray(headphoneBrandDropdown),
    [headphoneBrandDropdown]
  );
  const monitorSizeList = useMemo(
    () => extractDataArray(monitorSizeDropdown),
    [monitorSizeDropdown]
  );

  const dropdownLoading =
    processorLoading ||
    ramLoading ||
    storageLoading ||
    brandLoading ||
    headphoneBrandLoading ||
    monitorSizeLoading;

  const adminRows = useMemo(
    () => extractInventoryRows(adminListData),
    [adminListData]
  );

  const ownRows = useMemo(
    () => extractInventoryRows(ownInventoryData),
    [ownInventoryData]
  );

  const ownRecord = useMemo(() => {
    if (!ownRows.length) {
      return null;
    }

    const matchedRecord = ownRows.find(
      (inventory) =>
        String(getInventoryOwnerId(inventory) ?? "") === String(currentUserId)
    );

    return matchedRecord ?? ownRows[0];
  }, [currentUserId, ownRows]);

  const hasSubmitted = useMemo(() => {
    return Boolean(
      ownRecord?.id ??
        ownRecord?._id ??
        ownRecord?.inventoryId ??
        ownRecord?.uuid
    );
  }, [ownRecord]);

  const ownFormValues = useMemo(
    () => normalizeSystemInventoryRecord(ownRecord),
    [ownRecord]
  );

  const totalCount =
    (adminListData as any)?.metadata?.totalCount ?? adminRows.length;

  // const handleSearch = (search: string | undefined) => {
  //   setListParams((prev) => ({
  //     ...prev,
  //     search: search ?? "",
  //     currentPage: 1,
  //   }));
  // };

  // const handleStatusChange = (value: any) => {
  //   setListParams({
  //     ...listParams,
  //     ownershipType: value ?? undefined,
  //     currentPage: 1,
  //   });
  // };

  const handlePaginationChange = (pagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setListParams((prev) => ({
      ...prev,
      pageSize: pagination.pageSize,
      currentPage: pagination.pageIndex + 1,
    }));
  };

  const handleCreateInventory = (values: TSystemInventorySchema) => {
    createMutate(buildSystemInventoryPayload(values));
  };

  const adminFilters: FilterConfig[] = [
    // {
    //   type: "search",
    //   placeholder: "Search by employee name...",
    //   key: "search",
    //   value: listParams.search,
    //   onChange: handleSearch,
    // },
    {
      type: "select",
      key: "userId",
      placeholder: "Filter by Employee",
      options: usersList?.data?.map((user: any) => ({
        value: user.id,
        label: user.fullName,
      })),
      value: listParams.userId,
      onChange: (value: any) => {
        setListParams({
          ...listParams,
          userId: value ?? undefined,
          currentPage: 1,
        });
      },
      isLoading: usersListLoading,
    },
    {
      type: "select",
      key: "processorId",
      placeholder: "Filter by Processor",
      options: processorList?.map((p: any) => ({
        value: p.id,
        label: p.name,
      })),
      value: listParams.processorId,
      onChange: (value: any) => {
        setListParams({
          ...listParams,
          processorId: value ?? undefined,
          currentPage: 1,
        });
      },
      isLoading: processorLoading,
    },
    {
      type: "select",
      key: "storageId",
      placeholder: "Filter by Storage",
      options: storageList?.map((s: any) => ({
        value: s.id,
        label: s.name,
      })),
      value: listParams.storageId,
      onChange: (value: any) => {
        setListParams({
          ...listParams,
          storageId: value ?? undefined,
          currentPage: 1,
        });
      },
      isLoading: storageLoading,
    },
    {
      type: "select",
      key: "ramId",
      placeholder: "Filter by Ram Size",
      options: ramList?.map((r: any) => ({
        value: r.id,
        label: r.name,
      })),
      value: listParams.ramId,
      onChange: (value: any) => {
        setListParams({
          ...listParams,
          ramId: value ?? undefined,
          currentPage: 1,
        });
      },
      isLoading: ramList,
    },
    // {
    //   type: "select",
    //   key: "ownershipType",
    //   placeholder: "Filter by Ownership Type",
    //   options: [
    //     {
    //       value: "company_owned",
    //       label: "Company Owned",
    //     },
    //     {
    //       value: "personal",
    //       label: "Personal",
    //     },
    //   ],
    //   value: listParams.ownershipType, // 👈 pre-selects if set
    //   onChange: handleStatusChange,
    // },
  ];

  if (isAdmin) {
    return (
      <PageLayout>
        <TablePageHeader title="System Inventory" showActionButton={false}>
          Review submitted inventory and edit details from the actions column.
        </TablePageHeader>

        <GlobalFilterSection filters={adminFilters} />

        <GlobalTable
          pageSize={listParams.pageSize}
          currentPage={listParams.currentPage}
          totalCount={totalCount}
          data={adminRows}
          onPaginationChange={handlePaginationChange}
          columns={columns}
          loading={adminListLoading}
          isPaginationEnabled
        />

        {open && (
          <ActionFormModal
            processorList={processorList}
            ramList={ramList}
            storageList={storageList}
            brandList={brandList}
            headphoneBrandList={headphoneBrandList}
            monitorSizeList={monitorSizeList}
            dropdownLoading={dropdownLoading}
            isAdmin={isAdmin}
          />
        )}
      </PageLayout>
    );
  }

  const showReadonlyMessage = hasSubmitted;

  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl">
        <TablePageHeader title="System Inventory" showActionButton={false}>
          Submit your inventory details. Once submitted, only admin can edit
          them.
        </TablePageHeader>

        {showReadonlyMessage && (
          <div className="mt-4 rounded-md border border-[#f0d69d] bg-[#fff8e8] px-3 py-2 text-sm text-[#8c6200]">
            Your inventory has already been submitted and is now locked. Contact
            admin for any changes.
          </div>
        )}

        <div className="mt-5 rounded-md border border-[#dddddd] bg-[#fdfdfd] p-4">
          <SystemInventoryActionForm
            formId="system-inventory-user-form"
            initialValues={ownFormValues}
            onSubmit={handleCreateInventory}
            loading={isCreateLoading}
            disabled={hasSubmitted || ownInventoryLoading}
            hideSubmitButton={hasSubmitted}
            submitLabel="Submit Inventory"
            processorList={processorList}
            ramList={ramList}
            storageList={storageList}
            brandList={brandList}
            headphoneBrandList={headphoneBrandList}
            monitorSizeList={monitorSizeList}
            dropdownLoading={dropdownLoading}
            isAdmin={isAdmin}
          />

          {ownInventoryLoading && (
            <p className="mt-3 text-xs text-muted-foreground">
              Loading your previously submitted inventory...
            </p>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default SystemInventoryPage;
