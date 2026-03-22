import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiLock, FiUnlock, FiDownload, FiEye } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import adminUserService from '@/apis/services/adminUserService';
import type { UserResponse, PageResponse } from '@/types';

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
        page, size: 20,
      });
      setPageData(res.data);
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, roleFilter, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleStatus = async (id: string) => {
    try {
      await adminUserService.toggleStatus(id);
      fetchUsers();
    } catch (err) { console.error('Toggle status failed:', err); }
  };

  const handleExport = async () => {
    try {
      const blob = await adminUserService.export({ keyword: searchQuery || undefined, role: roleFilter || undefined });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'users.xlsx'; a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) { console.error('Export failed:', err); }
  };

  const formatDate = (d: string) => { try { return new Date(d).toLocaleDateString('vi-VN'); } catch { return d; } };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Quản lý khách hàng</h1>
        <button onClick={handleExport} className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-purple-600 dark:hover:bg-purple-500 hover:text-white transition-colors flex items-center justify-center gap-2">
          <FiDownload /> Xuất danh sách
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input type="text" placeholder="Tìm kiếm theo tên, email, SĐT..."
            value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 font-medium outline-none">
          <option value="">Tất cả vai trò</option>
          <option value="USER">Khách hàng</option>
          <option value="ADMIN">Admin</option>
          <option value="SHIPPER">Shipper</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                <th className="p-4 font-medium">Người dùng</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">SĐT</th>
                <th className="p-4 font-medium">Vai trò</th>
                <th className="p-4 font-medium">Ngày tạo</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50 animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="p-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-slate-400">Không có người dùng nào</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold text-sm">
                          {user.avatarUrl ? <img src={user.avatarUrl} className="w-10 h-10 rounded-full object-cover" /> : user.fullName?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-bold">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500">{user.email}</td>
                    <td className="p-4 text-slate-500">{user.phoneNumber || '—'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' :
                        user.role === 'SHIPPER' ? 'bg-blue-100 text-blue-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>{user.role}</span>
                    </td>
                    <td className="p-4 text-slate-500">{formatDate(user.createdAt)}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>{user.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/customers/${user.id}`} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg transition-colors" title="Xem chi tiết">
                          <FiEye />
                        </Link>
                        <button onClick={() => handleToggleStatus(user.id)}
                          className={`p-2 rounded-lg transition-colors ${user.status === 'ACTIVE' ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}
                          title={user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}>
                          {user.status === 'ACTIVE' ? <FiLock /> : <FiUnlock />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pageData && pageData.lastPage > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
            <div>Hiển thị {((page - 1) * 20) + 1}-{Math.min(page * 20, pageData.total)} của {pageData.total} người dùng</div>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50">&lt;</button>
              {Array.from({ length: Math.min(pageData.lastPage, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 flex items-center justify-center rounded-lg ${p === page ? 'bg-purple-600 text-white font-medium shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(pageData.lastPage, p + 1))} disabled={page === pageData.lastPage} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50">&gt;</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
