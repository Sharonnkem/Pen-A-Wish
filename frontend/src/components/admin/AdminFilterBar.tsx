import type { FormEvent, ReactNode } from "react";

import { Button } from "../common/Button";
import { Input } from "../forms/Input";

type AdminFilterBarProps = {
  onReset?: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  searchPlaceholder: string;
  searchValue: string;
  setSearchValue: (value: string) => void;
  trailing?: ReactNode;
};

export function AdminFilterBar({
  onReset,
  onSubmit,
  searchPlaceholder,
  searchValue,
  setSearchValue,
  trailing
}: AdminFilterBarProps) {
  return (
    <form
      className="rounded-[28px] border border-white/70 bg-white/82 p-4 shadow-card sm:p-5"
      onSubmit={onSubmit}
    >
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)_auto] xl:items-center">
        <Input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder={searchPlaceholder}
        />
        <div className="min-w-0">{trailing}</div>
        <div className="flex flex-wrap gap-3 xl:justify-end">
          <Button type="submit">Apply filters</Button>
          {onReset ? (
            <Button type="button" variant="secondary" onClick={onReset}>
              Reset
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
