/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { LinodeInstance } from "../types";

export const columns: ColumnDef<LinodeInstance>[] = [
  {
    accessorKey: "label",
    header: "Server Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.label}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const getVariant = () => {
        switch (status) {
          case "running":
            return "success";
          case "offline":
          case "stopped":
            return "destructive";
          case "booting":
          case "provisioning":
            return "secondary";
          default:
            return "outline";
        }
      };
      return (
        <Badge variant={getVariant()} className="capitalize">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  // {
  //   accessorKey: "region",
  //   header: "Region",
  //   cell: ({ row }) => <span className="uppercase">{row.original.region}</span>,
  // },
  {
    accessorKey: "ipv4",
    header: "IPv4 Address",
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.original.ipv4 && row.original.ipv4.length > 0
          ? row.original.ipv4[0]
          : "-"}
      </span>
    ),
  },
  // {
  //   accessorKey: "specs",
  //   header: "Specs",
  //   cell: ({ row }) => {
  //     const specs = row.original.specs;
  //     return (
  //       <div className="text-sm space-y-0.5">
  //         <div className="flex items-center gap-2">
  //           <span className="text-muted-foreground">CPU:</span>
  //           <span className="font-medium">{specs.vcpus} vCPUs</span>
  //         </div>
  //         <div className="flex items-center gap-2">
  //           <span className="text-muted-foreground">RAM:</span>
  //           <span className="font-medium">{specs.memory / 1024} GB</span>
  //         </div>
  //         <div className="flex items-center gap-2">
  //           <span className="text-muted-foreground">Disk:</span>
  //           <span className="font-medium">{specs.disk / 1024} GB</span>
  //         </div>
  //       </div>
  //     );
  //   },
  // },
  {
    accessorKey: "monthlyCost",
    header: "Monthly Cost",
    cell: ({ row }) => (
      <span className="font-semibold text-green-600">
        ${row.original.monthlyCost?.toFixed(2) ?? "0.00"}
      </span>
    ),
  },
  {
    accessorKey: "backups.enabled",
    header: "Backups",
    cell: ({ row }) => {
      const backupsEnabled = row.original.backups.enabled;
      return backupsEnabled ? (
        <Badge variant="success">Enabled</Badge>
      ) : (
        <Badge variant="destructive">Disabled</Badge>
      );
    },
  },
  {
    accessorKey: "backups.last_successful",
    header: "Last Backup",
    cell: ({ row }) => {
      const lastBackup = row.original.backups.last_successful;
      if (!lastBackup) {
        return <span className="text-sm">-</span>;
      }
      const date = new Date(lastBackup);
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
    accessorKey: "created",
    header: "Created Date",
    cell: ({ row }) => {
      const date = new Date(row.original.created);
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
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const navigate = useNavigate();
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            navigate({
              to: "/linode-server-dashboard/detail/$id",
              params: { id: row.original.id.toString() },
            })
          }
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          View
        </Button>
      );
    },
  },
];
