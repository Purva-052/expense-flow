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
  LayoutGrid,
  List,
} from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
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
  useGetSkillReference,
  useUpdateSkillReference,
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
    <Card className="shadow-sm overflow-hidden">
      <CardContent className="flex items-start gap-4 p-4">
        <Icon className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />

        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>

          <p
            className="font-semibold text-sm sm:text-base truncate break-all"
            title={value}
          >
            {value || "-"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const ProfileSkeleton = () => {
  return (
    <div className="w-full">
      <div className="bg-linear-to-r from-[#1a1a1a] via-[#3b0a14] to-[#e80339] text-white py-12">
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
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 bg-card rounded shadow-sm">
              <div className="h-4 bg-muted rounded w-24 mb-3 animate-pulse" />
              <div className="h-5 bg-muted rounded w-40 animate-pulse" />
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card rounded shadow-sm p-4">
              <div className="h-5 bg-muted rounded w-48 mb-4 animate-pulse" />
              <div className="h-6 bg-muted/50 rounded w-full mb-2 animate-pulse" />
              <div className="h-6 bg-muted/50 rounded w-full mb-2 animate-pulse" />
              <div className="h-6 bg-muted/50 rounded w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface UserProfileCardProps {
  user: any;
  isReadOnly?: boolean;
}

export const UserProfileCard = ({ user, isReadOnly }: UserProfileCardProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localIsUploading, setLocalIsUploading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [certInput, setCertInput] = useState("");
  const [editingCertId, setEditingCertId] = useState<number | null>(null);
  const [editingCertName, setEditingCertName] = useState("");
  const [editingCertStatus, setEditingCertStatus] = useState<
    "preparation" | "completed"
  >("preparation");
  const [skillType, setSkillType] = useState<"skill" | "learning">("skill");
  const [status, setStatus] = useState<"preparation" | "completed">(
    "preparation"
  );
  const [skillsData, setSkillsData] = useState<any[]>([]);
  const [learningData, setLearningData] = useState<any[]>([]);
  const [certificatesData, setCertificatesData] = useState<any[]>([]);
  const [projectViewType, setProjectViewType] = useState<"grid" | "list">(
    "grid"
  );
  const [image, setImage] = useState<string | null>(null);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [skillEditingKey, setEditingSkillKey] = useState<string | null>(null);
  const [editingSkillRefId, setEditingSkillRefId] = useState<number | null>(
    null
  );
  const [editingSkillValue, setEditingSkillValue] = useState<Skill[]>([]);
  const [editingSkillType, setEditingSkillType] = useState<
    "skill" | "learning"
  >("skill");
  const cropperRef = useRef<any>(null);

  // Saves and restores the #content scroll position around Radix Select open.
  // When Radix focuses the SelectContent portal, some browsers scroll the
  // nearest scroll ancestor (#content) to bring it into view — causing a
  // jump to the top. We capture the position just before open and restore it
  // one animation frame later (after the browser's scroll-into-view fires).
  const preserveScroll = (isOpen: boolean) => {
    const container = document.getElementById("content");
    if (!container) return;

    if (isOpen) {
      const savedTop = container.scrollTop;
      // Capture the position and restore it after focus shifts
      const restore = () => {
        if (container.scrollTop !== savedTop) {
          container.scrollTop = savedTop;
        }
      };

      // Try multiple frames to catch various browser/Radix behaviors
      requestAnimationFrame(restore);
      setTimeout(restore, 0);
      setTimeout(restore, 10);
    }
  };

  const { mutateAsync: uploadFile } = useUploadTransactionFile();
  const { mutateAsync: updateProfile, isPending: isUpdating } =
    useUpdateUserData(user?.id);
  const { data: skillsList, isLoading: skillsLoading } = useGetSkillsList();
  const { data: skillReferenceData } = useGetSkillReference(user?.id);
  const { mutateAsync: createSkill, isPending: isCreatingSkill } =
    useCreateSkill();
  const { mutateAsync: createLearning, isPending: isAddingSkill } =
    useCreateLearning();
  const { mutateAsync: createCertificate, isPending: isCreatingCertificate } =
    useCreateCertificate(user?.id);
  const { mutateAsync: updateCertificate, isPending: isUpdatingCertificate } =
    useUpdateCertificate(user?.id);
  const { mutateAsync: deleteCertificate } = useDeleteCertificate(user?.id);
  const {
    mutateAsync: updateSkillReference,
    isPending: isUpdatingSkillReference,
  } = useUpdateSkillReference();

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

  const getSkillEditKey = (
    skillId: number | string,
    type: "skill" | "learning"
  ) => `${type}-${String(skillId)}`;

  const getSkillReferenceId = (
    item: any,
    type: "skill" | "learning"
  ): number | null => {
    const directSkillRefId = Number(
      item?.id ?? item?.skillReferenceId ?? item?.skillRefId
    );
    if (Number.isFinite(directSkillRefId) && directSkillRefId > 0) {
      return directSkillRefId;
    }

    const skillId = Number(item?.skill?.id ?? item?.skillId);
    if (!skillId || !skillReferenceData?.data?.length) {
      return null;
    }

    const matchedRef = skillReferenceData.data.find(
      (reference) =>
        Number(reference?.skillId) === skillId && reference?.skillType === type
    );
    const resolvedRefId = Number(matchedRef?.id);
    return Number.isFinite(resolvedRefId) && resolvedRefId > 0
      ? resolvedRefId
      : null;
  };

  const handleFileSelect = async (file: File) => {
    if (isReadOnly) return;
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
    } catch (error) {
      console.error("Failed to add skill with type", error);
    }
  };

  const handleAddCertificate = async () => {
    if (!certInput.trim()) return;

    try {
      await createCertificate({ name: certInput.trim(), status: status });
      // Clear input - data will be refetched automatically
      setCertInput("");
    } catch (error) {
      console.error("Failed to add certificate", error);
    }
  };

  const handleEditCertificate = (
    certId: number,
    certName: string,
    certStatus: "preparation" | "completed" = "preparation"
  ) => {
    setEditingCertId(certId);
    setEditingCertName(certName);
    setEditingCertStatus(certStatus);
  };

  const handleEditSkill = (
    skillRefId: number | null,
    skill: Skill,
    skillType: "skill" | "learning"
  ) => {
    if (!skill?.id) return;

    setEditingSkillKey(getSkillEditKey(skill.id, skillType));
    setEditingSkillRefId(skillRefId);
    setEditingSkillValue([skill]);
    setEditingSkillType(skillType);
  };

  const handleCancelSkillEdit = () => {
    setEditingSkillKey(null);
    setEditingSkillRefId(null);
    setEditingSkillValue([]);
    setEditingSkillType("skill");
  };

  const handleSaveSkillReference = async () => {
    if (editingSkillValue.length === 0) return;

    const skillId = Number(editingSkillValue[0].id);
    const userId = Number(user?.id);
    if (!skillId || !userId) return;
    const resolvedSkillRefId =
      editingSkillRefId ??
      Number(
        skillReferenceData?.data?.find(
          (reference) =>
            Number(reference?.skillId) === skillId &&
            reference?.skillType === editingSkillType
        )?.id
      );
    if (!resolvedSkillRefId) {
      toast.error("Unable to find skill reference to update.");
      return;
    }

    try {
      await updateSkillReference({
        id: resolvedSkillRefId,
        skillId,
        userId,
        skillType: editingSkillType,
      });
      handleCancelSkillEdit();
    } catch (error) {
      console.error("Failed to update skill reference", error);
    }
  };

  const handleSaveCertificate = async (certId: number) => {
    if (!editingCertName.trim()) return;

    try {
      await updateCertificate({
        id: certId,
        name: editingCertName.trim(),
        status: editingCertStatus,
      });
      toast;
      // Clear editing state - data will be refetched automatically
      setEditingCertId(null);
      setEditingCertName("");
      setEditingCertStatus("preparation");
    } catch (error) {
      console.error("Failed to update certificate", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCertId(null);
    setEditingCertName("");
    setEditingCertStatus("preparation");
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
      // Calculate remaining skills after deletion
      const updatedSkills =
        type === "skill"
          ? skillsData.filter(
              (item) => String(item?.skill?.id) !== String(skillId)
            )
          : skillsData;

      const updatedLearning =
        type === "learning"
          ? learningData.filter(
              (item) => String(item?.skill?.id) !== String(skillId)
            )
          : learningData;

      // Combine remaining skill IDs from both types
      const remainingSkillIds = [
        ...updatedSkills.map((item) => Number(item?.skill?.id)),
        ...updatedLearning.map((item) => Number(item?.skill?.id)),
      ];

      // Send all remaining skill IDs
      await updateProfile({
        skillIds: remainingSkillIds,
      });

      // Update local state
      if (type === "skill") {
        setSkillsData(updatedSkills);
      } else {
        setLearningData(updatedLearning);
      }
    } catch (error) {
      console.error("Failed to delete skill", error);
    }
  };

  const handleProjectViewToggle = async (view: "grid" | "list") => {
    setProjectViewType(view);
    localStorage.setItem("projectViewType", view);

    try {
      await updateProfile({ projectViewType: view });
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

  // Filter out already-added skills based on skillType
  const filteredSkillOptions = useMemo(() => {
    if (!skillsList?.data) return [];

    const addedSkillIds = [
      ...skillsData.map((s: any) => s?.skill?.id),
      ...learningData.map((l: any) => l?.skill?.id),
    ];

    return skillsList.data.filter(
      (skill: any) => !addedSkillIds.includes(skill.id)
    );
  }, [skillsList?.data, skillsData, learningData]);

  if (!user) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="w-full">
      {/* ================= HEADER ================= */}
      <div className="bg-linear-to-r from-[#1a1a1a] via-[#3b0a14] to-[#e80339] text-white py-12">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-6">
          <FormProvider {...methods}>
            <div className="flex flex-col items-center">
              {isReadOnly ? (
                <Avatar className="h-24 w-24 text-3xl border-4 border-white overflow-hidden">
                  <AvatarImage
                    src={previewUrl || ""}
                    alt={user?.fullName}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gray-600 text-white">
                    {getInitials(user?.fullName)}
                  </AvatarFallback>
                </Avatar>
              ) : (
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
              )}
            </div>
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 space-y-6 sm:space-y-8 pb-6 sm:pb-8">
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
        {user.role !== "admin" && (
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
                        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-md">
                          <Award className="h-3 w-3 text-yellow-600" />
                          <Input
                            value={editingCertName}
                            onChange={(e) => setEditingCertName(e.target.value)}
                            className="h-6 px-2 py-0 text-sm border-yellow-500/30 focus:border-yellow-500 flex-1 bg-transparent"
                            placeholder="Certificate name"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSaveCertificate(cert.id);
                              } else if (e.key === "Escape") {
                                handleCancelEdit();
                              }
                            }}
                          />
                          <Select
                            value={editingCertStatus}
                            onOpenChange={preserveScroll}
                            onValueChange={(
                              value: "preparation" | "completed"
                            ) => setEditingCertStatus(value)}
                          >
                            <SelectTrigger className="h-6 w-[130px] text-xs">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="preparation">
                                Preparation
                              </SelectItem>
                              <SelectItem value="completed">
                                Completed
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {!isReadOnly && (
                            <>
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
                            </>
                          )}
                        </div>
                      ) : (
                        <>
                          <Badge className="relative bg-yellow-500 text-white uppercase transition-all duration-150 group-hover:pr-12">
                            <Award className="h-3 w-3 mr-1" />
                            {cert?.name}
                            {!isReadOnly && (
                              <div className="absolute right-1 top-1/2 z-10 flex -translate-y-1/2 items-center gap-0.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-4 w-4 p-0 hover:bg-yellow-600"
                                  onClick={() =>
                                    handleEditCertificate(
                                      cert.id,
                                      cert.name,
                                      cert.status || "preparation"
                                    )
                                  }
                                >
                                  <Pencil className="h-2.5 w-2.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-4 w-4 p-0 hover:bg-yellow-600"
                                  onClick={() =>
                                    handleDeleteCertificate(cert.id)
                                  }
                                >
                                  <X className="h-2.5 w-2.5" />
                                </Button>
                              </div>
                            )}
                          </Badge>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No certificates added yet
                  </p>
                )}
              </div>

              {!isReadOnly && (
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
                  <Select
                    value={status}
                    onOpenChange={preserveScroll}
                    onValueChange={(value: "preparation" | "completed") =>
                      setStatus(value)
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preparation">Preparation</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
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
              )}
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
                    💡 Special Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skillsData.length > 0 ? (
                      skillsData.map((item, i) => {
                        const skillRefId = getSkillReferenceId(item, "skill");
                        const skillId = item?.skill?.id ?? `skill-${i}`;
                        const isEditing =
                          skillEditingKey === getSkillEditKey(skillId, "skill");

                        return (
                          <div
                            key={String(skillRefId ?? skillId)}
                            className="relative group"
                          >
                            {isEditing ? (
                              <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-md">
                                <Code className="h-3 w-3 text-yellow-600" />
                                <div className="min-w-[150px]">
                                  <CreatableSkillsSelect
                                    options={filteredSkillOptions}
                                    selected={editingSkillValue}
                                    onChange={setEditingSkillValue}
                                    onCreateSkill={handleCreateSkill}
                                    onOpenChange={preserveScroll}
                                    loading={skillsLoading}
                                    creating={isCreatingSkill}
                                    placeholder="Skill"
                                    maxSelectedShow={1}
                                  />
                                </div>
                                <Select
                                  value={editingSkillType}
                                  onOpenChange={preserveScroll}
                                  onValueChange={(
                                    value: "skill" | "learning"
                                  ) => setEditingSkillType(value)}
                                >
                                  <SelectTrigger className="h-8 w-[130px] text-xs">
                                    <SelectValue placeholder="Type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="skill">Skill</SelectItem>
                                    <SelectItem value="learning">
                                      Want to Learn
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={handleSaveSkillReference}
                                    disabled={isUpdatingSkillReference}
                                  >
                                    <Check className="h-3 w-3 text-green-600" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={handleCancelSkillEdit}
                                  >
                                    <X className="h-3 w-3 text-red-600" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Badge className="relative bg-blue-500 text-white uppercase transition-all duration-150 group-hover:pr-12">
                                <span className="inline-flex items-center">
                                  {item?.skill?.skillName}
                                </span>
                                {!isReadOnly && (
                                  <div className="absolute right-1 top-1/2 z-10 flex -translate-y-1/2 items-center gap-0.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-4 w-4 p-0 hover:bg-blue-600"
                                      onClick={() =>
                                        handleEditSkill(
                                          skillRefId,
                                          item?.skill,
                                          "skill"
                                        )
                                      }
                                    >
                                      <Pencil className="h-2.5 w-2.5" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-4 w-4 p-0 hover:bg-blue-600"
                                      onClick={() =>
                                        handleDeleteSkill(
                                          item?.skill?.id,
                                          "skill"
                                        )
                                      }
                                    >
                                      <X className="h-2.5 w-2.5" />
                                    </Button>
                                  </div>
                                )}
                              </Badge>
                            )}
                          </div>
                        );
                      })
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
                      learningData.map((item, i) => {
                        const skillRefId = getSkillReferenceId(
                          item,
                          "learning"
                        );
                        const skillId = item?.skill?.id ?? `learning-${i}`;
                        const isEditing =
                          skillEditingKey ===
                          getSkillEditKey(skillId, "learning");

                        return (
                          <div
                            key={String(skillRefId ?? skillId)}
                            className="relative group"
                          >
                            {isEditing ? (
                              <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-md">
                                <Code className="h-3 w-3 text-yellow-600" />
                                <div className="min-w-[150px]">
                                  <CreatableSkillsSelect
                                    options={filteredSkillOptions}
                                    selected={editingSkillValue}
                                    onChange={setEditingSkillValue}
                                    onCreateSkill={handleCreateSkill}
                                    onOpenChange={preserveScroll}
                                    loading={skillsLoading}
                                    creating={isCreatingSkill}
                                    placeholder="Skill"
                                    maxSelectedShow={1}
                                  />
                                </div>
                                <Select
                                  value={editingSkillType}
                                  onOpenChange={preserveScroll}
                                  onValueChange={(
                                    value: "skill" | "learning"
                                  ) => setEditingSkillType(value)}
                                >
                                  <SelectTrigger className="h-8 w-[130px] text-xs">
                                    <SelectValue placeholder="Type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="skill">Skill</SelectItem>
                                    <SelectItem value="learning">
                                      Want to Learn
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={handleSaveSkillReference}
                                    disabled={isUpdatingSkillReference}
                                  >
                                    <Check className="h-3 w-3 text-green-600" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={handleCancelSkillEdit}
                                  >
                                    <X className="h-3 w-3 text-red-600" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Badge className="relative bg-yellow-400 text-black uppercase transition-all duration-150 group-hover:pr-12">
                                <span className="inline-flex items-center">
                                  {item?.skill?.skillName}
                                </span>
                                {!isReadOnly && (
                                  <div className="absolute right-1 top-1/2 z-10 flex -translate-y-1/2 items-center gap-0.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-4 w-4 p-0 hover:bg-yellow-600"
                                      onClick={() =>
                                        handleEditSkill(
                                          skillRefId,
                                          item?.skill,
                                          "learning"
                                        )
                                      }
                                    >
                                      <Pencil className="h-2.5 w-2.5" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-4 w-4 p-0 hover:bg-yellow-300"
                                      onClick={() =>
                                        handleDeleteSkill(
                                          item?.skill?.id,
                                          "learning"
                                        )
                                      }
                                    >
                                      <X className="h-2.5 w-2.5" />
                                    </Button>
                                  </div>
                                )}
                              </Badge>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No skills added yet
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Add Skill with Type */}
              {!isReadOnly && (
                <div className="border-t pt-6 flex gap-3 items-end">
                  <div className="flex-1">
                    <CreatableSkillsSelect
                      options={filteredSkillOptions}
                      selected={selectedSkills}
                      onChange={setSelectedSkills}
                      onCreateSkill={handleCreateSkill}
                      onOpenChange={preserveScroll}
                      loading={skillsLoading}
                      creating={isCreatingSkill}
                      placeholder="e.g., React, Node.js, Docker..."
                      maxSelectedShow={3}
                    />
                  </div>
                  <Select
                    value={skillType}
                    onOpenChange={preserveScroll}
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
                    onClick={async () => {
                      if (selectedSkills.length > 0) {
                        await Promise.all(
                          selectedSkills.map((skill) =>
                            handleAddSkillWithType(skill)
                          )
                        );
                        // Clear selection after all skills are added
                        setSelectedSkills([]);
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
              )}
            </CardContent>
          </Card>
        )}

        {/* ================= PROJECT VIEW PREFERENCE ================= */}
        {!isReadOnly && (
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
                <div className="flex items-center gap-2">
                  <LayoutGrid
                    className={`h-5 w-5 ${
                      projectViewType === "grid"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />

                  <Switch
                    checked={projectViewType === "grid"}
                    onCheckedChange={(val) =>
                      handleProjectViewToggle(val ? "grid" : "list")
                    }
                  />

                  <List
                    className={`h-5 w-5 ${
                      projectViewType === "list"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
        {!isReadOnly && (
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
        )}
      </div>

      {!isReadOnly && (
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
              <Button
                variant="outline"
                onClick={() => setShowCropDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCrop}>Crop & Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
