import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "danger";
};

/**
 * Reusable Button component
 * - Handles loading states with spinner + text
 * - Centralizes Tailwind styles for consistency
 * - Accessible: aria-busy + disabled
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      isLoading = false,
      loadingText,
      variant = "primary",
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center rounded-full h-12 px-6 font-semibold transition-colors duration-150 " +
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/30 " +
      "disabled:opacity-60 disabled:cursor-not-allowed";

    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary:
        "bg-neutral-900 text-white hover:bg-neutral-700 active:bg-neutral-500",
      secondary:
        "bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400",
      danger: "bg-red-600 text-white hover:bg-red-500 active:bg-red-700",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={`${base} ${variants[variant]} ${className}`}
        {...props}
      >
        {isLoading && (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
        )}
        {isLoading ? loadingText || children : children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
