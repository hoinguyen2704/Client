import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiEye, FiDownload, FiPackage } from 'react-icons/fi';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { formatPrice, formatDate } from '@/utils/format';
import { Button, StatusBadge, CustomSelect, AdminSearch, AdminPagination, ActionButtons } from '@/components';

import adminOrderService from '@/apis/services/adminOrderService';
import { ORDER_STATUS_OPTIONS, ORDER_FILTER_OPTIONS } from '@/constants/orderConstants';
import type { OrderResponse, PageResponse } from '@/types';
import { PAGE_SIZE } from '@/constants/paginationConstants';
import { downloadBlob } from '@/utils/download';

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
    try {
      await adminOrderService.updateStatus(orderId, newStatus);
      toast.success('Đã cập nhật trạng thái!');
      fetchOrders({ silent: true });
    } catch (err) { console.error('Update status failed:', err); }
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
        <div className="hidden lg:grid grid-cols-[minmax(120px,1fr)_120px_60px_140px_100px_180px_100px] gap-4 p-4 xl:p-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-md font-semibold rounded-t-2xl">
          <div>Mã đơn hàng</div>
          <div>Ngày đặt</div>
          <div>SP</div>
          <div>Tổng tiền</div>
          <div>Thanh toán</div>
          <div>Trạng thái</div>
          <div className="text-right print:hidden">Thao tác</div>
        </div>
        
        <div className="flex flex-col">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col lg:grid lg:grid-cols-[minmax(120px,1fr)_120px_60px_140px_100px_180px_100px] gap-3 sm:gap-4 p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/50 animate-pulse">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded hidden lg:block" />
                <div className="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded hidden lg:block" />
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded hidden lg:block" />
                <div className="h-8 w-36 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                <div className="h-8 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg ml-auto hidden lg:block" />
              </div>
            ))
          ) : orders.length === 0 ? (
            <div className="p-10 sm:p-16 flex flex-col items-center justify-center text-slate-400">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4"><FiPackage className="text-2xl" /></div>
              <span>Không có đơn hàng nào</span>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="group relative flex flex-col lg:grid lg:grid-cols-[minmax(120px,1fr)_120px_60px_140px_100px_180px_100px] gap-3 sm:gap-4 items-center p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all duration-300">
                {/* Mobile: Order Header */}
                <div className="w-full lg:w-auto flex justify-between items-center lg:block">
                  <div className="font-bold text-purple-600 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 lg:hidden"><FiPackage className="text-md" /></div>
                    {order.orderNumber}
                  </div>
                  <div className="lg:hidden text-slate-500 text-md">{formatDate(order.createdAt)}</div>
                </div>

                <div className="hidden lg:block text-slate-500 font-medium">{formatDate(order.createdAt)}</div>
                
                <div className="w-full lg:w-auto flex justify-between items-center lg:block">
                  <span className="lg:hidden text-slate-500 text-md">Số lượng SP:</span>
                  <div className="font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1 lg:px-0 lg:py-0 lg:bg-transparent lg:dark:bg-transparent rounded-full text-sm lg:text-md w-max">
                    {order.items?.length || 0}
                  </div>
                </div>

                <div className="w-full lg:w-auto flex justify-between items-center lg:block">
                  <span className="lg:hidden text-slate-500 text-md">Tổng tiền:</span>
                  <div className="font-bold">{formatPrice(order.totalAmount)}</div>
                </div>

                <div className="w-full lg:w-auto flex justify-between items-center lg:block">
                  <span className="lg:hidden text-slate-500 text-md">Thanh toán:</span>
                  <div className="text-slate-500 font-medium px-2 py-1 lg:px-0 lg:py-0 bg-slate-100 dark:bg-slate-800 lg:bg-transparent lg:dark:bg-transparent rounded-md text-sm lg:text-md w-max border lg:border-none border-slate-200 dark:border-slate-700">
                    {order.paymentMethod}
                  </div>
                </div>

                <div className="w-full lg:w-auto mt-1 lg:mt-0 flex justify-between items-center lg:block">
                  <span className="lg:hidden text-slate-500 text-md">Trạng thái:</span>
                  <CustomSelect 
                    value={order.orderStatus} 
                    onChange={(val) => handleStatusChange(order.id, val)}
                    options={ORDER_STATUS_OPTIONS}
                    className="w-[170px] sm:w-48 lg:w-40"
                  />
                </div>

                <div className="w-full lg:w-auto mt-4 lg:mt-0 flex justify-end items-center print:hidden">
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
            ))
          )}
        </div>

        {/* Pagination */}
        {pageData && (
          <AdminPagination
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
