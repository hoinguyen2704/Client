import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiPhone, FiCalendar, FiShoppingBag, FiDollarSign, FiLock, FiUnlock } from 'react-icons/fi';
import { formatPrice } from '@/helpers/format';
import { toast } from 'sonner';
import adminUserService from '@/apis/services/adminUserService';
import type { UserResponse } from '@/types';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminUserService.getById(id)
      .then(res => setUser(res.data))
      .catch(err => console.error('Failed to load user:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggle = async () => {
    if (!user) return;
    try {
      const res = await adminUserService.toggleStatus(user.id);
      setUser(res.data);
      toast.success('Cập nhật trạng thái người dùng thành công!');
    } catch (err) {
      console.error(err);
      toast.error('Cập nhật trạng thái người dùng thất bại!');
    }
  };

  const formatDate = (d: string) => { try { return new Date(d).toLocaleDateString('vi-VN'); } catch { return d; } };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/admin/customers" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><FiArrowLeft className="text-xl" /></Link>
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="space-y-2"><div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded" /><div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="p-8 text-center text-slate-400">Không tìm thấy người dùng</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/customers" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><FiArrowLeft className="text-xl" /></Link>
        <h1 className="text-2xl font-bold">Chi tiết khách hàng</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
            <div className="relative inline-block mb-4">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md" />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-3xl font-bold text-purple-600">
                  {user.fullName?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <h2 className="text-xl font-bold mb-1">{user.fullName}</h2>
            <p className="text-slate-500 text-sm mb-4">@{user.userName || user.email.split('@')[0]}</p>

            <div className="flex justify-center gap-2 mb-6">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {user.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>{user.role}</span>
            </div>

            <button onClick={handleToggle}
              className={`w-full py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                user.status === 'ACTIVE'
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40'
                  : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40'
              }`}>
              {user.status === 'ACTIVE' ? <><FiLock /> Khóa tài khoản</> : <><FiUnlock /> Mở khóa</>}
            </button>

            <div className="mt-6 space-y-3 text-left text-sm">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <FiMail className="text-slate-400 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <FiPhone className="text-slate-400 shrink-0" />
                <span>{user.phoneNumber || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <FiCalendar className="text-slate-400 shrink-0" />
                <span>Tham gia: {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Area — placeholder for orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold">Thông tin tài khoản</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <span className="text-sm text-slate-500">Họ tên</span>
                <p className="font-bold">{user.fullName}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Email</span>
                <p className="font-bold">{user.email}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Số điện thoại</span>
                <p className="font-bold">{user.phoneNumber || '—'}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Giới tính</span>
                <p className="font-bold">{user.gender || '—'}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Ngày sinh</span>
                <p className="font-bold">{user.dateOfBirth ? formatDate(user.dateOfBirth) : '—'}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Ngày tạo</span>
                <p className="font-bold">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
