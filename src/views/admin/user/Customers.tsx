import { useState, useEffect, useCallback } from "react";
import { FiLock, FiUnlock, FiDownload } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import adminUserService from "@/apis/services/adminUserService";
import {
  Button,
  ActionButtons,
  CustomSelect,
  AdminSearch,
  Pagination,
  StatusBadge,
  TableRowSkeleton,
  UserAvatar,
} from "@/components";
import type { UserResponse, PageResponse } from "@/types";
import { PAGE_SIZE } from "@/constants/paginationConstants";
import { formatDate } from "@/utils/format";
import { downloadBlob } from "@/utils/download";
import { getPaginatedRowNumber } from "@/utils/helpers";
import { getApiErrorMessage } from "@/utils/error";

export default function Customers() {
  const { t } = useTranslation(["adminCustomers", "common"]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState<PageResponse<UserResponse> | null>(
    null,
  );

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminUserService.getAll({
        keyword: searchQuery || undefined,
        role: roleFilter || undefined,
        page,
        size: PAGE_SIZE.LARGE,
      });
      setPageData(res.data);
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast.error(getApiErrorMessage(err, t, "adminCustomers:customers.toasts.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, searchQuery, t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (id: string) => {
    try {
      await adminUserService.toggleStatus(id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? { ...u, status: u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
            : u,
        ),
      );
      toast.success(t("adminCustomers:customers.toasts.toggleSuccess"));
    } catch (err) {
      console.error("Toggle status failed:", err);
      toast.error(getApiErrorMessage(err, t, "adminCustomers:customers.toasts.toggleFailed"));
    }
  };

  const handleExport = async () => {
    try {
      const blob = await adminUserService.export({
        keyword: searchQuery || undefined,
        role: roleFilter || undefined,
      });
      downloadBlob(blob, "users.xlsx");
      toast.success(t("adminCustomers:customers.toasts.exportSuccess"));
    } catch (err) {
      console.error("Export failed:", err);
      toast.error(getApiErrorMessage(err, t, "adminCustomers:customers.toasts.exportFailed"));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">{t("adminCustomers:customers.title")}</h1>
        <Button
          onClick={handleExport}
          variant="success"
          size="md"
          icon={<FiDownload />}
          className="w-full sm:w-auto"
        >
          {t("adminCustomers:customers.export")}
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <AdminSearch
            boxed={false}
            placeholder={t("adminCustomers:customers.searchPlaceholder")}
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setPage(1);
            }}
          />
        </div>
        <CustomSelect
          value={roleFilter}
          onChange={(val) => {
            setRoleFilter(val);
            setPage(1);
          }}
          options={[
            { value: "", label: t("adminCustomers:customers.filters.allRoles") },
            { value: "USER", label: t("adminCustomers:customers.filters.customer") },
            { value: "ADMIN", label: t("adminCustomers:customers.filters.admin") },
          ]}
          className="w-full md:w-48 shrink-0"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-md divide-x divide-slate-200 dark:divide-slate-700">
                <th className="p-3 sm:p-4 font-medium text-center w-20">{t("adminCustomers:customers.table.index")}</th>
                <th className="p-3 sm:p-4 font-medium">{t("adminCustomers:customers.table.user")}</th>
                <th className="p-3 sm:p-4 font-medium">{t("adminCustomers:customers.table.email")}</th>
                <th className="p-3 sm:p-4 font-medium">{t("adminCustomers:customers.table.phone")}</th>
                <th className="p-3 sm:p-4 font-medium text-center">{t("adminCustomers:customers.table.role")}</th>
                <th className="p-3 sm:p-4 font-medium text-center">{t("adminCustomers:customers.table.createdAt")}</th>
                <th className="p-3 sm:p-4 font-medium text-center">
                  {t("adminCustomers:customers.table.status")}
                </th>
                <th className="p-3 sm:p-4 font-medium text-center">{t("adminCustomers:customers.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton rows={5} cols={8} />
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="p-12 text-center text-slate-400 border-b border-slate-200 dark:border-slate-700"
                  >
                    {t("adminCustomers:customers.table.empty")}
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors divide-x divide-slate-200 dark:divide-slate-700"
                  >
                    <td className="p-3 sm:p-4 text-center font-semibold text-slate-400">
                      {getPaginatedRowNumber(page, PAGE_SIZE.LARGE, index)}
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.fullName} src={user.avatarUrl} />
                        <span className="font-bold">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-slate-500">{user.email}</td>
                    <td className="p-3 sm:p-4 text-slate-500">
                      {user.phoneNumber || t("common:labels.notAvailable")}
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <StatusBadge
                        status={user.role === "ADMIN" ? "admin" : "user"}
                      />
                    </td>
                    <td className="p-3 sm:p-4 text-slate-500 text-center">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <StatusBadge
                        status={user.status === "ACTIVE" ? "active" : "banned"}
                        label={
                          user.status === "ACTIVE"
                            ? t("adminCustomers:customers.statuses.active")
                            : t("adminCustomers:customers.statuses.locked")
                        }
                      />
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <ActionButtons
                        actions={[
                          {
                            type: "view",
                            href: `/admin/customers/${user.id}`,
                          },
                          {
                            type: user.status === "ACTIVE" ? "delete" : "edit",
                            onClick: () => handleToggleStatus(user.id),
                            icon:
                              user.status === "ACTIVE" ? (
                                <FiLock />
                              ) : (
                                <FiUnlock />
                              ),
                            title:
                              user.status === "ACTIVE"
                                ? t("adminCustomers:customers.actions.lock")
                                : t("adminCustomers:customers.actions.unlock"),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pageData && (
          <Pagination
            variant="admin"
            currentPage={page}
            totalPages={pageData.lastPage}
            totalItems={pageData.total}
            perPage={PAGE_SIZE.LARGE}
            label={t("adminCustomers:customers.labels.pagination")}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
