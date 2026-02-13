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
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/shared/custome-file-upload";
import { formatRole } from "@/utils/commonFunctions";
import {
  Briefcase,
  Calendar,
  Code,
  KeyRound,
  Loader2,
  Pencil,
  Sparkles,
  Award,
  Plus,
  // MapPin,
  Mail,
  // X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
// import { toast } from "sonner";
import { useUploadTransactionFile } from "../../transaction-logs/services";
import { useUpdateUserData } from "../../users/services";
import { CreatableSkillsSelect } from "./creatable-skills-select";
import { useGetSkillsList, useCreateSkill, Skill } from "../services";

const InfoCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center gap-4 p-4">
        <Icon className="h-5 w-5 text-blue-500" />
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export const UserProfileCard = ({ user }: { user: any }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localIsUploading, setLocalIsUploading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [certificates, setCertificates] = useState<string[]>([]);
  const [certInput, setCertInput] = useState("");
  const [learned, setLearned] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [type, setType] = useState<"learned" | "wishlist">("learned");

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

  const addCertificate = () => {
    if (!certInput.trim()) return;
    setCertificates([...certificates, certInput]);
    setCertInput("");
  };

  const addTechnology = () => {
    if (!techInput.trim()) return;

    if (type === "learned") {
      setLearned([...learned, techInput]);
    } else {
      setWishlist([...wishlist, techInput]);
    }

    setTechInput("");
  };

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
    <div className="w-full">
      {/* ================= HEADER ================= */}
      <div className="bg-linear-to-r from-black to-[#e80339] text-white py-12">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-6">
          <FormProvider {...methods}>
            <FileUpload
              name="file"
              label=""
              onFileSelect={handleFileSelect}
              hideDefaultUI
              acceptedFormats={{
                "image/jpeg": [".jpg", ".jpeg"],
                "image/png": [".png"],
              }}
              className="flex flex-col items-center"
            >
              <div className="relative group cursor-pointer">
                <Avatar className="h-24 w-24 text-3xl border-4 border-white overflow-hidden relative transition-all duration-300 group-hover:opacity-90">
                  {(localIsUploading || isUpdating) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10 transition-opacity">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                  <AvatarImage
                    src={previewUrl || ""}
                    alt={user?.fullName}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gray-600 text-white">
                    {getInitials(user?.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 h-8 w-8 bg-primary rounded-full flex items-center justify-center border-2 border-white shadow-sm text-white group-hover:scale-110 transition-all duration-200">
                  <Pencil className="h-4 w-4" />
                </div>
              </div>
            </FileUpload>
          </FormProvider>
          <div>
            <h1 className="text-3xl font-bold">{user?.fullName}</h1>
            <p className="text-gray-100">
              {user?.role && formatRole(user.role)}
            </p>
          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="max-w-6xl mx-auto px-6 -mt-8 space-y-8 pb-8">
        {/* ===== INFO CARDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <InfoCard icon={Mail} label="Email" value={user?.email || "-"} />
          <InfoCard
            icon={Briefcase}
            label="Role"
            value={user?.role ? formatRole(user.role) : "-"}
          />
          <InfoCard
            icon={Calendar}
            label="Career Start"
            value={formatDate(user?.careerStartDate)}
          />
          {/* <InfoCard icon={MapPin} label="Status" value={user?.status || "-"} /> */}
        </div>

        {/* ================= CERTIFICATES ================= */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-500" />
                Certificates
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Professional certifications and qualifications
              </p>
            </div>
            <Badge variant="default">{certificates.length}</Badge>
          </CardHeader>

          <CardContent className="space-y-4">
            {certificates.map((cert, i) => (
              <div
                key={i}
                className="bg-muted p-4 rounded-lg flex items-center gap-3"
              >
                <Award className="h-4 w-4 text-yellow-500" />
                <span>{cert}</span>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <Input
                placeholder="Add certificate (e.g., AWS, UI/UX...)"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
              />
              <Button onClick={addCertificate}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ================= TECHNOLOGIES ================= */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-blue-500" />
                Technologies & Skills
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Programming languages, frameworks, and tools
              </p>
            </div>
            <Badge variant="default">{learned.length + wishlist.length}</Badge>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Learned */}
              <div>
                <h3 className="flex items-center gap-2 font-semibold mb-3">
                  💡 Already Learned
                </h3>
                <div className="flex flex-wrap gap-2">
                  {learned.length > 0 ? (
                    learned.map((tech, i) => (
                      <Badge key={i} className="bg-blue-500 text-white">
                        {tech}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No skills added yet
                    </p>
                  )}
                </div>
              </div>

              {/* Wishlist */}
              <div>
                <h3 className="flex items-center gap-2 font-semibold mb-3">
                  🎯 Want to Learn
                </h3>
                <div className="flex flex-wrap gap-2">
                  {wishlist.length > 0 ? (
                    wishlist.map((tech, i) => (
                      <Badge key={i} className="bg-yellow-400 text-black">
                        {tech}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No skills added yet
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Add Technology */}
            <div className="border-t pt-6 flex gap-3">
              <Input
                placeholder="e.g., React, Node.js, Docker..."
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
              />
              <select
                className="border rounded-md px-3 py-2 text-sm"
                value={type}
                onChange={(e) =>
                  setType(e.target.value as "learned" | "wishlist")
                }
              >
                <option value="learned">Learned</option>
                <option value="wishlist">Want to Learn</option>
              </select>
              <Button onClick={addTechnology}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ================= SKILLS SECTION ================= */}
        {user?.role !== "admin" && user?.role !== "project_manager" && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                Professional Skills
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Technical skills and expertise
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <CreatableSkillsSelect
                options={skillsData?.data || []}
                selected={selectedSkills}
                onChange={handleSkillsChange}
                onCreateSkill={handleCreateSkill}
                loading={skillsLoading}
                creating={isCreatingSkill}
                placeholder="Add skills..."
                maxSelectedShow={10}
              />
            </CardContent>
          </Card>
        )}

        {/* ================= PRIMARY TECHNOLOGY ================= */}
        {user?.role !== "admin" && user?.role !== "project_manager" && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-blue-500" />
                Primary Technology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className="text-white"
                style={{ backgroundColor: user?.technology?.color || "#333" }}
              >
                {user?.technology?.name || "-"}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* ================= UPDATE PASSWORD ================= */}
        <Card className="shadow-sm">
          <CardFooter className="pt-6">
            <DialogTrigger asChild>
              <Button className="w-full" variant="outline">
                <KeyRound className="mr-2 h-4 w-4" />
                Update Password
              </Button>
            </DialogTrigger>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
