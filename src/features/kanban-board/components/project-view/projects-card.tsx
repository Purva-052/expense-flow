"use client";

import { MoreVertical, Calendar, CheckSquare, BarChart3 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { CommonModal } from "@/components/common-modal";
import { ProjectDetails } from "./project-details";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface ProjectCardProps {
  id: string;
  title: string;

  status: "Planning" | "In Progress" | "Completed" | "On Hold";
  statusColor: "blue" | "yellow" | "green" | "gray";
  borderColor: "yellow" | "blue" | "green" | "purple" | "orange";
  deadline: string;
  progress: number;
  teamMembers: Array<{
    name: string;
    avatar: string;
  }>;
  tasks: number;
  activities: number;
  client: string;
  ProjectCoordinator: string;
  startDate: string;
  priority: "High" | "Medium" | "Low";
  priorityColor: "red" | "yellow" | "green";
}

const borderColorMap = {
  yellow: "border-l-yellow-400",
  blue: "border-l-blue-500",
  green: "border-l-green-500",
  purple: "border-l-purple-500",
  orange: "border-l-orange-500",
};

const statusColorMap = {
  blue: "bg-blue-100 text-blue-700",
  yellow: "bg-yellow-100 text-yellow-700",
  green: "bg-green-100 text-green-700",
  gray: "bg-gray-100 text-gray-700",
};

const priorityColorMap = {
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-700",
  green: "bg-green-100 text-green-700",
};

export function ProjectCard({
  id,
  title,
  status,
  statusColor,
  deadline,
  progress,
  teamMembers,

  client,
  ProjectCoordinator,
  startDate,
  priority,
  priorityColor,
}: ProjectCardProps) {
  const [openDrawer, setOpenDrawer] = useState(true);

  return (
    <div
      className={`bg-white border-l-4 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-l-orange-500`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${statusColorMap[statusColor]}`}
          >
            {status}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setOpenDrawer(true)}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>View Timeline</DropdownMenuItem>
                <DropdownMenuItem>Change Status</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Deadline and Progress */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">Deadline: {deadline}</span>
        </div>
        <span className="text-sm font-semibold text-gray-900">{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className={`h-2 rounded-full transition-all bg-[#E80339]`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Team and Activities */}
      <div className="flex -space-x-2">
        {teamMembers.map((member, idx) => (
          <TooltipProvider key={idx}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-10 w-10 border-2 border-white cursor-pointer">
                  <AvatarImage
                    src={member.avatar || "/placeholder.svg"}
                    alt={member.name}
                  />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm font-medium">{member.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-3 gap-4 border-t border-gray-200 pt-4 mt-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Client
          </p>
          <p className="text-sm font-semibold text-gray-900">{client}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Start Date
          </p>
          <p className="text-sm font-semibold text-gray-900">{startDate}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Priority
          </p>
          <span
            className={`inline-block px-2 py-1 rounded text-xs font-medium ${priorityColorMap[priorityColor]}`}
          >
            {priority}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4  pt-4 mt-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Project Coordinator
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {ProjectCoordinator}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Total Milestone
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {ProjectCoordinator}
          </p>
        </div>
      </div>

      <Drawer open={openDrawer} onOpenChange={setOpenDrawer} direction="right">
        <ProjectDetails />
      </Drawer>
    </div>
  );
}
