import type { TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";

import { cn } from "../../utils/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hasError?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, hasError, rows = 5, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "w-full rounded-[24px] border bg-white/90 px-4 py-3.5 text-sm text-charcoal-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition duration-200 placeholder:text-charcoal-900/35 focus:border-plum-700/35 focus:ring-4 focus:ring-blush-100/70",
          hasError
            ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
            : "border-plum-700/12",
          className
        )}
        {...props}
      />
    );
  }
);

