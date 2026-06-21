import type { AdminPagination as AdminPaginationMeta } from "@/types/admin";

import { Button } from "@/components/common/Button";

type AdminPaginationProps = {
  meta: AdminPaginationMeta;
  onPageChange: (page: number) => void;
};

export function AdminPagination({ meta, onPageChange }: AdminPaginationProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-white/70 bg-white/80 px-4 py-4 shadow-card sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-sm leading-6 text-charcoal-900/68">
        Showing page {meta.page} of {meta.totalPages} with {meta.totalItems} total records.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
