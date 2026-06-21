import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

import { cn } from "../../utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
  }
>;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-plum-800 text-white shadow-[0_16px_40px_rgba(67,34,53,0.22)] hover:-translate-y-0.5 hover:bg-plum-700",
  secondary:
    "border border-plum-700/15 bg-white/90 text-plum-800 shadow-[0_16px_32px_rgba(67,34,53,0.08)] hover:-translate-y-0.5 hover:border-plum-700/25 hover:bg-cream-50",
  ghost:
    "bg-transparent text-plum-800 hover:-translate-y-0.5 hover:bg-white/60"
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-12 px-5 text-sm sm:text-[15px]",
  lg: "min-h-14 px-6 text-base"
};

export function Button({
  children,
  className,
  fullWidth,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

