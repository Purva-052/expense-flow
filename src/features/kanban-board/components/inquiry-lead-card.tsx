/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InquiryChip } from "./inquiry-chip";

export const InquiryLeadCard = ({ group }: { group: any }) => {
  // Use a consistent color for the border for all lead generators
  const leadGeneratorColor = "#1ABC9C"; // A nice sky blue

  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg py-0">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 items-start lg:grid-cols-[250px_1fr]">
          {/* Left Side: Lead Generator Details */}
          <div
            className="flex flex-col gap-3 p-4 bg-secondary/50 h-full border-l-8"
            style={{ borderColor: leadGeneratorColor }}
          >
            <div className="flex w-full items-start justify-between">
              <div className="flex flex-col gap-3 w-full overflow-hidden">
                <div>
                  <h3 className="text-lg font-bold text-card-foreground wrap-break-word leading-tight">
                    {group?.generatedByName}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {group?.generatedByEmail}
                  </p>
                </div>

                <div className="flex">
                  <Badge
                    className="text-xs text-white"
                    style={{ backgroundColor: leadGeneratorColor }}
                  >
                    {group?.totalLeads}{" "}
                    {group?.totalLeads === 1 ? "Lead" : "Leads"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Displays all leads from this generator */}
          <div className="p-4 min-h-[110px] bg-transparent">
            {group?.leads?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {group?.leads.map((lead: any) => (
                  <InquiryChip key={lead.id} lead={lead} />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center text-sm text-muted-foreground h-full min-h-[80px]">
                <p>No leads generated.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
