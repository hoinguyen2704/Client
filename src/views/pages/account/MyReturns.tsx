import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlertTriangle,
  FiChevronRight,
  FiClipboard,
  FiPackage,
  FiPlus,
  FiSearch,
  FiXCircle,
} from 'react-icons/fi';
import { toast } from 'sonner';
import { Button, ConfirmDialog, Modal, ModalCancelButton, PrimaryButton } from '@/components';
import { formatDateFull as formatDateTime, formatPrice } from '@/utils/format';
import returnService from '@/apis/services/returnService';
import orderService from '@/apis/services/orderService';
import type { OrderResponse, ReturnRequestResponse } from '@/types';
import {
  USER_RETURN_TABS,
  canProcessRefund,
  getRefundStatusMeta,
  getReturnStatusMeta,
} from '@/constants/returnConstants';

const getErrorMessage = (err: unknown, fallback: string) => {
  if (!err || typeof err !== 'object') return fallback;
  const maybe = err as {
    message?: string;
    error?: string;
    data?: { message?: string };
  };
  return maybe.message || maybe.error || maybe.data?.message || fallback;
};

const createIdempotencyKey = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `ret-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export default function MyReturns() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [returns, setReturns] = useState<ReturnRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [cancelTarget, setCancelTarget] = useState<ReturnRequestResponse | null>(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequestResponse | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [eligibleOrders, setEligibleOrders] = useState<OrderResponse[]>([]);
  const [eligibleLoading, setEligibleLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [reason, setReason] = useState('');
  const [evidenceNote, setEvidenceNote] = useState('');
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  const selectedOrder = useMemo(
    () => eligibleOrders.find((order) => order.id === selectedOrderId) || null,
    [eligibleOrders, selectedOrderId],
  );

  useEffect(() => {
    fetchReturns();
  }, [page, activeTab]);

  useEffect(() => {
    if (!selectedOrder) {
      setItemQuantities({});
      return;
    }

    const initialQuantities = selectedOrder.items.reduce<Record<string, number>>(
      (acc, item) => {
        acc[item.id] = 0;
        return acc;
      },
      {},
    );
    setItemQuantities(initialQuantities);
  }, [selectedOrder]);

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

  const openDetail = async (returnNumber: string) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await returnService.getByNumber(returnNumber);
      setSelectedReturn(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Không tải được chi tiết yêu cầu trả hàng'));
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCancelReturn = async (target: ReturnRequestResponse) => {
    try {
      await returnService.cancel(target.id);
      toast.success('Đã hủy yêu cầu trả hàng');
      if (selectedReturn?.id === target.id) {
        const refreshed = await returnService.getByNumber(target.returnNumber);
        setSelectedReturn(refreshed.data);
      }
      fetchReturns();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Hủy yêu cầu trả hàng thất bại'));
    } finally {
      setCancelTarget(null);
    }
  };

  const resetCreateForm = () => {
    setSelectedOrderId('');
    setReason('');
    setEvidenceNote('');
    setItemQuantities({});
  };

  const loadEligibleOrders = async () => {
    setEligibleLoading(true);
    try {
      const res = await orderService.getMyOrders({ status: 'SHIPPED', page: 1, size: 50 });
      const eligible = (res.data?.data || []).filter((order) => order.paymentStatus === 'COMPLETED');
      setEligibleOrders(eligible);
      if (eligible.length > 0) {
        setSelectedOrderId(eligible[0].id);
      } else {
        setSelectedOrderId('');
      }
    } catch {
      setEligibleOrders([]);
      setSelectedOrderId('');
    } finally {
      setEligibleLoading(false);
    }
  };

  const openCreateModal = async () => {
    setCreateModalOpen(true);
    resetCreateForm();
    await loadEligibleOrders();
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    resetCreateForm();
  };

  const updateItemQuantity = (orderItemId: string, rawValue: string, maxQuantity: number) => {
    const parsed = Number(rawValue);
    const safeValue = Number.isFinite(parsed) ? Math.max(0, Math.min(maxQuantity, Math.floor(parsed))) : 0;
    setItemQuantities((prev) => ({ ...prev, [orderItemId]: safeValue }));
  };

  const handleCreateReturn = async () => {
    if (!selectedOrder) {
      toast.error('Vui lòng chọn đơn hàng');
      return;
    }
    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do trả hàng');
      return;
    }

    const itemsPayload = selectedOrder.items
      .map((item) => ({
        orderItemId: item.id,
        quantity: itemQuantities[item.id] || 0,
      }))
      .filter((item) => item.quantity > 0);

    if (itemsPayload.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm cần trả');
      return;
    }

    setCreating(true);
    try {
      await returnService.create(
        {
          orderId: selectedOrder.id,
          reason: reason.trim(),
          evidenceNote: evidenceNote.trim() || undefined,
          items: itemsPayload,
        },
        createIdempotencyKey(),
      );
      toast.success('Đã tạo yêu cầu trả hàng');
      closeCreateModal();
      setPage(1);
      fetchReturns(1);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Tạo yêu cầu trả hàng thất bại'));
    } finally {
      setCreating(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    const meta = getReturnStatusMeta(status);
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${meta.className}`}>
        {meta.label}
      </span>
    );
  };

  const renderRefundBadge = (status: string) => {
    const meta = getRefundStatusMeta(status);
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}>
        {meta.label}
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">Đơn trả hàng / hoàn tiền</h1>
        <Button icon={<FiPlus />} onClick={openCreateModal} size="md">
          Tạo yêu cầu trả hàng
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3 sm:space-y-4">
        <div className="flex overflow-x-auto pb-2 hide-scrollbar border-b border-slate-100 dark:border-slate-800">
          {USER_RETURN_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
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
              Tạo yêu cầu trả hàng khi đơn đã giao thành công và thanh toán hoàn tất.
            </p>
            <Button onClick={openCreateModal}>Tạo yêu cầu mới</Button>
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
                    {renderStatusBadge(item.status)}
                    {renderRefundBadge(item.refundStatus)}
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

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDetail(item.returnNumber)}
                  iconRight={<FiChevronRight />}
                  className="justify-center"
                >
                  Xem chi tiết
                </Button>

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

        {totalPages > 1 && (
          <div className="flex justify-center gap-1.5 sm:gap-2 pt-3 sm:pt-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-sm font-medium transition-colors ${
                  p === page ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedReturn(null);
        }}
        title={selectedReturn ? `Chi tiết ${selectedReturn.returnNumber}` : 'Chi tiết yêu cầu trả hàng'}
        size="4xl"
        scrollable
        footer={
          <>
            <ModalCancelButton
              onClick={() => {
                setDetailModalOpen(false);
                setSelectedReturn(null);
              }}
            >
              Đóng
            </ModalCancelButton>
            {selectedReturn?.status === 'REQUESTED' && (
              <PrimaryButton
                icon={<FiXCircle />}
                className="!bg-red-600 hover:!bg-red-700 text-white"
                onClick={() => setCancelTarget(selectedReturn)}
              >
                Hủy yêu cầu
              </PrimaryButton>
            )}
          </>
        }
      >
        {detailLoading || !selectedReturn ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50/70 dark:bg-slate-800/40">
                <p className="text-xs uppercase tracking-wide text-slate-500">Trạng thái trả hàng</p>
                <div className="mt-2">{renderStatusBadge(selectedReturn.status)}</div>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50/70 dark:bg-slate-800/40">
                <p className="text-xs uppercase tracking-wide text-slate-500">Trạng thái hoàn tiền</p>
                <div className="mt-2">{renderRefundBadge(selectedReturn.refundStatus)}</div>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50/70 dark:bg-slate-800/40">
                <p className="text-xs uppercase tracking-wide text-slate-500">Đơn hàng liên quan</p>
                <div className="mt-2">
                  <Link
                    to={`/user/orders/${selectedReturn.orderNumber}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-700"
                  >
                    {selectedReturn.orderNumber} <FiChevronRight />
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <h3 className="font-bold mb-3">Thông tin yêu cầu</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-slate-500">Lý do:</span> <span className="font-medium">{selectedReturn.reason}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Ghi chú:</span>{' '}
                    <span className="font-medium">{selectedReturn.evidenceNote || 'Không có'}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Tạo lúc:</span>{' '}
                    <span className="font-medium">{formatDateTime(selectedReturn.createdAt)}</span>
                  </p>
                  {selectedReturn.resolvedAt && (
                    <p>
                      <span className="text-slate-500">Kết thúc:</span>{' '}
                      <span className="font-medium">{formatDateTime(selectedReturn.resolvedAt)}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <h3 className="font-bold mb-3">Số tiền</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-slate-500">Yêu cầu hoàn:</span>
                    <span className="font-semibold text-purple-600">
                      {formatPrice(Number(selectedReturn.requestedAmount || 0))}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Số tiền duyệt:</span>
                    <span className="font-semibold">
                      {selectedReturn.approvedAmount != null
                        ? formatPrice(Number(selectedReturn.approvedAmount || 0))
                        : 'Chưa duyệt'}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Đã hoàn thực tế:</span>
                    <span className="font-semibold text-emerald-600">
                      {selectedReturn.refundAmount != null
                        ? formatPrice(Number(selectedReturn.refundAmount || 0))
                        : formatPrice(0)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-bold">Sản phẩm yêu cầu trả</div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500">
                    <tr>
                      <th className="text-left py-2.5 px-4 font-semibold">Sản phẩm</th>
                      <th className="text-left py-2.5 px-4 font-semibold">Phân loại</th>
                      <th className="text-right py-2.5 px-4 font-semibold">Đơn giá</th>
                      <th className="text-center py-2.5 px-4 font-semibold">SL yêu cầu</th>
                      <th className="text-center py-2.5 px-4 font-semibold">SL duyệt</th>
                      <th className="text-right py-2.5 px-4 font-semibold">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReturn.items.map((line) => (
                      <tr key={line.id} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="py-3 px-4 font-medium">{line.productName}</td>
                        <td className="py-3 px-4 text-slate-500">{line.variantName || '-'}</td>
                        <td className="py-3 px-4 text-right">{formatPrice(Number(line.unitPrice || 0))}</td>
                        <td className="py-3 px-4 text-center">{line.requestedQuantity}</td>
                        <td className="py-3 px-4 text-center">{line.approvedQuantity ?? '-'}</td>
                        <td className="py-3 px-4 text-right font-semibold">{formatPrice(Number(line.lineAmount || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-bold">
                Lịch sử hoàn tiền {selectedReturn.refunds.length > 0 && `(${selectedReturn.refunds.length})`}
              </div>
              {selectedReturn.refunds.length === 0 ? (
                <div className="p-4 text-sm text-slate-500 flex items-center gap-2">
                  {canProcessRefund(selectedReturn.status) ? (
                    <>
                      <FiAlertTriangle className="text-amber-500" />
                      Yêu cầu đã đủ điều kiện chờ admin xử lý hoàn tiền.
                    </>
                  ) : (
                    'Chưa có giao dịch hoàn tiền.'
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500">
                      <tr>
                        <th className="text-left py-2.5 px-4 font-semibold">Thời gian</th>
                        <th className="text-left py-2.5 px-4 font-semibold">Provider</th>
                        <th className="text-left py-2.5 px-4 font-semibold">Mã GD</th>
                        <th className="text-right py-2.5 px-4 font-semibold">Số tiền</th>
                        <th className="text-right py-2.5 px-4 font-semibold">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReturn.refunds.map((tx) => (
                        <tr key={tx.id} className="border-t border-slate-100 dark:border-slate-800">
                          <td className="py-3 px-4">{formatDateTime(tx.createdAt)}</td>
                          <td className="py-3 px-4">{tx.provider}</td>
                          <td className="py-3 px-4">{tx.transactionId || '-'}</td>
                          <td className="py-3 px-4 text-right font-semibold">
                            {formatPrice(Number(tx.amount || 0))} {tx.currency}
                          </td>
                          <td className="py-3 px-4 text-right">{renderRefundBadge(tx.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={createModalOpen}
        onClose={closeCreateModal}
        title="Tạo yêu cầu trả hàng"
        size="4xl"
        scrollable
        footer={
          <>
            <ModalCancelButton onClick={closeCreateModal}>Đóng</ModalCancelButton>
            <PrimaryButton onClick={handleCreateReturn} disabled={creating || eligibleLoading} isLoading={creating}>
              Gửi yêu cầu
            </PrimaryButton>
          </>
        }
      >
        {eligibleLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          </div>
        ) : eligibleOrders.length === 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-200">
            Chưa có đơn hàng đủ điều kiện trả. Chỉ đơn đã giao và đã thanh toán mới được tạo yêu cầu trả hàng.
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Chọn đơn hàng</label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none"
              >
                {eligibleOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.orderNumber} - {formatPrice(Number(order.totalAmount || 0))}
                  </option>
                ))}
              </select>
            </div>

            {selectedOrder && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center gap-2 font-semibold">
                  <FiPackage className="text-purple-600" />
                  Sản phẩm cần trả
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedOrder.items.map((line) => (
                    <div key={line.id} className="px-4 py-3 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 sm:items-center">
                      <div className="min-w-0">
                        <p className="font-semibold line-clamp-1">{line.productName}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {line.variantName} | Đã mua: {line.quantity} | {formatPrice(Number(line.unitPrice || 0))}
                        </p>
                      </div>
                      <span className="text-xs sm:text-sm text-slate-500">Số lượng trả:</span>
                      <input
                        type="number"
                        min={0}
                        max={line.quantity}
                        value={itemQuantities[line.id] ?? 0}
                        onChange={(e) => updateItemQuantity(line.id, e.target.value, line.quantity)}
                        className="h-10 w-20 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-center text-sm font-semibold outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2">Lý do trả hàng</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Mô tả rõ lý do yêu cầu trả hàng"
                className="w-full h-28 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Ghi chú bổ sung (không bắt buộc)</label>
              <textarea
                value={evidenceNote}
                onChange={(e) => setEvidenceNote(e.target.value)}
                placeholder="Ví dụ: mô tả lỗi, phụ kiện thiếu, tình trạng hàng..."
                className="w-full h-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
              />
            </div>
          </div>
        )}
      </Modal>

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

