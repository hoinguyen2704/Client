import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiEye, FiDownload, FiPackage } from 'react-icons/fi';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { formatPrice, formatDate } from '@/utils/format';
import { Button, StatusBadge, CustomSelect, AdminSearch, Pagination, ActionButtons } from '@/components';

import adminOrderService from '@/apis/services/adminOrderService';
import { ORDER_FILTER_OPTIONS, getAdminOrderStatusOptions } from '@/constants/orderConstants';
import type { OrderResponse, PageResponse } from '@/types';
import { PAGE_SIZE } from '@/constants/paginationConstants';
import { downloadBlob } from '@/utils/download';
import { getPaginatedRowNumber } from '@/utils/helpers';

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState<PageResponse<OrderResponse> | null>(null);

  const fetchOrders = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const res = await adminOrderService.getAll({
        keyword: searchQuery || undefined,
        status: statusFilter || undefined,
        page, size: PAGE_SIZE.LARGE,
      });
      setPageData(res.data);
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!newStatus) return;
    try {
      await adminOrderService.updateStatus(orderId, newStatus);
      toast.success('Đã cập nhật trạng thái!');
      fetchOrders({ silent: true });
    } catch (err) {
      console.error('Update status failed:', err);
      toast.error('Không thể cập nhật trạng thái theo thứ tự này');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await adminOrderService.export({
        status: statusFilter || undefined,
        keyword: searchQuery || undefined,
      });
      downloadBlob(blob, `orders_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) { console.error('Export failed:', err); }
  };
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Quản lý đơn hàng</h1>
        <div className="flex gap-3 print:hidden">
          <Button onClick={handleExport} variant="success" size="md" icon={<FiDownload />}>
            Xuất Excel
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-3 sm:gap-4 print:hidden">
        <div className="flex-1">
          <AdminSearch
            boxed={false}
            placeholder="Tìm kiếm theo mã đơn, tên khách hàng..."
            value={searchQuery}
            onChange={(val) => { setSearchQuery(val); setPage(1); }}
          />
        </div>
        <CustomSelect 
          value={statusFilter} 
          onChange={(val) => { setStatusFilter(val); setPage(1); }}
          options={ORDER_FILTER_OPTIONS}
          className="w-full md:w-56"
        />
      </div>

      {/* Orders Table */}
      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        
        {/* Desktop Header */}
        <div className="hidden lg:grid grid-cols-[84px_350px_180px_100px_minmax(150px,1fr)_200px_220px_100px] divide-x divide-slate-200 dark:divide-slate-700 gap-0 bg-slate-50 dark:bg-slate-800/50 border-b-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-md font-semibold text-center rounded-t-2xl">
          <div className="px-4 py-4">STT</div>
          <div className="px-4 py-4 text-left">Mã đơn hàng</div>
          <div className="px-4 py-4">Ngày đặt</div>
          <div className="px-4 py-4">SP</div>
          <div className="px-4 py-4 text-right">Tổng tiền</div>
          <div className="px-4 py-4 text-right">Thanh toán</div>
          <div className="px-4 py-4">Trạng thái</div>
          <div className="px-4 py-4 text-center print:hidden">Thao tác</div>
        </div>
        
        <div className="flex flex-col">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col lg:grid lg:grid-cols-[84px_350px_180px_100px_minmax(150px,1fr)_200px_220px_100px] lg:divide-x divide-slate-200 dark:divide-slate-700 items-center border-b border-slate-200 dark:border-slate-700 animate-pulse">
                <div className="hidden lg:flex px-4 py-4 w-full justify-center"><div className="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded" /></div>
                <div className="px-4 py-4 w-full"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" /></div>
                <div className="px-4 py-4 w-full flex justify-center hidden lg:flex"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" /></div>
                <div className="px-4 py-4 w-full flex justify-end hidden lg:flex"><div className="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded" /></div>
                <div className="px-4 py-4 w-full flex justify-end hidden lg:flex"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" /></div>
                <div className="px-4 py-4 w-full flex justify-center hidden lg:flex"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" /></div>
                <div className="px-4 py-4 w-full flex justify-center hidden lg:flex"><div className="h-8 w-36 bg-slate-200 dark:bg-slate-700 rounded-xl" /></div>
                <div className="px-4 py-4 w-full flex justify-center hidden lg:flex"><div className="h-8 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg" /></div>
              </div>
            ))
          ) : orders.length === 0 ? (
            <div className="p-10 sm:p-16 flex flex-col items-center justify-center text-slate-400">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4"><FiPackage className="text-2xl" /></div>
              <span>Không có đơn hàng nào</span>
            </div>
          ) : (
            orders.map((order, index) => {
              const rowNumber = getPaginatedRowNumber(page, PAGE_SIZE.LARGE, index);

              return (
                <div key={order.id} className="group relative flex flex-col lg:grid lg:grid-cols-[84px_350px_180px_100px_minmax(150px,1fr)_200px_220px_100px] lg:divide-x divide-slate-200 dark:divide-slate-700 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all duration-300">
                  <div className="hidden lg:flex items-center justify-center px-4 py-4 h-full font-semibold text-slate-400">
                    {rowNumber}
                  </div>

                  {/* Mobile: Order Header */}
                  <div className="w-full lg:w-auto flex justify-between lg:justify-start items-center px-4 py-3 lg:px-4 lg:py-4 lg:h-full">
                    <div className="font-bold text-purple-600 flex items-center gap-2">
                      <span className="inline-flex lg:hidden items-center justify-center min-w-9 h-8 px-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm font-semibold">
                        {rowNumber}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 lg:hidden"><FiPackage className="text-md" /></div>
                      {order.orderNumber}
                    </div>
                    <div className="lg:hidden text-slate-500 text-md ">{formatDate(order.createdAt)}</div>
                  </div>

                  <div className="hidden lg:flex justify-center items-center px-4 py-4 text-slate-700 dark:text-slate-300 font-medium h-full text-center">{formatDate(order.createdAt)}</div>
                  
                  <div className="w-full lg:w-auto flex justify-between lg:justify-center items-center px-4 py-2 lg:px-4 lg:py-4 lg:h-full">
                    <span className="lg:hidden text-slate-500 text-md">Số lượng SP:</span>
                    <div className="font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1 lg:px-0 lg:py-0 lg:bg-transparent lg:dark:bg-transparent rounded-full text-sm lg:text-md w-max text-slate-700 dark:text-slate-300">
                      {order.items?.length || 0}
                    </div>
                  </div>

                  <div className="w-full lg:w-auto flex justify-between lg:justify-end items-center px-4 py-2 lg:px-4 lg:py-4 lg:h-full">
                    <span className="lg:hidden text-slate-500 text-md">Tổng tiền:</span>
                    <div className="font-bold text-slate-800 dark:text-slate-100">{formatPrice(order.totalAmount)}</div>
                  </div>

                  <div className="w-full lg:w-auto flex justify-between lg:justify-end items-center px-4 py-2 lg:px-4 lg:py-4 lg:h-full text-center">
                    <span className="lg:hidden text-slate-500 text-md">Thanh toán:</span>
                    <div className="text-slate-700 dark:text-slate-300 font-medium px-2 py-1 lg:px-0 lg:py-0 bg-slate-100 dark:bg-slate-800 lg:bg-transparent lg:dark:bg-transparent rounded-md text-sm lg:text-md w-max border lg:border-none border-slate-200 dark:border-slate-700">
                      {order.paymentMethod}
                    </div>
                  </div>

                  <div className="w-full lg:w-auto mt-1 lg:mt-0 flex justify-between lg:justify-center items-center px-4 py-3 lg:px-4 lg:py-4 lg:h-full">
                    <span className="lg:hidden text-slate-500 text-md">Trạng thái:</span>
                    <div className="w-[170px] sm:w-48 lg:w-[150px]">
                      {(() => {
                        const statusOptions = getAdminOrderStatusOptions(order.orderStatus);
                        return (
                          <CustomSelect 
                            value={order.orderStatus} 
                            onChange={(val) => handleStatusChange(order.id, val)}
                            options={statusOptions}
                            className="w-full"
                            disabled={statusOptions.length <= 1}
                          />
                        );
                      })()}
                    </div>
                  </div>

                  <div className="w-full lg:w-auto mt-2 lg:mt-0 flex justify-end lg:justify-center items-center print:hidden px-4 pb-4 pt-2 lg:px-4 lg:py-4 lg:h-full">
                    <ActionButtons
                      actions={[
                        {
                          type: 'view',
                          href: `/admin/orders/${order.orderNumber}`,
                        }
                      ]}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pageData && (
          <Pagination variant="admin"
            currentPage={page}
            totalPages={pageData.lastPage}
            totalItems={pageData.total}
            perPage={PAGE_SIZE.LARGE}
            label="đơn hàng"
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
