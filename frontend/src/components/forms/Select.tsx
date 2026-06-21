import type { OptionHTMLAttributes, SelectHTMLAttributes } from "react";
import { forwardRef } from "react";

import { cn } from "@/utils/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  hasError?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { children, className, hasError, ...props },
  ref
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "w-full appearance-none rounded-[24px] border bg-white/90 px-4 py-3.5 pr-11 text-sm text-charcoal-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition duration-200 focus:border-plum-700/35 focus:ring-4 focus:ring-blush-100/70",
          hasError
            ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
            : "border-plum-700/12",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-plum-700/70">
        <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M5.5 7.5 10 12l4.5-4.5" />
        </svg>
      </span>
    </div>
  );
});

export function SelectOption(props: OptionHTMLAttributes<HTMLOptionElement>) {
  return <option {...props} />;
}

