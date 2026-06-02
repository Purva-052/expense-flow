/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClientNDAStore } from "../stores/useClientNDA";

export const columns = (
  handleSend: (row: any) => void,
  handleDownload: (row: any) => void,
  handlePreview: (row: any) => void,
  handleDelete: (row: any) => void
): ColumnDef<any>[] => [
  {
    accessorKey: "clientName",
    header: "Client Name",
  },
  {
    accessorKey: "clientEmail",
    header: "Client Email",
  },
  {
    accessorKey: "clientPhoneNumber",
    header: "Phone Number",
  },
  {
    accessorKey: "clientCountry",
    header: "Country",
    cell: function Cell({ row }) {
      const country = row.original.clientCountry;
      return country ? <Badge variant="default">{country}</Badge> : "-";
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: function Cell({ row }) {
      const status = row.original.status || "pending";
      let colorClass = "";

      switch (status.toLowerCase()) {
        case "signed":
          colorClass =
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
          break;
        case "sent":
          colorClass =
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
          break;
        case "rejected":
          colorClass =
            "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
          break;
        case "draft":
          colorClass =
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
          break;
        default:
          colorClass =
            "bg-blue-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      }

      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${colorClass}`}
        >
          {status}
        </span>
      );
    },
  },
  // {
  //   accessorKey: "sentAt",
  //   header: "Sent At",
  //   cell: function Cell({ row }) {
  //     const date = row.original.sentAt;
  //     return date ? getFormattedDate(new Date(date)) : "-";
  //   },
  // },
  // {
  //   accessorKey: "signedAt",
  //   header: "Signed At",
  //   cell: function Cell({ row }) {
  //     const date = row.original.signedAt;
  //     return date ? getFormattedDate(new Date(date)) : "-";
  //   },
  // },
  {
    id: "actions",
    header: "Actions",
    cell: function Cell({ row }) {
      const nda = row.original;
      const { setOpen, setCurrentRow } = useClientNDAStore();

      const triggerPreview = () => {
        setCurrentRow(nda);
        setOpen("preview");
        handlePreview(nda);
      };

      const triggerEdit = () => {
        setCurrentRow(nda);
        setOpen("edit");
      };

      const triggerSend = () => {
        handleSend(nda);
      };

      const triggerDownload = () => {
        handleDownload(nda);
      };

      const triggerDelete = () => {
        setCurrentRow(nda);
        setOpen("delete");
        handleDelete(nda);
      };

      const isSigned = nda.status?.toLowerCase() === "signed";
      const isDraft = nda.status?.toLowerCase() === "draft";

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
            {/* <DropdownMenuSeparator /> */}

            <DropdownMenuItem onClick={triggerPreview}>
              {/* <FileText className="w-4 h-4 mr-2" /> */}
              Preview NDA
            </DropdownMenuItem>

            <DropdownMenuItem onClick={triggerEdit}>
              {/* <FileText className="w-4 h-4 mr-2" /> */}
              Edit NDA
            </DropdownMenuItem>

            {isDraft && (
              <DropdownMenuItem onClick={triggerSend}>
                {/* <Send className="w-4 h-4 mr-2" /> */}
                Send Signing Link
              </DropdownMenuItem>
            )}

            {isSigned && (
              <DropdownMenuItem onClick={triggerDownload}>
                {/* <Download className="w-4 h-4 mr-2" /> */}
                Download Signed
              </DropdownMenuItem>
            )}

            {/* <DropdownMenuSeparator /> */}
            <DropdownMenuItem
              className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/20"
              onClick={triggerDelete}
            >
              {/* <Trash className="w-4 h-4 mr-2" /> */}
              Delete Record
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
  },
];
