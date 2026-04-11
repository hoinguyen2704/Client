import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiChevronRight,
  FiClipboard,
  FiPlus,
  FiSearch,
  FiXCircle,
} from 'react-icons/fi';
import { toast } from 'sonner';
import { Button, ConfirmDialog, Pagination } from '@/components';
import { formatDateFull as formatDateTime, formatPrice } from '@/utils/format';
import { getApiErrorMessage } from '@/utils/error';
import returnService from '@/apis/services/returnService';
import type { ReturnRequestResponse } from '@/types';
import {
  USER_RETURN_TABS,
  ReturnStatusBadge,
  RefundStatusBadge,
} from '@/constants/returnConstants';

export default function MyReturns() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [returns, setReturns] = useState<ReturnRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<ReturnRequestResponse | null>(null);

  useEffect(() => {
    fetchReturns();
  }, [page, activeTab]);

  const fetchReturns = async (targetPage = page) => {
    setLoading(true);
    try {
      const res = await returnService.getMine({
        status: activeTab !== 'all' ? activeTab : undefined,
        keyword: searchQuery || undefined,
        page: targetPage,
        size: 10,
      });
      setReturns(res.data?.data || []);
      setTotalPages(res.data?.lastPage || 1);
    } catch {
      setReturns([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchReturns(1);
  };

  const handleCancelReturn = async (target: ReturnRequestResponse) => {
    try {
      await returnService.cancel(target.id);
      toast.success('Đã hủy yêu cầu trả hàng');
      fetchReturns();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Hủy yêu cầu trả hàng thất bại'));
    } finally {
      setCancelTarget(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">Đơn trả hàng / hoàn tiền</h1>
        <Link to="/user/orders" className="h-10 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold bg-purple-600 text-white hover:bg-purple-700 transition">
          <FiPlus /> Đi tới đơn hàng để trả
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3 sm:space-y-4">
        <div className="flex overflow-x-auto pb-2 hide-scrollbar border-b border-slate-100 dark:border-slate-800">
          {USER_RETURN_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(1); }}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Tìm theo mã yêu cầu / mã đơn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full h-12 pl-12 pr-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 rounded-lg text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            Tìm
          </button>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 animate-pulse"
            >
              <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
              <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))
        ) : returns.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 sm:p-12 text-center border border-slate-100 dark:border-slate-800">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 text-3xl sm:text-4xl">
              <FiClipboard />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">Bạn chưa có yêu cầu trả hàng</h3>
            <p className="text-sm sm:text-base text-slate-500 mb-6">
              Bạn có thể tạo yêu cầu từ trang chi tiết đơn hàng (đối với đơn đã nhận).
            </p>
            <Link to="/user/orders" className="inline-flex h-11 px-6 rounded-xl items-center justify-center font-semibold bg-purple-600 text-white hover:bg-purple-700 transition">Đi tới Danh sách đơn hàng</Link>
          </div>
        ) : (
          returns.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-base sm:text-lg text-purple-600">{item.returnNumber}</span>
                    <ReturnStatusBadge status={item.status} />
                    <RefundStatusBadge status={item.refundStatus} />
                  </div>
                  <p className="text-sm text-slate-500">
                    Đơn hàng: <span className="font-semibold text-slate-700 dark:text-slate-200">{item.orderNumber}</span>
                  </p>
                  <p className="text-sm text-slate-500">Tạo lúc: {formatDateTime(item.createdAt)}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Yêu cầu hoàn</p>
                  <p className="text-lg font-bold text-purple-600">{formatPrice(Number(item.requestedAmount || 0))}</p>
                  {item.approvedAmount != null && (
                    <p className="text-xs text-slate-500 mt-1">
                      Duyệt: <span className="font-semibold">{formatPrice(Number(item.approvedAmount || 0))}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1">
                  Lý do: <span className="font-medium">{item.reason}</span>
                </p>

                <Link
                  to={`/user/returns/${item.returnNumber}`}
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Xem chi tiết <FiChevronRight />
                </Link>

                {item.status === 'REQUESTED' ? (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setCancelTarget(item)}
                    icon={<FiXCircle />}
                    className="justify-center"
                  >
                    Hủy yêu cầu
                  </Button>
                ) : (
                  <div />
                )}
              </div>
            </div>
          ))
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <ConfirmDialog
        open={!!cancelTarget}
        title="Hủy yêu cầu trả hàng"
        message={`Bạn có chắc muốn hủy ${cancelTarget?.returnNumber || 'yêu cầu này'}?`}
        confirmLabel="Hủy yêu cầu"
        variant="danger"
        onConfirm={() => cancelTarget && handleCancelReturn(cancelTarget)}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
