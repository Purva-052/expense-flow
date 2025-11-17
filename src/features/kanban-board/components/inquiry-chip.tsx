/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge"; // ✅ Import the Badge component
import { INQUIRY_STATUS } from "@/utils/constant";

// Helper function to get status color (remains the same)
const getStatusColor = (status: string): string => {
  switch (status) {
    case INQUIRY_STATUS.NEW_INQUIRY:
      return "#3b82f6"; // Blue
    case INQUIRY_STATUS.IN_DISCUSSION:
      return "#f97316"; // Orange
    case INQUIRY_STATUS.NEAR_TO_CLOSE:
      return "#84cc16"; // Lime
    case INQUIRY_STATUS.CLOSED:
      return "#22c55e"; // Green
    case INQUIRY_STATUS.OPTED_OUT:
      return "#ef4444"; // Red
    default:
      return "#64748b"; // Slate
  }
};

// Helper to get a readable status label (remains the same)
const getStatusLabel = (status: string): string => {
  return (
    {
      [INQUIRY_STATUS.NEW_INQUIRY]: "New Inquiry",
      [INQUIRY_STATUS.IN_DISCUSSION]: "In Discussion",
      [INQUIRY_STATUS.NEAR_TO_CLOSE]: "Near to Close",
      [INQUIRY_STATUS.CLOSED]: "Closed",
      [INQUIRY_STATUS.OPTED_OUT]: "Opted Out",
    }[status] || "Unknown"
  );
};

export const InquiryChip = ({ lead }: { lead: any }) => {
  const statusColor = getStatusColor(lead?.status);
  const statusLabel = getStatusLabel(lead?.status);

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* The visible part of the chip remains clean and simple */}
          <div className="flex items-center gap-2 p-2 bg-muted/70 rounded-md border border-transparent hover:border-primary/50 transition-colors cursor-pointer max-w-[200px]">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: statusColor }}
            />
            <span className="text-sm font-medium text-foreground truncate">
              {lead?.clientName}
            </span>
          </div>
        </TooltipTrigger>

        <TooltipContent className={`p-3 border !shadow-2xl`}>
          <div className="space-y-3 text-sm">
            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="font-semibold w-32">Status:</span>
              <Badge
                className="text-white text-xs"
                style={{ backgroundColor: statusColor }}
              >
                {statusLabel}
              </Badge>
            </div>

            {/* Client Company */}
            <div className="flex items-start gap-2">
              <span className="font-semibold w-32">Company:</span>
              <span className="text-muted-foreground">
                {lead?.clientCompanyName && lead?.clientCompanyName !== ""
                  ? lead?.clientCompanyName
                  : "-"}
              </span>
            </div>

            {/* Country */}
            <div className="flex items-start gap-2">
              <span className="font-semibold w-32">Country:</span>
              <span className="text-muted-foreground">
                {lead?.countryName ?? "-"}
              </span>
            </div>

            {/* Source of Inquiry */}
            <div className="flex items-start gap-2">
              <span className="font-semibold w-32">Source of Inquiry:</span>
              <span className="text-muted-foreground">
                {lead?.sourceOfInquiry ?? "-"}
              </span>
            </div>

            {/* Inquiry Types (Modules) */}
            <div className="flex items-start gap-2">
              <span className="font-semibold w-32">Inquiry Type:</span>
              {lead?.modules?.length > 0 ? (
                <div className="flex flex-wrap w-60 gap-1">
                  {lead?.modules?.map((module: any) => (
                    <Badge
                      key={module.id}
                      variant="secondary"
                      className="border border-gray-300"
                    >
                      {module?.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
