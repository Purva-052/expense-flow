/* eslint-disable @typescript-eslint/no-explicit-any */
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetHRPolicyList } from "@/features/hr-policy/services";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function HRPolicyDownloadButton() {
  const { data: listData } = useGetHRPolicyList();

  const fileUrl = (() => {
    if (!listData) return null;
    const anyData = listData as any;
    if (anyData.data) {
      if (anyData.data.fileUrl) return anyData.data.fileUrl;
      if (Array.isArray(anyData.data) && anyData.data[0]?.fileUrl) {
        return anyData.data[0].fileUrl;
      }
      if (anyData.data.rows) {
        if (Array.isArray(anyData.data.rows) && anyData.data.rows[0]?.fileUrl) {
          return anyData.data.rows[0].fileUrl;
        }
        if (anyData.data.rows.fileUrl) return anyData.data.rows.fileUrl;
      }
    }
    if (anyData.fileUrl) return anyData.fileUrl;
    if (Array.isArray(anyData) && anyData[0]?.fileUrl) return anyData[0].fileUrl;
    return null;
  })();

  const title = (() => {
    if (!listData) return "HR Policy";
    const anyData = listData as any;
    if (anyData.data) {
      if (anyData.data.title) return anyData.data.title;
      if (Array.isArray(anyData.data) && anyData.data[0]?.title) {
        return anyData.data[0].title;
      }
      if (anyData.data.rows) {
        if (Array.isArray(anyData.data.rows) && anyData.data.rows[0]?.title) {
          return anyData.data.rows[0].title;
        }
        if (anyData.data.rows.title) return anyData.data.rows.title;
      }
    }
    if (anyData.title) return anyData.title;
    if (Array.isArray(anyData) && anyData[0]?.title) return anyData[0].title;
    return "HR Policy";
  })();

  if (!fileUrl) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-foreground hover:bg-muted"
            asChild
          >
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Download ${title}`}
            >
              <FileText className="h-5 w-5" />
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{title}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
