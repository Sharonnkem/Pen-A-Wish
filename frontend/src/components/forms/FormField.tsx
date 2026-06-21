import type { PropsWithChildren, ReactNode } from "react";

import { cn } from "@/utils/cn";

type FormFieldProps = PropsWithChildren<{
  className?: string;
  error?: string;
  helperText?: string;
  label: string;
  labelAdornment?: ReactNode;
}>;

export function FormField({
  children,
  className,
  error,
  helperText,
  label,
  labelAdornment
}: FormFieldProps) {
  return (
    <label className={cn("block space-y-2.5", className)}>
      <span className="flex items-center justify-between gap-3 text-sm font-medium text-charcoal-900">
        <span>{label}</span>
        {labelAdornment}
      </span>
      {children}
      {error ? (
        <p className="text-sm text-rose-700">{error}</p>
      ) : helperText ? (
        <p className="text-sm text-charcoal-900/60">{helperText}</p>
      ) : null}
    </label>
  );
}

