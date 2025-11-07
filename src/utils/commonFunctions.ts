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
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
