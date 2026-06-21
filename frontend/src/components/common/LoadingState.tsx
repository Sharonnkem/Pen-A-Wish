import { motion } from "framer-motion";

import { cn } from "../../utils/cn";

type LoadingStateProps = {
  className?: string;
  label?: string;
};

export function LoadingState({
  className,
  label = "Gathering the sweetest details for this page..."
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/65 bg-white/80 p-6 shadow-card sm:p-7",
        className
      )}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative h-12 w-12 shrink-0">
          <motion.span
            className="absolute inset-0 rounded-full border-4 border-blush-100"
            animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            className="absolute inset-2 rounded-full bg-plum-800"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-charcoal-900">{label}</p>
          <p className="mt-1 text-sm text-charcoal-900/60">
            Please hold on while the experience comes together.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="rounded-[22px] border border-white/70 bg-cream-50/72 p-4"
              >
                <motion.div
                  className="h-3 rounded-full bg-white"
                  animate={{ opacity: [0.45, 0.9, 0.45] }}
                  transition={{ duration: 1.3, repeat: Infinity, delay: index * 0.12 }}
                />
                <motion.div
                  className="mt-4 h-8 w-2/3 rounded-full bg-white"
                  animate={{ opacity: [0.45, 0.9, 0.45] }}
                  transition={{ duration: 1.3, repeat: Infinity, delay: index * 0.12 + 0.08 }}
                />
                <motion.div
                  className="mt-4 h-3 w-5/6 rounded-full bg-white"
                  animate={{ opacity: [0.45, 0.9, 0.45] }}
                  transition={{ duration: 1.3, repeat: Infinity, delay: index * 0.12 + 0.16 }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
