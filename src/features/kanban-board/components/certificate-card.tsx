/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Award, Briefcase } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ✅ Helper: Calculate years of experience
export const formatExperience = (
  startDate: string | null | undefined
): string | null => {
  if (!startDate) return null;

  const start = new Date(startDate);
  const now = new Date();

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();

  // Adjust if current date is before start day
  if (
    now.getMonth() < start.getMonth() ||
    (now.getMonth() === start.getMonth() && now.getDate() < start.getDate())
  ) {
    years--;
    months += 12;
  }

  if (months < 0) months += 12;

  // 🔹 Less than 1 year → show only months
  if (years < 1) {
    return `${months} month${months !== 1 ? "s" : ""}`;
  }

  // 🔹 1 year or more → show years + months
  const yearLabel = `${years} Year${years !== 1 ? "s" : ""}`;

  if (months === 0) {
    return yearLabel;
  }

  const monthLabel = `${months} month${months !== 1 ? "s" : ""}`;
  return `${yearLabel} ${monthLabel}`;
};

export const CertificateCard = ({ user }: { user: any }) => {
  // ✅ Calculate developer experience
  const experience = formatExperience(user?.careerStartDate);
  const profilePic = user?.profilePicUrl || user?.avatarUrl;

  const certificates = user?.certificates || [];

  return (
    <Card
      className={cn(
        "overflow-hidden transition-shadow duration-300 hover:shadow-lg py-0"
      )}
    >
      <CardContent className="p-0">
        <div className="grid grid-cols-1 items-start lg:grid-cols-[250px_1fr]">
          {/* Left Side: Avatar and Experience */}
          <div className="flex flex-col gap-3 p-4 bg-secondary/50 h-full">
            {/* Avatar and Name with Experience */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 shrink-0 border-2 border-white shadow-sm">
                <AvatarImage
                  src={
                    profilePic ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName}`
                  }
                  alt={user?.fullName}
                />
                <AvatarFallback>{user?.fullName?.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h3 className="text-sm font-bold text-card-foreground leading-tight">
                  {user?.fullName}
                </h3>
                {experience && (
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground font-medium">
                    <Briefcase className="h-3.5 w-3.5 shrink-0" />
                    <span>{experience}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Certificates as Badges */}
          <div className="p-4 flex flex-col min-h-[70px] bg-transparent justify-center">
            {certificates?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {certificates.map((cert: any) => (
                  <Badge
                    key={cert.id}
                    className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300 border px-3 py-1.5 font-semibold transition-colors duration-200"
                  >
                    <Award className="h-6 w-6 text-blue-500" />
                    {cert.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center text-sm text-muted-foreground h-full min-h-[80px]">
                <p>No certificates yet.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
