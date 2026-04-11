import { useState, useEffect, useCallback } from 'react';
import { FiLock, FiUnlock, FiDownload, FiEye } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import adminUserService from '@/apis/services/adminUserService';
import { Button, IconButton, CustomSelect, AdminSearch, AdminPagination, StatusBadge, TableRowSkeleton, UserAvatar } from '@/components';
import type { UserResponse, PageResponse } from '@/types';
import { PAGE_SIZE } from '@/constants/paginationConstants';
import { formatDate } from '@/utils/format';
import { downloadBlob } from '@/utils/download';

export default function Customers() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState<PageResponse<UserResponse> | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminUserService.getAll({
        keyword: searchQuery || undefined,
        role: roleFilter || undefined,
        page, size: PAGE_SIZE.LARGE,
      });
      setPageData(res.data);
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      toast.error('Tải danh sách người dùng thất bại!');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, roleFilter, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleStatus = async (id: string) => {
    try {
      await adminUserService.toggleStatus(id);
      setUsers(prev => prev.map(u =>
        u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u
      ));
      toast.success('Cập nhật trạng thái người dùng thành công!');
    } catch (err) {
      console.error('Toggle status failed:', err);
      toast.error('Cập nhật trạng thái người dùng thất bại!');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await adminUserService.export({ keyword: searchQuery || undefined, role: roleFilter || undefined });
      downloadBlob(blob, 'users.xlsx');
    } catch (err) { console.error('Export failed:', err); toast.error('Xuất báo cáo thất bại!'); }
  };



  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Quản lý khách hàng</h1>
        <Button onClick={handleExport} variant="success" size="md" icon={<FiDownload />} className="w-full sm:w-auto">
          Xuất danh sách
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <AdminSearch
            placeholder="Tìm kiếm theo tên, email, SĐT..."
            value={searchQuery}
            onChange={(val) => { setSearchQuery(val); setPage(1); }}
          />
        </div>
        <CustomSelect 
          value={roleFilter} 
          onChange={(val) => { setRoleFilter(val); setPage(1); }}
          options={[
            { value: '', label: 'Tất cả vai trò' },
            { value: 'USER', label: 'Khách hàng' },
            { value: 'ADMIN', label: 'Admin' }
          ]}
          className="w-full md:w-48 shrink-0"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-md">
                <th className="p-3 sm:p-4 font-medium">Người dùng</th>
                <th className="p-3 sm:p-4 font-medium">Email</th>
                <th className="p-3 sm:p-4 font-medium">SĐT</th>
                <th className="p-3 sm:p-4 font-medium">Vai trò</th>
                <th className="p-3 sm:p-4 font-medium">Ngày tạo</th>
                <th className="p-3 sm:p-4 font-medium">Trạng thái</th>
                <th className="p-3 sm:p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton rows={5} cols={7} />
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-slate-400">Không có người dùng nào</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.fullName} src={user.avatarUrl} />
                        <span className="font-bold">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-slate-500">{user.email}</td>
                    <td className="p-3 sm:p-4 text-slate-500">{user.phoneNumber || '—'}</td>
                    <td className="p-3 sm:p-4">
                      <StatusBadge status={user.role === 'ADMIN' ? 'admin' : 'user'} />
                    </td>
                    <td className="p-3 sm:p-4 text-slate-500">{formatDate(user.createdAt)}</td>
                    <td className="p-3 sm:p-4">
                      <StatusBadge status={user.status === 'ACTIVE' ? 'active' : 'banned'} label={user.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'} />
                    </td>
                    <td className="p-3 sm:p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/customers/${user.id}`} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg transition-colors" title="Xem chi tiết">
                          <FiEye />
                        </Link>
                        <IconButton onClick={() => handleToggleStatus(user.id)}
                          icon={user.status === 'ACTIVE' ? <FiLock /> : <FiUnlock />}
                          variant={user.status === 'ACTIVE' ? 'danger' : 'primary'}
                          title={user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pageData && (
          <AdminPagination
            currentPage={page}
            totalPages={pageData.lastPage}
            totalItems={pageData.total}
            perPage={PAGE_SIZE.LARGE}
            label="người dùng"
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
