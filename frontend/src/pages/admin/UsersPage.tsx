import { useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { motion, AnimatePresence } from "framer-motion";
import {
  useAdminUsers,
  useAdminUser,
  useUpdateUser,
  type AdminUser,
} from "../../hooks/useUsers";
import AdminLayout from "../../components/admin/AdminLayout";
import Card from "../../components/ui/Card";
import { TableRowSkeleton } from "../../components/admin/AdminSkeletons";

const UsersPage = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const PER_PAGE = 10;
  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading } = useAdminUsers({
    search: debouncedSearch,
    role: roleFilter,
    status: statusFilter,
    page,
    perPage: PER_PAGE,
  });

  const { data: userDetail, isLoading: isLoadingDetail } =
    useAdminUser(selectedUserId);
  const updateUser = useUpdateUser();

  const users = data?.data ?? [];
  const meta = data?.meta;

  const handleRoleChange = (userId: number, newRole: string) => {
    updateUser.mutate({ id: userId, data: { role: newRole } });
  };

  const handleStatusToggle = (userId: number, currentStatus: string) => {
    updateUser.mutate({
      id: userId,
      data: { status: currentStatus === "active" ? "inactive" : "active" },
    });
  };

  const statusBadge = (status: string) => {
    const styles =
      status === "active"
        ? "text-emerald-400 bg-emerald-500/10"
        : "text-red-400 bg-red-500/10";
    return (
      <span
        className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${styles}`}
      >
        {status}
      </span>
    );
  };

  const roleBadge = (role: string) => {
    const displayRole = role === "user" ? "customer" : role;
    const styles =
      role === "admin"
        ? "text-violet-400 bg-violet-500/10"
        : "text-blue-400 bg-blue-500/10";
    return (
      <span
        className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${styles}`}
      >
        {displayRole}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="w-full px-4 lg:px-8 py-4 lg:py-6 space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Customers
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Manage registered users and their accounts
            </p>
          </div>
          {meta && (
            <div className="text-sm text-[var(--color-text-muted)]">
              {meta.total} total users
            </div>
          )}
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="user">Customer</option>
            <option value="admin">Admin</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
          {/* Users Table */}
          <div className="xl:col-span-2">
            <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="px-3 md:px-5 py-3 md:py-4 text-left text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-3 md:px-5 py-3 md:py-4 text-left text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-3 md:px-5 py-3 md:py-4 text-left text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider hidden sm:table-cell">
                        Status
                      </th>
                      <th className="px-3 md:px-5 py-3 md:py-4 text-left text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider hidden md:table-cell">
                        Orders
                      </th>
                      <th className="px-3 md:px-5 py-3 md:py-4 text-left text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider hidden md:table-cell">
                        Spent
                      </th>
                      <th className="px-3 md:px-5 py-3 md:py-4 text-left text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider hidden lg:table-cell">
                        Joined
                      </th>
                      <th className="px-3 md:px-5 py-3 md:py-4 text-right text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider hidden sm:table-cell">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {isLoading ? (
                      Array.from({ length: 10 }).map((_, i) => (
                        <TableRowSkeleton key={i} columns={7} />
                      ))
                    ) : users.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-12 text-center text-[var(--color-text-muted)]"
                        >
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      users.map((user: AdminUser) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`hover:bg-[var(--color-bg-surface)]/50 transition-colors cursor-pointer ${selectedUserId === user.id ? "bg-[var(--color-bg-surface)]" : ""}`}
                          onClick={() => setSelectedUserId(user.id)}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {user.name?.[0]?.toUpperCase() || "?"}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-[var(--color-text-primary)] truncate flex items-center gap-1.5">
                                  {user.name}
                                  {user.google_id && (
                                    <svg
                                      viewBox="0 0 24 24"
                                      className="w-3.5 h-3.5 flex-shrink-0"
                                      fill="currentColor"
                                    >
                                      <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                        fill="#4285F4"
                                      />
                                      <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                      />
                                      <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                      />
                                      <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                      />
                                    </svg>
                                  )}
                                </div>
                                <div className="text-xs text-[var(--color-text-muted)] truncate">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 md:px-5 py-3 md:py-4">{roleBadge(user.role)}</td>
                          <td className="px-3 md:px-5 py-3 md:py-4 hidden sm:table-cell">
                            {statusBadge(user.status)}
                          </td>
                          <td className="px-3 md:px-5 py-3 md:py-4 text-sm font-semibold text-[var(--color-text-primary)] hidden md:table-cell">
                            {user.orders_count}
                          </td>
                          <td className="px-3 md:px-5 py-3 md:py-4 text-sm font-semibold text-[var(--color-text-primary)] hidden md:table-cell">
                            ${user.total_spent.toLocaleString()}
                          </td>
                          <td className="px-3 md:px-5 py-3 md:py-4 text-xs text-[var(--color-text-muted)] hidden lg:table-cell">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-3 md:px-5 py-3 md:py-4 text-right hidden sm:table-cell">
                            <div
                              className="flex items-center justify-end gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Toggle Status */}
                              <button
                                onClick={() =>
                                  handleStatusToggle(user.id, user.status)
                                }
                                disabled={updateUser.isPending}
                                className={`p-1.5 rounded transition-colors disabled:opacity-50 ${
                                  user.status === "active"
                                    ? "text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-500/10"
                                    : "text-[var(--color-text-muted)] hover:text-emerald-400 hover:bg-emerald-500/10"
                                }`}
                                title={
                                  user.status === "active"
                                    ? "Deactivate User"
                                    : "Activate User"
                                }
                              >
                                {user.status === "active" ? (
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                )}
                              </button>

                              {/* Toggle Role */}
                              <button
                                onClick={() =>
                                  handleRoleChange(
                                    user.id,
                                    user.role === "admin" ? "user" : "admin",
                                  )
                                }
                                disabled={updateUser.isPending}
                                className="p-1.5 text-[var(--color-text-muted)] hover:text-violet-400 hover:bg-violet-500/10 rounded transition-colors disabled:opacity-50"
                                title={
                                  user.role === "admin"
                                    ? "Remove Admin"
                                    : "Make Admin"
                                }
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {meta && meta.last_page > 1 && (
                <div className="p-4 border-t border-[var(--color-border)] flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {Array.from(
                    { length: Math.min(meta.last_page, 5) },
                    (_, i) => {
                      let pageNum: number;
                      if (meta.last_page <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= meta.last_page - 2) {
                        pageNum = meta.last_page - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                            page === pageNum
                              ? "bg-[var(--color-primary)] text-white shadow-lg shadow-blue-500/30"
                              : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    },
                  )}

                  <button
                    onClick={() =>
                      setPage((p) => Math.min(meta.last_page, p + 1))
                    }
                    disabled={page >= meta.last_page}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* User Detail Panel */}
          <AnimatePresence mode="wait">
            {selectedUserId && (
              <motion.div
                key={selectedUserId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 xl:relative xl:inset-auto xl:z-auto xl:col-span-1 bg-black/50 xl:bg-transparent flex items-end xl:items-stretch"
                onClick={(e) => { if (e.target === e.currentTarget) setSelectedUserId(null); }}
              >
                <div className="w-full xl:w-auto max-h-[85vh] xl:max-h-none overflow-y-auto rounded-t-2xl xl:rounded-xl">
                  <Card className="border border-[var(--color-border)] shadow-sm xl:sticky xl:top-28 rounded-t-2xl xl:rounded-xl">
                    <Card.Body className="p-6">
                      {isLoadingDetail ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : userDetail ? (
                        <div className="space-y-6">
                          {/* User Header */}
                          <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3 ring-4 ring-[var(--color-border)]">
                              {userDetail.name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                              {userDetail.name}
                            </h3>
                            <p className="text-sm text-[var(--color-text-muted)]">
                              {userDetail.email}
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-2">
                              {roleBadge(userDetail.role)}
                              {statusBadge(userDetail.status)}
                            </div>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 bg-[var(--color-bg-surface)] rounded-lg">
                              <div className="text-lg font-bold text-[var(--color-text-primary)]">
                                {userDetail.stats.total_orders}
                              </div>
                              <div className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold">
                                Orders
                              </div>
                            </div>
                            <div className="text-center p-3 bg-[var(--color-bg-surface)] rounded-lg">
                              <div className="text-lg font-bold text-[var(--color-text-primary)]">
                                ${userDetail.stats.total_spent.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold">
                                Spent
                              </div>
                            </div>
                            <div className="text-center p-3 bg-[var(--color-bg-surface)] rounded-lg">
                              <div className="text-lg font-bold text-[var(--color-text-primary)]">
                                {userDetail.stats.last_order_at
                                  ? new Date(
                                  userDetail.stats.last_order_at,
                                    ).toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : "Never"}
                              </div>
                              <div className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold">
                                Last Order
                              </div>
                            </div>
                          </div>

                          {/* Actions Panel */}
                          <div className="pt-4 border-t border-[var(--color-border)]">
                            <h4 className="text-[10px] md:text-xs font-bold text-[var(--color-text-muted)] w-full text-center uppercase tracking-wider mb-2">
                              Actions
                            </h4>
                            <div className="flex gap-2 w-full mt-2">
                              {/* Change Role Button */}
                              <button
                                onClick={() => {
                                  handleRoleChange(userDetail.id, userDetail.role === 'admin' ? 'user' : 'admin');
                                  setSelectedUserId(null); // Optional: close panel
                                }}
                                disabled={updateUser.isPending}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 md:py-2.5 bg-[var(--color-bg-surface)] hover:bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg text-[11px] md:text-xs font-semibold transition-colors border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 disabled:opacity-50"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                </svg>
                                {userDetail.role === 'admin' ? 'Make User' : 'Make Admin'}
                              </button>
                                
                              {/* Suspend/Activate Button */}
                              <button
                                onClick={() => {
                                  handleStatusToggle(userDetail.id, userDetail.status);
                                  setSelectedUserId(null); // Optional: close panel
                                }}
                                disabled={updateUser.isPending}
                                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 md:py-2.5 bg-[var(--color-bg-surface)] rounded-lg text-[11px] md:text-xs font-semibold transition-colors border border-[var(--color-border)] disabled:opacity-50 ${userDetail.status === 'active' ? 'text-red-500 hover:bg-red-500/10 hover:border-red-500/30' : 'text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/30'}`}
                              >
                                {userDetail.status === "active" ? (
                                  <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                    Suspend
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Activate
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-[var(--color-text-muted)]">
                                Joined
                              </span>
                              <span className="text-[var(--color-text-primary)] font-medium">
                                {new Date(
                                  userDetail.created_at,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-[var(--color-text-muted)]">
                                Auth Method
                              </span>
                              <span className="text-[var(--color-text-primary)] font-medium">
                                {userDetail.google_id
                                  ? "Google OAuth"
                                  : "Email/Password"}
                              </span>
                            </div>
                          </div>

                          {/* Recent Orders */}
                          {userDetail.orders.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                                Recent Orders
                              </h4>
                              <div className="space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar">
                                {userDetail.orders
                                  .slice(0, 10)
                                  .map((order) => {
                                    const statusColor =
                                      order.status === "completed"
                                        ? "text-emerald-400"
                                        : order.status === "cancelled"
                                          ? "text-red-400"
                                          : order.status === "processing" ||
                                              order.status === "shipped"
                                            ? "text-blue-400"
                                            : "text-amber-400";
                                    return (
                                      <div
                                        key={order.id}
                                        className="flex items-center justify-between p-3 bg-[var(--color-bg-surface)] rounded-lg"
                                      >
                                        <div>
                                          <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                                            #{order.tracking_id || order.id}
                                          </div>
                                          <div className="text-[10px] text-[var(--color-text-muted)]">
                                            {new Date(
                                              order.created_at,
                                            ).toLocaleDateString()}{" "}
                                            · {order.items_count} item
                                            {order.items_count !== 1
                                              ? "s"
                                              : ""}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-sm font-bold text-[var(--color-text-primary)]">
                                            ${order.total.toFixed(2)}
                                          </div>
                                          <div
                                            className={`text-[10px] font-bold uppercase ${statusColor}`}
                                          >
                                            {order.status}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </Card.Body>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UsersPage;
