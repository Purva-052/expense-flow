/* eslint-disable @typescript-eslint/no-explicit-any */
import { MoreHorizontal } from "lucide-react";
// ASSUMED IMPORTS for shadcn/ui components
// Replace with your actual import paths
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TooltipProvider } from "@/components/ui/tooltip";

const getTypeBadgeClasses = (serverType: string) => {
  switch (serverType?.toLowerCase()) {
    case "frontend":
      return "bg-indigo-100 text-indigo-800";
    case "backend":
      return "bg-teal-100 text-teal-800";
    case "database":
      return "bg-amber-100 text-amber-800";
    case "devops":
      return "bg-slate-100 text-slate-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const ServerDetailsCard = ({
  server,
  setOpenProjectServerModal,
  setProjectServerCurrentRow,
}: any) => {
  const isActive = server?.status === "ACTIVE";

  // The delete handler now logs the server details to the console
  const handleConfirmDelete = () => {
    setProjectServerCurrentRow(server);
    setOpenProjectServerModal("delete");
  };
  const handleEdit = () => {
    setProjectServerCurrentRow(server);
    setOpenProjectServerModal("edit");
  };

  return (
    <TooltipProvider>
      <div
        className={`group relative bg-white shadow-md rounded-lg p-6 border-l-4 ${
          isActive ? "border-green-500" : "border-red-500"
        }`}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className={`flex justify-between items-center gap-2`}>
            <span className="font-medium">URL:</span>
            {server?.url ? (
              <span className="font-mono text-sm">
                <a
                  href={server?.url}
                  target="_blank"
                  className="text-blue-500 underline truncate max-w-[200px] cursor-pointer block"
                  title={server?.url}
                  rel="noopener noreferrer"
                >
                  {server?.url}
                </a>
              </span>
            ) : (
              "-"
            )}
          </div>

          <div className="flex items-center gap-2">
            <div title={server?.status}>
              <span
                className={`px-2 py-1 text-xs font-bold leading-none rounded-full ${
                  isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {server?.status}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="  bg-gray-50">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleEdit}>
                  Edit Server
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:bg-red-50 focus:text-red-600"
                  onClick={handleConfirmDelete}
                >
                  Delete Server
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-2 text-gray-600">
          <div className="flex justify-between items-center">
            <span className="font-medium">Type:</span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded ${getTypeBadgeClasses(
                server?.type
              )}`}
            >
              {server?.type}
            </span>
          </div>
          <div className={`flex justify-between items-center gap-2`}>
            <span className="font-medium">Server:</span>
            {server?.server?.ip ? (
              <h3 className="text-xl font-semibold text-gray-800 break-all pr-4">
                {server?.server?.ip}
              </h3>
            ) : (
              "-"
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ServerDetailsCard;
