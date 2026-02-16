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
import { DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/shared/custome-file-upload";
import { formatRole } from "@/utils/commonFunctions";
import { Cropper } from "react-cropper";
import "cropperjs/dist/cropper.css";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  X,
  Check,
  Mail,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "@/config/instance/instance";
import API from "@/config/api/api";
import { toast } from "sonner";
import { FormProvider, useForm } from "react-hook-form";
// import { toast } from "sonner";
import { useUploadTransactionFile } from "../../transaction-logs/services";
import { useUpdateUserData } from "../../users/services";
import { CreatableSkillsSelect } from "./creatable-skills-select";
import {
  useGetSkillsList,
  useCreateSkill,
  useCreateLearning,
  useCreateCertificate,
  useUpdateCertificate,
  useDeleteCertificate,
  Skill,
  // Certificate,
} from "../services";

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

const ProfileSkeleton = () => {
  return (
    <div className="w-full">
      <div className="bg-linear-to-r from-black to-[#e80339] text-white py-12">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-slate-700 animate-pulse" />
          <div className="flex-1">
            <div className="h-6 bg-slate-700 rounded w-48 animate-pulse mb-2" />
            <div className="h-4 bg-slate-600 rounded w-36 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8 space-y-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 bg-white rounded shadow-sm">
              <div className="h-4 bg-slate-200 rounded w-24 mb-3 animate-pulse" />
              <div className="h-5 bg-slate-300 rounded w-40 animate-pulse" />
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded shadow-sm p-4">
              <div className="h-5 bg-slate-200 rounded w-48 mb-4 animate-pulse" />
              <div className="h-6 bg-slate-100 rounded w-full mb-2 animate-pulse" />
              <div className="h-6 bg-slate-100 rounded w-full mb-2 animate-pulse" />
              <div className="h-6 bg-slate-100 rounded w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const UserProfileCard = ({ user }: { user: any }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localIsUploading, setLocalIsUploading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [certInput, setCertInput] = useState("");
  const [editingCertId, setEditingCertId] = useState<number | null>(null);
  const [editingCertName, setEditingCertName] = useState("");
  const [skillType, setSkillType] = useState<"skill" | "learning">("skill");
  const [skillsData, setSkillsData] = useState<any[]>([]);
  const [learningData, setLearningData] = useState<any[]>([]);
  const [certificatesData, setCertificatesData] = useState<any[]>([]);
  const [projectViewType, setProjectViewType] = useState<"grid" | "list">(
    "grid"
  );
  const [image, setImage] = useState<string | null>(null);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const cropperRef = useRef<any>(null);

  const { mutateAsync: uploadFile } = useUploadTransactionFile();
  const { mutateAsync: updateProfile, isPending: isUpdating } =
    useUpdateUserData(user?.id);
  const { data: skillsList, isLoading: skillsLoading } = useGetSkillsList();
  const { mutateAsync: createSkill, isPending: isCreatingSkill } =
    useCreateSkill();
  const { mutateAsync: createLearning, isPending: isAddingSkill } =
    useCreateLearning();
  const { mutateAsync: createCertificate, isPending: isCreatingCertificate } =
    useCreateCertificate(user?.id);
  const { mutateAsync: updateCertificate, isPending: isUpdatingCertificate } =
    useUpdateCertificate(user?.id);
  const { mutateAsync: deleteCertificate } = useDeleteCertificate(user?.id);
  const queryClient = useQueryClient();

  const deleteSkillMutation = useMutation<any, Error, string | number>({
    mutationFn: async (skillId: string | number) => {
      const response = await instance.delete({
        url: `${API.skills.delete}/${skillId}`,
      });

      if (
        response?.statusCode === 200 ||
        response?.statusCode === 202 ||
        response?.statusCode === 201
      ) {
        toast.success("Skill deleted successfully", {
          duration: 3000,
          position: "top-right",
        });
        return response.data;
      }

      const errorMessage = response?.message || "Failed to delete skill";
      throw new Error(errorMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`${API.users.list}/${user?.id}`],
      });
      queryClient.invalidateQueries({ queryKey: [API.skills.list] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete skill", {
        duration: 3000,
        position: "top-right",
      });
    },
  });

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

    // Initialize skills and learning data from user response
    if (user?.skills && Array.isArray(user.skills)) {
      const skills = user.skills.filter(
        (item: any) => item.skillType === "skill"
      );
      const learning = user.skills.filter(
        (item: any) => item.skillType === "learning"
      );

      setSkillsData(skills);
      setLearningData(learning);
    }

    // Initialize certificates data from user response
    if (user?.certificates && Array.isArray(user.certificates)) {
      setCertificatesData(user.certificates);
    }

    // Initialize project view type from user data or localStorage
    const storedViewType = localStorage.getItem("projectViewType") as
      | "grid"
      | "list"
      | null;
    const viewType = user?.projectViewType || storedViewType || "grid";
    setProjectViewType(viewType);
    if (viewType) {
      localStorage.setItem("projectViewType", viewType);
    }
  }, [user]);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size exceeds 2MB limit", {
        position: "top-right",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setShowCropDialog(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCrop = async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) {
      toast.error("Cropper not initialized");
      return;
    }

    try {
      const croppedCanvas = cropper.getCroppedCanvas({
        width: 400,
        height: 400,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
      });
      if (!croppedCanvas) {
        toast.error("Failed to get cropped canvas");
        return;
      }

      setLocalIsUploading(true);
      setShowCropDialog(false);

      croppedCanvas.toBlob(async (blob: Blob | null) => {
        if (!blob) {
          setLocalIsUploading(false);
          toast.error("Failed to generate image blob");
          return;
        }

        const file = new File([blob], "profile-picture.jpg", {
          type: "image/jpeg",
        });
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "profile-picture");

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
            toast.success("Profile picture updated successfully");
          } else {
            toast.error("Upload failed: No URL returned");
          }
        } catch (error) {
          console.error("Upload failed", error);
          toast.error("Failed to upload cropped image");
        } finally {
          setLocalIsUploading(false);
        }
      }, "image/jpeg");
    } catch (err) {
      console.error("Cropping failed", err);
      toast.error("An error occurred while cropping");
      setLocalIsUploading(false);
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

  const handleAddSkillWithType = async (skill: Skill) => {
    if (!skill?.id) return;

    try {
      const payload = {
        skillId: Number(skill.id),
        skillType: skillType,
      };

      await createLearning(payload);

      // Update local state
      const newItem = {
        skillType: skillType,
        skill: {
          id: skill.id,
          skillName: skill.skillName,
        },
      };

      if (skillType === "skill") {
        setSkillsData([...skillsData, newItem]);
      } else {
        setLearningData([...learningData, newItem]);
      }

      // Clear selection
      setSelectedSkills([]);
    } catch (error) {
      console.error("Failed to add skill with type", error);
    }
  };

  const handleAddCertificate = async () => {
    if (!certInput.trim()) return;

    try {
      await createCertificate({ name: certInput.trim() });
      // Clear input - data will be refetched automatically
      setCertInput("");
    } catch (error) {
      console.error("Failed to add certificate", error);
    }
  };

  const handleEditCertificate = (certId: number, certName: string) => {
    setEditingCertId(certId);
    setEditingCertName(certName);
  };

  const handleSaveCertificate = async (certId: number) => {
    if (!editingCertName.trim()) return;

    try {
      await updateCertificate({ id: certId, name: editingCertName.trim() });
      // Clear editing state - data will be refetched automatically
      setEditingCertId(null);
      setEditingCertName("");
    } catch (error) {
      console.error("Failed to update certificate", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCertId(null);
    setEditingCertName("");
  };

  const handleDeleteCertificate = async (certId: number) => {
    try {
      await deleteCertificate({ id: certId });
      // Data will be refetched automatically
    } catch (error) {
      console.error("Failed to delete certificate", error);
    }
  };

  const handleDeleteSkill = async (
    skillId: string | number,
    type: "skill" | "learning"
  ) => {
    try {
      await deleteSkillMutation.mutateAsync(skillId);
      if (type === "skill") {
        setSkillsData((prev) =>
          prev.filter((item) => String(item?.skill?.id) !== String(skillId))
        );
      } else {
        setLearningData((prev) =>
          prev.filter((item) => String(item?.skill?.id) !== String(skillId))
        );
      }
    } catch (error) {
      console.error("Failed to delete skill", error);
    }
  };

  const handleProjectViewToggle = async (checked: boolean) => {
    const newViewType = checked ? "list" : "grid";
    setProjectViewType(newViewType);
    localStorage.setItem("projectViewType", newViewType);

    // Update user profile with new preference
    try {
      await updateProfile({ projectViewType: newViewType });
    } catch (error) {
      console.error("Failed to update project view preference", error);
    }
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

  if (!user) {
    return <ProfileSkeleton />;
  }

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
            {/* <p className="text-xs text-white/80 mt-1 uppercase tracking-wider font-medium">
              Max Size: 2 MB
            </p> */}
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
        {user.role !== "admin" && user.role !== "project_manager" && (
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
              <Badge variant="default">{certificatesData.length}</Badge>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {certificatesData.length > 0 ? (
                  certificatesData.map((cert: any, i: number) => (
                    <div key={i} className="relative group">
                      {editingCertId === cert.id ? (
                        <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1.5 rounded-md">
                          <Award className="h-3 w-3 text-yellow-700" />
                          <Input
                            value={editingCertName}
                            onChange={(e) => setEditingCertName(e.target.value)}
                            className="h-6 px-2 py-0 text-sm border-yellow-300 focus:border-yellow-500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSaveCertificate(cert.id);
                              } else if (e.key === "Escape") {
                                handleCancelEdit();
                              }
                            }}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => handleSaveCertificate(cert.id)}
                            disabled={isUpdatingCertificate}
                          >
                            <Check className="h-3 w-3 text-green-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <Badge className="bg-yellow-500 text-white pr-1">
                          <Award className="h-3 w-3 mr-1" />
                          {cert?.name}
                          <div className="ml-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-4 w-4 p-0 hover:bg-yellow-600"
                              onClick={() =>
                                handleEditCertificate(cert.id, cert.name)
                              }
                            >
                              <Pencil className="h-2.5 w-2.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-4 w-4 p-0 hover:bg-yellow-600"
                              onClick={() => handleDeleteCertificate(cert.id)}
                            >
                              <X className="h-2.5 w-2.5" />
                            </Button>
                          </div>
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No certificates added yet
                  </p>
                )}
              </div>

              <div className="border-t pt-4 flex gap-3">
                <Input
                  placeholder="Add certificate (e.g., AWS Certified, Google Cloud...)"
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && certInput.trim()) {
                      handleAddCertificate();
                    }
                  }}
                />
                <Button
                  onClick={handleAddCertificate}
                  disabled={!certInput.trim() || isCreatingCertificate}
                >
                  {isCreatingCertificate ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ================= TECHNOLOGIES & SKILLS ================= */}
        {user.role !== "admin" && user.role !== "project_manager" && (
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
              <Badge variant="default">
                {skillsData.length + learningData.length}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Skills */}
                <div>
                  <h3 className="flex items-center gap-2 font-semibold mb-3">
                    💡 Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skillsData.length > 0 ? (
                      skillsData.map((item, i) => (
                        <div key={i} className="relative group">
                          <Badge className="bg-blue-500 text-white pr-1">
                            <span className="inline-flex items-center">
                              {item?.skill?.skillName}
                            </span>
                            <div className="ml-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-4 w-4 p-0 hover:bg-blue-600"
                                onClick={() =>
                                  handleDeleteSkill(item?.skill?.id, "skill")
                                }
                              >
                                <X className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No skills added yet
                      </p>
                    )}
                  </div>
                </div>

                {/* Want to Learn */}
                <div>
                  <h3 className="flex items-center gap-2 font-semibold mb-3">
                    🎯 Want to Learn / Learning in Progress
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {learningData.length > 0 ? (
                      learningData.map((item, i) => (
                        <div key={i} className="relative group">
                          <Badge className="bg-yellow-400 text-black pr-1">
                            <span className="inline-flex items-center">
                              {item?.skill?.skillName}
                            </span>
                            <div className="ml-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-4 w-4 p-0 hover:bg-yellow-300"
                                onClick={() =>
                                  handleDeleteSkill(item?.skill?.id, "learning")
                                }
                              >
                                <X className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No skills added yet
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Add Skill with Type */}
              <div className="border-t pt-6 flex gap-3 items-end">
                <div className="flex-1">
                  <CreatableSkillsSelect
                    options={skillsList?.data || []}
                    selected={selectedSkills}
                    onChange={setSelectedSkills}
                    onCreateSkill={handleCreateSkill}
                    loading={skillsLoading}
                    creating={isCreatingSkill}
                    placeholder="e.g., React, Node.js, Docker..."
                    maxSelectedShow={3}
                  />
                </div>
                <Select
                  value={skillType}
                  onValueChange={(value: "skill" | "learning") =>
                    setSkillType(value)
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skill">Skill</SelectItem>
                    <SelectItem value="learning">Want to Learn</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => {
                    if (selectedSkills.length > 0) {
                      handleAddSkillWithType(selectedSkills[0]);
                    }
                  }}
                  disabled={selectedSkills.length === 0 || isAddingSkill}
                >
                  {isAddingSkill ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ================= PROJECT VIEW PREFERENCE ================= */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              Project View Preference
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose how you want to view projects on the Kanban board
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label
                  htmlFor="project-view-toggle"
                  className="text-base font-medium"
                >
                  {projectViewType === "grid" ? "Grid View" : "List View"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {projectViewType === "grid"
                    ? "Projects displayed as cards in a grid layout"
                    : "Projects displayed in a compact list layout"}
                </p>
              </div>
              <Switch
                id="project-view-toggle"
                checked={projectViewType === "list"}
                onCheckedChange={handleProjectViewToggle}
                disabled={isUpdating}
              />
            </div>
          </CardContent>
        </Card>

        {/* ================= SKILLS SECTION ================= */}
        {/* {user?.role !== "admin" && user?.role !== "project_manager" && (
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
              <p className="text-sm text-muted-foreground">
                Use the Technologies & Skills section above to manage your skills.
              </p>
            </CardContent>
          </Card>
        )} */}

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

      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Crop Profile Picture</DialogTitle>
            <DialogDescription>
              Max file size : 2MB. Please crop your image to a square aspect
              ratio for best results.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {image && (
              <Cropper
                src={image}
                style={{ height: 400, width: "100%" }}
                initialAspectRatio={1}
                aspectRatio={1}
                guides={true}
                ref={cropperRef}
                viewMode={1}
                dragMode="move"
                background={false}
                responsive={true}
                autoCropArea={1}
                checkOrientation={false}
              />
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowCropDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCrop}>Crop & Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
