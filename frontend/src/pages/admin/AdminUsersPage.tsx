import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

import { AdminFilterBar } from "../../components/admin/AdminFilterBar";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { Card } from "../../components/cards/Card";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingState } from "../../components/common/LoadingState";
import { Select, SelectOption } from "../../components/forms/Select";
import { adminService } from "../../services/admin.service";
import { formatNairaFromKobo } from "../../utils/currency";

export function AdminUsersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [role, setRole] = useState<"all" | "admin" | "user">("all");
  const [page, setPage] = useState(1);

  const usersQuery = useQuery({
    queryFn: () =>
      adminService.getUsers({
        page,
        pageSize: 12,
        q: appliedSearch || undefined,
        role
      }),
    queryKey: ["admin-users", page, appliedSearch, role]
  });

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(searchInput.trim());
  }

  function resetFilters() {
    setSearchInput("");
    setAppliedSearch("");
    setRole("all");
    setPage(1);
  }

  const users = usersQuery.data?.data.users ?? [];
  const pagination = usersQuery.data?.data.pagination;

  return (
    <AdminLayout
      title="Platform users"
      subtitle="View account activity, role mix, celebration ownership, and creator-level gift totals in one warm review surface."
    >
      <div className="space-y-6">
        <AdminFilterBar
          onSubmit={applyFilters}
          onReset={resetFilters}
          searchPlaceholder="Search by user name or email"
          searchValue={searchInput}
          setSearchValue={setSearchInput}
          trailing={
            <Select value={role} onChange={(event) => setRole(event.target.value as typeof role)}>
              <SelectOption value="all">All roles</SelectOption>
              <SelectOption value="user">Users</SelectOption>
              <SelectOption value="admin">Admins</SelectOption>
            </Select>
          }
        />

        {usersQuery.isLoading ? <LoadingState label="Loading admin users..." /> : null}

        {usersQuery.isError ? (
          <EmptyState
            title="Unable to load users"
            description="We could not fetch the user list right now."
            actionLabel="Try again"
            onAction={() => void usersQuery.refetch()}
          />
        ) : null}

        {!usersQuery.isLoading && !usersQuery.isError && !users.length ? (
          <EmptyState
            title="No users found"
            description="Try a different search phrase or role filter."
          />
        ) : null}

        {!!users.length ? (
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => (
              <Card
                key={user.id}
                tone={user.role === "admin" ? "plum" : "paper"}
                eyebrow={user.role}
                title={user.name}
                description={user.email}
              >
                <div className="grid gap-3 text-sm leading-7">
                  <p>
                    Celebrations owned: <span className="font-semibold">{user.celebrationsCount}</span>
                  </p>
                  <p>
                    Successful gifts received:{" "}
                    <span className="font-semibold">
                      {formatNairaFromKobo(user.totalGiftsKobo)}
                    </span>
                  </p>
                  <p>Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : null}

        {pagination ? <AdminPagination meta={pagination} onPageChange={setPage} /> : null}
      </div>
    </AdminLayout>
  );
}
