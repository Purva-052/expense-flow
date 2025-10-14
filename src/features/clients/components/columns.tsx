/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClientsStore } from "../stores/useClientsStore";


// Small component for actions
function CouponActions({ coupon }: any) {
  const { setOpen, setCurrentRow } = useClientsStore();

  const handleEdit = () => {
    setOpen("edit");
    setCurrentRow(coupon);
  };

  const handleDelete = () => {
    setOpen("delete");
    setCurrentRow(coupon);
  };

  const handleView = () => {
    setOpen("view");
    setCurrentRow(coupon);
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
        <DropdownMenuItem onClick={handleView}>View Coupons</DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>Edit Coupons</DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600 focus:bg-red-50 focus:text-red-600"
          onClick={handleDelete}
        >
          Delete Coupons
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "venue.name",
    header: "Venue Name",
  },
  {
    accessorKey: "code",
    header: "Coupon Code",
  },
  {
    accessorKey: "description",
    header: "Coupon Description",
  },
  {
    accessorKey: "discountPercentage",
    header: "Discount (%)",
  },
  {
    accessorKey: "maxDiscountAmount",
    header: "Max Discount",
  },
  {
    accessorKey: "minOrderAmount",
    header: "Min Order",
  },

  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.original.isActive ? "success" : "destructive"}
        className="text-sm font-medium"
      >
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <CouponActions coupon={row.original} />,
    enableSorting: false,
  },
];
