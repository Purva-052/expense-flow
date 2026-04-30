import { cn } from "@/lib/utils";

export const COLORS = [
  {
    id: "yellow",
    name: "Yellow",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    border: "border-yellow-200 dark:border-yellow-900/50",
    marker: "bg-yellow-400",
  },
  {
    id: "blue",
    name: "Blue",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    border: "border-blue-200 dark:border-blue-900/50",
    marker: "bg-blue-400",
  },
  {
    id: "green",
    name: "Green",
    bg: "bg-green-100 dark:bg-green-900/30",
    border: "border-green-200 dark:border-green-900/50",
    marker: "bg-green-400",
  },
  {
    id: "pink",
    name: "Pink",
    bg: "bg-pink-100 dark:bg-pink-900/30",
    border: "border-pink-200 dark:border-pink-900/50",
    marker: "bg-pink-400",
  },
  {
    id: "purple",
    name: "Purple",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    border: "border-purple-200 dark:border-purple-900/50",
    marker: "bg-purple-400",
  },
];

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (colorId: string) => void;
}

export const ColorPicker = ({
  selectedColor,
  onColorSelect,
}: ColorPickerProps) => {
  return (
    <div className="flex gap-2">
      {COLORS.map((color) => (
        <button
          key={color.id}
          type="button"
          onClick={() => onColorSelect(color.id)}
          className={cn(
            "w-6 h-6 rounded-full transition-transform hover:scale-110",
            color.marker,
            selectedColor === color.id
              ? "ring-2 ring-offset-2 ring-black/20 scale-110"
              : "opacity-70 hover:opacity-100"
          )}
          title={color.name}
        />
      ))}
    </div>
  );
};
