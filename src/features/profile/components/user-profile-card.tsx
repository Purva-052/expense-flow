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
import { FileUpload } from "@/components/shared/custome-file-upload";
import { formatRole } from "@/utils/commonFunctions";
import {
  AtSign,
  Briefcase,
  Calendar,
  Code,
  KeyRound,
  Loader2,
  Pencil,
  Sparkles,
  // X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
// import { toast } from "sonner";
import { useUploadTransactionFile } from "../../transaction-logs/services";
import { useUpdateUserData } from "../../users/services";
import { CreatableSkillsSelect } from "./creatable-skills-select";
import { useGetSkillsList, useCreateSkill, Skill } from "../services";

const ProfileDetailRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-4 w-full">
    <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
    <div className="flex flex-col w-full min-w-0">
      <span className="text-sm font-semibold text-muted-foreground">
        {label}
      </span>
      <div className="font-medium break-words w-full">{value}</div>
    </div>
  </div>
);

export const UserProfileCard = ({ user }: { user: any }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localIsUploading, setLocalIsUploading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);

  const { mutateAsync: uploadFile } = useUploadTransactionFile();
  const { mutateAsync: updateProfile, isPending: isUpdating } =
    useUpdateUserData(user?.id);
  const { data: skillsData, isLoading: skillsLoading } = useGetSkillsList();
  const { mutateAsync: createSkill, isPending: isCreatingSkill } =
    useCreateSkill();

  const methods = useForm({
    defaultValues: {
      file: null,
    },
  });

  useEffect(() => {
    if (user?.profilePicUrl) {
      setPreviewUrl(user.profilePicUrl);
    } else if (user?.avatarUrl) {
      setPreviewUrl(user.avatarUrl);
    }

    // Initialize selected skills from user data
    if (user?.skills && Array.isArray(user.skills)) {
      setSelectedSkills(
        user.skills.map((item: any) => ({
          id: item?.skill?.id,
          skillName: item?.skill?.skillName,
        }))
      );
    }
  }, [user]);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "profile-picture");

    setLocalIsUploading(true);
    try {
      const response: any = await uploadFile(formData);
      if (response?.url) {
        const payload = {
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          technologyId: user.technology?.id,
          careerStartDate: user.careerStartDate,
          status: user.status,
          joining: user.joining ? "true" : "false",
          currentWorkingProjectId: user.currentProject?.id,
          profilePicS3Key: response.key,
        };
        await updateProfile(payload);
        setPreviewUrl(response.url);
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setLocalIsUploading(false);
    }
  };

  const handleSkillsChange = async (skills: Skill[]) => {
    setSelectedSkills(skills);

    try {
      const payload = {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        technologyId: user.technology?.id,
        careerStartDate: user.careerStartDate,
        status: user.status,
        joining: user.joining ? "true" : "false",
        currentWorkingProjectId: user.currentProject?.id,
        skillIds: skills.map((s) => s.id),
      };
      await updateProfile(payload);
    } catch (error) {
      console.error("Failed to update skills", error);
    }
  };

  const handleCreateSkill = async (
    skillName: string
  ): Promise<Skill | void> => {
    try {
      const response: any = await createSkill({ skillName });
      if (response?.id && (response?.skillName || response?.name)) {
        return {
          id: response.id,
          skillName: response.skillName || response.name,
        };
      }
    } catch (error) {
      console.error("Failed to create skill", error);
    }
  };

  // const handleFileRemove = async () => {
  //   setLocalIsUploading(true);
  //   try {
  //     const payload = {
  //       fullName: user.fullName,
  //       email: user.email,
  //       role: user.role,
  //       technologyId: user.technology?.id,
  //       careerStartDate: user.careerStartDate,
  //       status: user.status,
  //       joining: user.joining ? "true" : "false",
  //       currentWorkingProjectId: user.currentProject?.id,
  //       profilePicUrl: "",
  //     };
  //     await updateProfile(payload);
  //     setPreviewUrl(null);
  //     methods.setValue("file", null);
  //     toast.success("Profile picture removed");
  //   } catch (error) {
  //     console.error("Remove failed", error);
  //     toast.error("Failed to remove profile picture");
  //   } finally {
  //     setLocalIsUploading(false);
  //   }
  // };

  const getInitials = (name: string = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
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
          <FormProvider {...methods}>
            <FileUpload
              name="file"
              label=""
              onFileSelect={handleFileSelect}
              // onFileRemove={handleFileRemove}
              hideDefaultUI
              acceptedFormats={{
                "image/jpeg": [".jpg", ".jpeg"],
                "image/png": [".png"],
              }}
              className="flex flex-col items-center"
            >
              <div className="relative group cursor-pointer">
                <Avatar className="h-28 w-28 text-4xl border-4 border-primary/20 overflow-hidden relative transition-all duration-300 group-hover:opacity-90">
                  {(localIsUploading || isUpdating) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10 transition-opacity">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                  <AvatarImage
                    src={previewUrl || ""}
                    alt={user?.fullName}
                    className="object-cover"
                  />
                  <AvatarFallback>{getInitials(user?.fullName)}</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-1 right-1 h-8 w-8 bg-primary rounded-full flex items-center justify-center border-2 border-white shadow-sm text-white group-hover:scale-110 transition-all duration-200">
                  <Pencil className="h-4 w-4" />
                </div>
                {/* {previewUrl && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-1 -right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      // handleFileRemove();
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )} */}
              </div>
            </FileUpload>
          </FormProvider>
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
              {user?.technology?.name || "-"}
            </Badge>
          }
        />
        <ProfileDetailRow
          icon={Sparkles}
          label="Strengths"
          value={
            <div className="w-full mt-1">
              <CreatableSkillsSelect
                options={skillsData?.data || []}
                selected={selectedSkills}
                onChange={handleSkillsChange}
                onCreateSkill={handleCreateSkill}
                loading={skillsLoading}
                creating={isCreatingSkill}
                placeholder="Add skills..."
                maxSelectedShow={5}
              />
            </div>
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
