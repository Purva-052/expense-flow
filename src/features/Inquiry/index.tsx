/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import PageLayout from "@/components/layout/layout-provider";
import SimpleDropDownSearchable from "@/components/shared/custome-simple-dropdown";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/stores/use-auth-store";
import { INQUIRY_STATUS, roles } from "@/utils/constant";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod"; // Import zod
import { ActionFormModal } from "./components/action";
import { HistoryProjectModal } from "./components/history-modal";
import { ViewInquiryModal } from "./components/view-model";
import { useCreateInquiryStatus, useGetInquiry } from "./services";
import { useInquiryStore } from "./stores/useInquiryStore";
import { useGetUserDropdownList } from "../users/services";
import { useGetInquiryCategoryDropdown } from "../inquiry-channels/services";
import { useGetInquiryDropdownList } from "../inquiry-types/services";

const InquiryPage = () => {
  const { open, setOpen } = useInquiryStore();
  const user = useAuthStore((state) => state.user);
  const userRole = user?.user?.role;
  const [activeTab, setActiveTab] = useState("active");

  const { mutateAsync: InquiryStatusChange } = useCreateInquiryStatus();
  const { data: usersList, isPending: usersListLoading }: any =
    useGetUserDropdownList({
      role: [roles.BDE],
      status: "active",
    });
  const { data: channelList, isPending: loadingChannel }: any =
    useGetInquiryCategoryDropdown();

  const { data: inquirytypeList, isPending: loadingInquiryType }: any =
    useGetInquiryDropdownList();

  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: "",
    salesPersonId: undefined,
    inquiryTypeId: undefined,
    inquirySourceId: undefined,
  });

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    pagination: true,
    status: activeTab,
    salesPersonId: listParams.salesPersonId,
    inquiryTypeId: listParams.inquiryTypeId,
    inquirySourceId: listParams.inquirySourceId,
  };

  const tabTriggerClass =
    "flex items-center gap-2 rounded-[50px] px-3 py-2  transition-all " +
    "data-[state=active]:bg-black data-[state=active]:text-white";

  const { data: listData, isPending: loading } = useGetInquiry(apiParams);

  const totalCount = (listData as any)?.metadata?.totalCount;

  const handleSearch = (search: string | undefined) => {
    setListParams({ ...listParams, search: search ?? "", currentPage: 1 });
  };

  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setListParams({
      ...listParams,
      pageSize: newPagination.pageSize,
      currentPage: newPagination.pageIndex + 1,
    });
  };

  const filters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search by client name ...",
      key: "search",
      value: listParams.search,
      onChange: handleSearch,
    },
    {
      type: "select",
      key: "salesPersonId",
      placeholder: "Filter by Sales Person",
      options: usersList?.data?.map((user: any) => ({
        value: user.id,
        label: user.fullName,
      })),
      value: listParams.salesPersonId,
      onChange: (value: any) => {
        setListParams({
          ...listParams,
          salesPersonId: value ?? undefined,
          currentPage: 1,
        });
      },
      isLoading: usersListLoading,
    },
    {
      type: "select",
      key: "inquiryTypeId",
      placeholder: "Filter by Type",
      options: inquirytypeList?.data?.map((p: any) => ({
        value: p.id,
        label: p.name,
      })),
      value: listParams.inquiryTypeId,
      onChange: (value: any) => {
        setListParams({
          ...listParams,
          inquiryTypeId: value ?? undefined,
          currentPage: 1,
        });
      },
      isLoading: loadingInquiryType,
    },
    {
      type: "select",
      key: "inquirySourceId",
      placeholder: "Filter by Channel",
      options: channelList?.data?.map((iq: any) => ({
        value: iq.id,
        label: iq.name,
      })),
      value: listParams.inquirySourceId,
      onChange: (value: any) => {
        setListParams({
          ...listParams,
          inquirySourceId: value ?? undefined,
          currentPage: 1,
        });
      },
      isLoading: loadingChannel,
    },
  ];

  const handleAdd = () => {
    setOpen("add");
  };

  const statusUpdateSchema = z.object({
    notes: z.string().trim().min(1, { message: "Notes is required." }),
  });

  // Modal component with validation
  const StatusUpdateModal = ({
    isOpen,
    onClose,
    onSubmit,
    newStatusLabel,
    form,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (notes: string) => void;
    newStatusLabel: string;
    form: any;
  }) => {
    const handleFormSubmit = (data: z.infer<typeof statusUpdateSchema>) => {
      onSubmit(data.notes);
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)}>
              <DialogHeader>
                <DialogTitle>Update Status to "{newStatusLabel}"</DialogTitle>
              </DialogHeader>

              <div className="flex flex-col justify-center gap-4 my-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="notes">
                        Notes<span className="text-red-500">*</span>
                      </Label>
                      <FormControl>
                        <Textarea
                          id="notes"
                          placeholder="Add your notes here..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Update Status</Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    );
  };

  const StatusCell = ({ row }: any) => {
    const inquiry = row.original;
    const currentStatus = inquiry?.status;

    const [selectedValue, setSelectedValue] = useState(currentStatus);

    const formStatusNotes = useForm<z.infer<typeof statusUpdateSchema>>({
      resolver: zodResolver(statusUpdateSchema),
      defaultValues: { notes: "" },
    });

    const { user } = useAuthStore();
    const userRole = user?.user?.role;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);
    const statusOptions = [
      { value: INQUIRY_STATUS.NEW_INQUIRY, label: "New Inquiry" },
      { value: INQUIRY_STATUS.IN_DISCUSSION, label: "In Discussion" },
      { value: INQUIRY_STATUS.NEAR_TO_CLOSE, label: "Near to Close" },
      { value: INQUIRY_STATUS.CLOSED, label: "Closed" },
      { value: INQUIRY_STATUS.OPTED_OUT, label: "Opted Out" },
    ];

    // --- REFACTORED HANDLERS ---
    const handleChange = (value: string) => {
      if (value === currentStatus) return;

      // 1. Immediately update the UI to give the user feedback.
      // setSelectedValue(value);
      setPendingStatus(value);
      setIsModalOpen(true);
      formStatusNotes.reset({ notes: "" });
    };

    const handleModalClose = () => {
      setIsModalOpen(false);
      formStatusNotes.reset({ notes: "" });
      setPendingStatus(null);
      setSelectedValue(currentStatus);
    };

    const handleModalSubmit = async (notes: string) => {
      if (!pendingStatus) return;

      try {
        await InquiryStatusChange({
          projectLeadId: inquiry.id,
          status: pendingStatus,
          effectiveDate: new Date().toISOString(),
          notes: notes,
        });
      } catch (e: any) {
        setSelectedValue(currentStatus);
      } finally {
        setIsModalOpen(false);
        setPendingStatus(null);
      }
    };

    // --- RENDER LOGIC (with changes to the dropdown) ---
    const canEditStatus = userRole === roles.BDE || userRole === roles.ADMIN;

    useEffect(() => {
      if (currentStatus === selectedValue) return;
      setSelectedValue(currentStatus);
    }, [currentStatus]);

    if (!currentStatus) {
      return <div className="text-muted-foreground text-sm italic">-</div>;
    }

    return (
      <>
        <div className="w-[180px]">
          {canEditStatus ? (
            <SimpleDropDownSearchable
              value={selectedValue}
              onChange={handleChange}
              options={statusOptions}
              placeholder="Select Status"
              allowClear={false}
            />
          ) : (
            <div className="text-sm text-muted-foreground">
              <span>
                {statusOptions.find((s) => s.value === currentStatus)?.label ||
                  ""}
              </span>
            </div>
          )}
        </div>
        <StatusUpdateModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          newStatusLabel={
            statusOptions.find((s) => s.value === pendingStatus)?.label || ""
          }
          form={formStatusNotes} // Modal still uses its form
        />
      </>
    );
  };

  const inquiryTypeColors: Record<string, string> = {
    hot: "bg-red-100 text-red-700 border-red-200",
    warm: "bg-orange-100 text-orange-700 border-orange-200",
    cold: "bg-blue-100 text-blue-700 border-blue-200",
  };

  const inquiryChannelColors: Record<string, string> = {
    inbound: "bg-green-100 text-green-700 border-green-200",
    outbound: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "clientName",
      header: "Client Name",
    },
    // {
    //   accessorKey: "clientCompanyName",
    //   header: "Client Company",
    //   cell: ({ row }) => {
    //     const clientCompany =
    //       row.original?.clientCompanyName &&
    //       row.original?.clientCompanyName?.trim() !== ""
    //         ? row.original?.clientCompanyName
    //         : "-";
    //     return <span className="capitalize">{clientCompany}</span>;
    //   },
    // },
    // {
    //   accessorKey: "country.name",
    //   header: "Country",
    //   cell: ({ row }) => {
    //     const country = row.original?.country?.name ?? "-";
    //     return <span className="capitalize">{country}</span>;
    //   },
    // },
    {
      accessorKey: "inquiryDate",
      header: "Inquiry Date",
      // cell: ({ row }) => {
      //   const inquiryDate = row.original?.inquiryDate ?? "-";
      //   return <span className="capitalize">{inquiryDate}</span>;
      // },
      cell: ({ row }) => {
        const inquiryDate = row.original?.inquiryDate ?? "-";
        if (!inquiryDate) return <span className="text-sm">-</span>;

        const date = new Date(inquiryDate);
        return (
          <span className="text-sm">
            {date.toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        );
      },
    },
    {
      accessorKey: "generatedByUser",
      header: "Created By",
      cell: ({ row }) => {
        const createdBy = row.original?.generatedByUser?.fullName ?? "-";
        return <span className="capitalize">{createdBy}</span>;
      },
    },
    {
      accessorKey: "salesPerson.fullName",
      header: "Sales Person",
      cell: ({ row }) => {
        const createdBy = row.original?.salesPerson.fullName ?? "-";
        return <span className="capitalize">{createdBy}</span>;
      },
    },
    {
      accessorKey: "inquiryType.name",
      header: "Inquiry Type",
      cell: ({ row }) => {
        const type = row.original?.inquiryType?.name ?? "-";

        const color =
          inquiryTypeColors[type?.toLowerCase()] ??
          "bg-gray-100 text-gray-700 border-gray-200";

        return <Badge className={`border ${color}`}>{type}</Badge>;
      },
    },
    {
      accessorKey: "inquirySource.name",
      header: "Inquiry Channel",
      cell: ({ row }) => {
        const channel = row.original?.inquirySource?.name ?? "-";

        const color =
          inquiryChannelColors[channel?.toLowerCase()] ??
          "bg-gray-100 text-gray-700 border-gray-200";

        return <Badge className={`border ${color}`}>{channel}</Badge>;
      },
    },
    {
      accessorKey: "modules",
      header: "Inquiry Requirement",
      cell: ({ row }) => {
        const modules = row.original?.modules ?? [];
        if (!modules || modules.length === 0) return "-";
        return (
          <span className="capitalize text-gray-500 flex flex-wrap gap-2">
            {modules?.map((m: any) => {
              return (
                <Badge variant="secondary" className="border border-gray-300">
                  {m?.name}
                </Badge>
              );
            })}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: StatusCell,
    },
    {
      id: "actions",
      header: "Actions",
      cell: function Cell({ row }) {
        const inquiry = row.original;
        const { setOpen, setCurrentRow } = useInquiryStore();
        const user = useAuthStore((state) => state.user);
        const userRole = user?.user?.role;

        const handleEdit = () => {
          setOpen("edit");
          setCurrentRow(inquiry);
        };

        const handleDelete = () => {
          setOpen("delete");
          setCurrentRow(inquiry);
        };

        const handleView = () => {
          setOpen("view");
          setCurrentRow(inquiry);
        };
        const handleViewHistory = () => {
          setOpen("history");

          setCurrentRow(inquiry);
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleView}>
                View Inquiry
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleViewHistory}>
                View history
              </DropdownMenuItem>
              {(userRole === roles.BDE || userRole === roles.ADMIN) && (
                <>
                  <DropdownMenuItem onClick={handleEdit}>
                    Edit Inquiry
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 focus:bg-red-50 focus:text-red-600"
                    onClick={handleDelete}
                  >
                    Delete Inquiry
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
    },
  ];

  return (
    <PageLayout>
      <TablePageHeader
        title="Inquiry "
        buttonText="Add Inquiry "
        onButtonClick={handleAdd}
        showActionButton={
          userRole === roles.BDE || userRole === roles.ADMIN ? true : false
        }
      >
        Manage your Inquiry here.
      </TablePageHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <GlobalFilterSection
          filters={filters ?? []}
          extraItemShow={true}
          className={"!my-2 flex flex-wrap gap-2"}
          extraItem={
            <TabsList className="bg-[#fdebef] rounded-full">
              <TabsTrigger value="active" className={tabTriggerClass}>
                Active Inquiries
              </TabsTrigger>
              <TabsTrigger value="inactive" className={tabTriggerClass}>
                Archive Inquiries
              </TabsTrigger>
            </TabsList>
          }
        />
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
      </Tabs>
      {open && <ActionFormModal />}
      <ViewInquiryModal />
      <HistoryProjectModal />
    </PageLayout>
  );
};

export default InquiryPage;
