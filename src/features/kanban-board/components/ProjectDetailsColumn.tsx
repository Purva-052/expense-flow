/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";

export const ProjectDetailsColumn: ColumnDef<any>[] = [
  {
    accessorKey: "developerName",
    header: " Name",
  },
  {
    accessorKey: "developerEmail",
    header: " Email",
  },
  {
    accessorKey: "technology.name",
    header: "Technology",
  },
  {
    accessorKey: "allocationstartDate",
    header: "Start Date",
    cell: ({ row }) => {
      const date = row.original.allocationstartDate;
      return date ? new Date(date).toLocaleDateString() : "-";
    },
  },
  {
    accessorKey: "allocationendDate",
    header: "End Date",
    cell: ({ row }) => {
      const date = row.original.allocationendDate;
      return date ? new Date(date).toLocaleDateString() : "-";
    },
  },
];
