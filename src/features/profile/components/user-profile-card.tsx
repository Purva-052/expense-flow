// src/pages/profile/components/user-profile-card.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DialogTrigger } from "@/components/ui/dialog";
import { formatRole } from "@/utils/commonFunctions";
import { AtSign, Briefcase, Calendar, Code, KeyRound } from "lucide-react";

const ProfileDetailRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-4">
    <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
    <div className="flex flex-col">
      <span className="text-sm font-semibold text-muted-foreground">
        {label}
      </span>
      <span className="font-medium break-words">{value}</span>
    </div>
  </div>
);

export const UserProfileCard = ({ user }: { user: any }) => {
  const getInitials = (name: string = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="text-center">
        <div className="mx-auto">
          <Avatar className="h-28 w-28 text-4xl border-4 border-primary/20">
            <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
            <AvatarFallback>{getInitials(user?.fullName)}</AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="mt-4 text-3xl">{user?.fullName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <ProfileDetailRow icon={AtSign} label="Email" value={user?.email} />
        <ProfileDetailRow
          icon={Briefcase}
          label="Role"
          value={formatRole(user?.role)}
        />
        <ProfileDetailRow
          icon={Calendar}
          label="Career Start Date"
          value={formatDate(user?.careerStartDate)}
        />
        <ProfileDetailRow
          icon={Code}
          label="Primary Technology"
          value={
            <Badge
              className="text-white"
              style={{ backgroundColor: user?.technology?.color || "#333" }}
            >
              {user?.technology?.name || "N/A"}
            </Badge>
          }
        />
      </CardContent>
      <CardFooter>
        <DialogTrigger asChild>
          <Button className="w-full" variant="outline">
            <KeyRound className="mr-2 h-4 w-4" />
            Update Password
          </Button>
        </DialogTrigger>
      </CardFooter>
    </Card>
  );
};
