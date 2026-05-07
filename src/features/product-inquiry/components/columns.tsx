/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { PRODUCT_INQUIRY_STATUS_LABEL } from "@/utils/constant";
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
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
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
    accessorKey: "numberOfUsers",
    header: "Users",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original?.status;
      const label = PRODUCT_INQUIRY_STATUS_LABEL[status] || status;
      return (
        <Badge variant="outline" className="capitalize">
          {label}
        </Badge>
      );
    },
  },
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
              Add Comment
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
