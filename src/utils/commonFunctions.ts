import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";
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

export const getDateRange = (
  calendarView: string,
  currentCalendarDate: any
) => {
  const baseDate = new Date(currentCalendarDate);

  if (calendarView === "month") {
    const monthStart = startOfMonth(baseDate);
    const monthEnd = endOfMonth(baseDate);
    const start = startOfWeek(monthStart);
    const end = endOfWeek(monthEnd);
    return { start, end };
  } else if (calendarView === "week") {
    const start = startOfWeek(baseDate);
    const end = endOfWeek(baseDate);
    return { start, end };
  } else {
    // day view
    const start = new Date(baseDate);
    const end = new Date(baseDate);
    return { start, end };
  }
};
