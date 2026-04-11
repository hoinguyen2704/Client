import { useCallback, useEffect, useState } from 'react';
import { FiClipboard, FiXCircle, FiCheckCircle, FiClock, FiTruck, FiCreditCard } from 'react-icons/fi';
import { toast } from 'sonner';
import { ActionButtons, AdminPagination, AdminSearch, Button, CustomSelect } from '@/components';
import returnService from '@/apis/services/returnService';
import { PAGE_SIZE } from '@/constants/paginationConstants';
import { RETURN_FILTER_OPTIONS, canProcessRefund, ReturnStatusBadge, RefundStatusBadge } from '@/constants/returnConstants';
import { formatDate, formatPrice } from '@/utils/format';
import { getApiErrorMessage } from '@/utils/error';
import type { PageResponse, ReturnRequestResponse } from '@/types';



export default function AdminReturns() {
  const [returns, setReturns] = useState<ReturnRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState<PageResponse<ReturnRequestResponse> | null>(null);
  const [reviewingKey, setReviewingKey] = useState<string | null>(null);

  const fetchReturns = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const res = await returnService.adminGetAll({
        keyword: searchQuery || undefined,
        status: statusFilter || undefined,
        page,
        size: PAGE_SIZE.LARGE,
      });
      setPageData(res.data);
      setReturns(res.data?.data || []);
    } catch {
      setPageData(null);
      setReturns([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const handleQuickReview = async (target: ReturnRequestResponse, approved: boolean) => {
    const actionKey = `${target.id}:${approved ? 'approve' : 'reject'}`;
    setReviewingKey(actionKey);
    try {
      await returnService.adminReview(target.id, {
        approved,
        note: approved ? 'Duyệt nhanh từ danh sách' : 'Từ chối nhanh từ danh sách',
      });
      toast.success(approved ? 'Đã duyệt yêu cầu trả hàng' : 'Đã từ chối yêu cầu trả hàng');
      fetchReturns({ silent: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Cập nhật duyệt trả hàng thất bại'));
    } finally {
      setReviewingKey(null);
    }
  };



  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Quản lý trả hàng / hoàn tiền</h1>
          <p className="text-sm text-slate-500 mt-1">Danh sách yêu cầu trả hàng của khách và trạng thái hoàn tiền.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium">Tổng số trang này</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">{returns.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
              <FiClipboard className="text-lg" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium">Chờ duyệt</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600">
                {returns.filter(r => r.status === 'REQUESTED').length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
              <FiClock className="text-lg" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium">Đang xử lý</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">
                {returns.filter(r => ['APPROVED', 'IN_TRANSIT', 'RECEIVED', 'QC_PASSED', 'QC_FAILED'].includes(r.status)).length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
              <FiTruck className="text-lg" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium">Cần hoàn tiền</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">
                {returns.filter(r => canProcessRefund(r.status) && r.refundStatus !== 'SUCCESS').length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <FiCreditCard className="text-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <AdminSearch
            placeholder="Tìm theo mã yêu cầu, mã đơn, tên/email khách..."
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setPage(1);
            }}
          />
        </div>
        <CustomSelect
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
          options={RETURN_FILTER_OPTIONS}
          className="w-full md:w-56"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="hidden lg:grid grid-cols-[minmax(140px,1fr)_minmax(130px,1fr)_minmax(160px,1fr)_130px_180px_120px_200px] gap-4 p-4 xl:p-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm font-semibold rounded-t-2xl">
          <div>Mã yêu cầu</div>
          <div>Mã đơn</div>
          <div>Khách hàng</div>
          <div>Yêu cầu hoàn</div>
          <div>Trạng thái</div>
          <div>Ngày tạo</div>
          <div className="text-right">Thao tác</div>
        </div>

        <div className="flex flex-col">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col lg:grid lg:grid-cols-[minmax(140px,1fr)_minmax(130px,1fr)_minmax(160px,1fr)_130px_180px_120px_200px] gap-3 sm:gap-4 p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/50 animate-pulse"
              >
                <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded hidden lg:block" />
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-8 w-40 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded hidden lg:block" />
                <div className="h-8 w-36 bg-slate-200 dark:bg-slate-700 rounded-xl ml-auto" />
              </div>
            ))
          ) : returns.length === 0 ? (
            <div className="p-10 sm:p-16 flex flex-col items-center justify-center text-slate-400">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <FiClipboard className="text-2xl" />
              </div>
              <span>Không có yêu cầu trả hàng nào</span>
            </div>
          ) : (
            returns.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col lg:grid lg:grid-cols-[minmax(140px,1fr)_minmax(130px,1fr)_minmax(160px,1fr)_130px_180px_120px_200px] gap-3 sm:gap-4 items-center p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all duration-300"
              >
                <div className="w-full lg:w-auto flex justify-between items-center lg:block">
                  <span className="lg:hidden text-slate-500 text-sm">Mã yêu cầu:</span>
                  <div className="font-bold text-purple-600">{item.returnNumber}</div>
                </div>

                <div className="w-full lg:w-auto flex justify-between items-center lg:block">
                  <span className="lg:hidden text-slate-500 text-sm">Mã đơn:</span>
                  <div className="font-medium">{item.orderNumber}</div>
                </div>

                <div className="w-full lg:w-auto flex justify-between items-center lg:block">
                  <span className="lg:hidden text-slate-500 text-sm">Khách hàng:</span>
                  <div className="text-sm">
                    <div className="font-medium text-slate-800 dark:text-slate-100">{item.userName || 'Không rõ'}</div>
                    <div className="text-slate-500">{item.userEmail || '-'}</div>
                  </div>
                </div>

                <div className="w-full lg:w-auto flex justify-between items-center lg:block">
                  <span className="lg:hidden text-slate-500 text-sm">Yêu cầu hoàn:</span>
                  <div className="font-bold">{formatPrice(Number(item.requestedAmount || 0))}</div>
                </div>

                <div className="w-full lg:w-auto flex justify-between items-center lg:block">
                  <span className="lg:hidden text-slate-500 text-sm">Trạng thái:</span>
                  <div className="flex flex-wrap gap-1.5 justify-end lg:justify-start">
                    <ReturnStatusBadge status={item.status} />
                    <RefundStatusBadge status={item.refundStatus} />
                  </div>
                </div>

                <div className="w-full lg:w-auto flex justify-between items-center lg:block">
                  <span className="lg:hidden text-slate-500 text-sm">Ngày tạo:</span>
                  <div className="text-slate-500 text-sm font-medium">{formatDate(item.createdAt)}</div>
                </div>

                <div className="w-full lg:w-auto mt-3 lg:mt-0 flex justify-end items-center gap-2 flex-wrap">
                  {item.status === 'REQUESTED' && (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        icon={<FiCheckCircle />}
                        onClick={() => handleQuickReview(item, true)}
                        loading={reviewingKey === `${item.id}:approve`}
                      >
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        icon={<FiXCircle />}
                        onClick={() => handleQuickReview(item, false)}
                        loading={reviewingKey === `${item.id}:reject`}
                      >
                        Từ chối
                      </Button>
                    </>
                  )}

                  <ActionButtons
                    actions={[
                      {
                        type: 'view',
                        href: `/admin/returns/${item.returnNumber}`,
                      },
                    ]}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {pageData && (
          <AdminPagination
            currentPage={page}
            totalPages={pageData.lastPage}
            totalItems={pageData.total}
            perPage={PAGE_SIZE.LARGE}
            label="yêu cầu trả hàng"
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}

