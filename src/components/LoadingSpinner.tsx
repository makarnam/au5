import React from "react";
import { cn } from "../utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  variant?: "default" | "dots" | "pulse";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
  text,
  variant = "default",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const borderClasses = {
    sm: "border-2",
    md: "border-2",
    lg: "border-4",
    xl: "border-4",
  };

  if (variant === "dots") {
    const dotSize = {
      sm: "w-1.5 h-1.5",
      md: "w-2 h-2",
      lg: "w-2.5 h-2.5",
      xl: "w-3 h-3",
    };

    return (
      <div
        className={cn("flex flex-col items-center justify-center", className)}
      >
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "bg-blue-600 rounded-full animate-bounce-gentle",
                dotSize[size],
              )}
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
        {text && (
          <p
            className={cn(
              "mt-3 text-gray-600 font-medium",
              textSizeClasses[size],
            )}
          >
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div
        className={cn("flex flex-col items-center justify-center", className)}
      >
        <div
          className={cn(
            "bg-blue-600 rounded-full animate-pulse-soft",
            sizeClasses[size],
          )}
        />
        {text && (
          <p
            className={cn(
              "mt-3 text-gray-600 font-medium",
              textSizeClasses[size],
            )}
          >
            {text}
          </p>
        )}
      </div>
    );
  }

  // Default spinner
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div
        className={cn(
          "border-gray-200 border-t-blue-600 rounded-full animate-spin-smooth",
          sizeClasses[size],
          borderClasses[size],
        )}
      />
      {text && (
        <p
          className={cn(
            "mt-3 text-gray-600 font-medium animate-fade-in",
            textSizeClasses[size],
          )}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
