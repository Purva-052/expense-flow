import { roleLabels } from "./constant";

export const getFormattedDate = (date: Date) => {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
  return formattedDate;
};

export const capitalizeFirstLetter = (str: string | undefined | null) => {
  if (!str || str.length === 0 || str.trim().length === 0) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatRole = (str: string = "") => {
  if (!str || str.length === 0 || str.trim().length === 0) return "";
  return roleLabels[str]
    ? roleLabels[str]
    : str
        .split("_")
        .map((word: string) => word[0].toUpperCase() + word.slice(1))
        .join(" ");
};

export const preventNegativeInput = (
  e: React.KeyboardEvent<HTMLInputElement> | React.WheelEvent<HTMLInputElement>
) => {
  // Block minus sign typing
  if ("key" in e && e.key === "-") {
    e.preventDefault();
  }
};

export const preventNegativePaste = (
  e: React.ClipboardEvent<HTMLInputElement>
) => {
  const pasted = e.clipboardData.getData("text");
  if (pasted.includes("-")) {
    e.preventDefault();
  }
};
