import { AnimatePresence, motion } from "framer-motion";
import type { PropsWithChildren, ReactNode } from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/common/Button";

type ModalProps = PropsWithChildren<{
  description?: string;
  footer?: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}>;

export function Modal({
  children,
  description,
  footer,
  isOpen,
  onClose,
  title
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <motion.button
            aria-label="Close modal overlay"
            className="absolute inset-0 bg-charcoal-900/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-[32px] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,238,228,0.94)_100%)] p-6 shadow-[0_30px_90px_rgba(31,29,31,0.24)] sm:p-7"
          >
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/80 to-transparent" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl leading-tight text-plum-800">
                  {title}
                </h2>
                {description ? (
                  <p className="mt-3 max-w-lg text-sm leading-7 text-charcoal-900/70">
                    {description}
                  </p>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 rounded-full p-0"
                onClick={onClose}
              >
                <span aria-hidden="true">x</span>
              </Button>
            </div>
            <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">{children}</div>
            {footer ? <div className="mt-6 shrink-0">{footer}</div> : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
