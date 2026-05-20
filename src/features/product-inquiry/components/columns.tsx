/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatProductInquiryStatusLabel } from "@/utils/constant";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useProductInquiryStore } from "../stores/useProductInquiry";

export const getColumns = (): ColumnDef<any>[] => [
  {
    accessorKey: "companyName",
    header: "Company Name",
    cell: ({ row }) => row.original?.companyName ?? "-",
  },
  {
    accessorKey: "contactPerson",
    header: "Contact Person",
    cell: ({ row }) =>
      row.original?.contactPerson?.fullName ??
      row.original?.contactPerson ??
      "-",
  },
  {
    accessorKey: "emailId",
    header: "Email ID",
    cell: ({ row }) => row.original?.emailId ?? "-",
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
    cell: ({ row }) => row.original?.phoneNumber ?? "-",
  },
  {
    id: "industry",
    accessorFn: (row) => row?.industry?.name ?? "-",
    header: "Industry",
    cell: ({ row }) => {
      const industryName = row.original?.industry?.name;
      if (!industryName) return "-";

      return (
        <Badge variant="secondary" className="rounded-full px-2.5 py-1">
          {industryName}
        </Badge>
      );
    },
  },
  {
    id: "product",
    header: "Product",
    accessorFn: (row) => row?.product?.name ?? "-",
    cell: ({ row }) => {
      const productName = row.original?.product?.name;
      if (!productName) return "-";

      return (
        <Badge variant="secondary" className="rounded-full px-2.5 py-1">
          {productName}
        </Badge>
      );
    },
  },
  {
    id: "demoDate",
    header: "Demo Date",
    cell: ({ row }) => {
      const date = row.original?.demoDate;
      if (!date) return "-";
      return new Date(date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    accessorKey: "inquiryDate",
    header: "Inquiry Date",
    cell: ({ row }) => {
      const date = row.original?.inquiryDate;
      if (!date) return "-";
      return new Date(date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    accessorKey: "numberOfUsers",
    header: "Number of Users",
    cell: ({ row }) => row.original?.numberOfUsers ?? "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original?.status;
      return (
        <Badge variant="outline" className="capitalize">
          {formatProductInquiryStatusLabel(status)}
        </Badge>
      );
    },
  },
  // {
  //   id: "reminder",
  //   header: "Reminder",
  //   cell: function Cell({ row }) {
  //     const inquiry = row.original;
  //     const { silencedInquiries, silenceInquiry } = useProductInquiryStore();

  //     if (!inquiry?.demoDate) return "-";

  //     const todayLocal = new Date();
  //     todayLocal.setHours(0, 0, 0, 0);
  //     const demoLocal = new Date(inquiry.demoDate);
  //     demoLocal.setHours(0, 0, 0, 0);
  //     const isDemoToday = todayLocal.getTime() === demoLocal.getTime();

  //     const isBlinkingEnabled = !silencedInquiries.includes(
  //       inquiry.id || inquiry._id
  //     );

  //     if (!isDemoToday) return "-";

  //     return (
  //       <Switch
  //         checked={isBlinkingEnabled}
  //         onCheckedChange={(checked) => {
  //           if (!checked) {
  //             silenceInquiry(inquiry.id || inquiry._id);
  //           }
  //         }}
  //         disabled={!isBlinkingEnabled}
  //         className="scale-75 data-[state=checked]:bg-red-500"
  //       />
  //     );
  //   },
  // },
  {
    id: "actions",
    header: "Actions",
    cell: function Cell({ row }) {
      const inquiry = row.original;
      const { setOpen, setCurrentRow } = useProductInquiryStore();

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

      const handleComment = () => {
        setOpen("comment");
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
            <DropdownMenuItem onClick={handleComment}>
              Comments
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleView}>
              View Inquiry
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit}>
              Edit Inquiry
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:bg-red-50 focus:text-red-600"
              onClick={handleDelete}
            >
              Delete Inquiry
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
