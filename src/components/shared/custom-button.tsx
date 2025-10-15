import { LoaderCircle, LucideIcon } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface CustomButtonProps {
  loading?: boolean;
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  btnType?: "default" | "icon";
  [key: string]: unknown;
}

const CustomButton = ({
  loading = false,
  children,
  type = "submit",
  onClick = () => {},
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  fullWidth = false,
  disabled = false,
  className,
  btnType = "default",
  ...props
}: CustomButtonProps) => {
  // Define variant styles
  const variantStyles = {
    submit:
      "bg-gradient-primary text-primary-foreground text-white border-none",
    primary:
      "bg-gradient-primary text-primary-foreground text-white border-none",
    secondary:
      "bg-gradient-primary bg-gray-200 text-gray-900 hover:bg-gray-300 border-none",
    outline:
      "bg-transparent text-primary border border-primary hover:bg-primary/10",
    ghost: "bg-transparent text-primary hover:bg-primary/10 border-none",
  };

  // Define size styles for the button
  const sizeStyles = {
    sm: btnType === "icon" ? "h-8 w-8" : "h-8 px-3 text-sm",
    md: btnType === "icon" ? "h-10 w-10" : "h-10 px-4 text-base",
    lg: btnType === "icon" ? "h-12 w-12" : "h-12 px-6 text-lg",
  };

  // Define icon size based on button size
  const iconSizeStyles = {
    sm: "h-4 w-4", // Smaller icon for small buttons
    md: "h-5 w-5", // Medium icon for medium buttons
    lg: "h-6 w-6", // Larger icon for large buttons
  };

  return (
    <Button
      className={cn(
        "flex cursor-pointer items-center justify-center gap-2 transition-all duration-200",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? "w-full" : "w-fit",
        disabled && "cursor-not-allowed opacity-50",
        btnType === "icon" && "rounded-full p-0",
        className
      )}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={props["aria-label"] as string | undefined}
      {...props}
    >
      <React.Fragment key={"custom-button"}>
        {loading && (
          <LoaderCircle
            className={cn(
              btnType !== "icon" && iconPosition === "left"
                ? "order-first"
                : "order-last",
              iconSizeStyles[size],
              "animate-spin"
            )}
          />
        )}
        {!loading && Icon && (
          <Icon
            className={cn(
              btnType !== "icon" && iconPosition === "left"
                ? "order-first"
                : "order-last",
              iconSizeStyles[size]
            )}
          />
        )}
        {btnType !== "icon" && <span>{children}</span>}
      </React.Fragment>
    </Button>
  );
};

export default CustomButton;
