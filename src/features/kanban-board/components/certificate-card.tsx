/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
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

  if (months === 12) {
    years += 1;
    months = 0;
  }

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

          {/* Right Side: Certificates */}
          <div className="p-4 bg-transparent">
            {certificates?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {certificates.map((cert: any) => (
                  <div
                    key={cert.id}
                    className="inline-flex items-center gap-3 rounded-full border px-3 py-1.5 shadow-sm bg-background max-w-full"
                  >
                    {/* Certificate name */}
                    <div className="flex items-center gap-2 min-w-0">
                      <Award className="h-4 w-4 text-blue-500 shrink-0" />
                      <span
                        className="text-xs font-semibold truncate max-w-[25ch] uppercase"
                        title={cert.name}
                      >
                        {cert.name}
                      </span>
                    </div>

                    {/* Status */}
                    <span
                      className={cn(
                        "text-[11px] px-2 py-0.5 rounded-full font-medium capitalize shrink-0",
                        cert.status === "preparation"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      )}
                    >
                      {cert.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center text-sm text-muted-foreground min-h-[80px]">
                <p>No certificates yet.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
