// ─── LocalStorage keys ──────────────────────────────────────────
export const STORAGE_KEYS = {
  AUTH: 'auth',
  CHAT_HISTORY: 'chatbot_history',
  RECENTLY_VIEWED: 'recently_viewed',
  CART_COUNT: 'cart_count',
} as const;

// ─── Pagination defaults ────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_SIZE: 10,
  MAX_SIZE: 100,
} as const;

// ─── Order status labels ────────────────────────────────────────
export const ORDER_STATUS: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
  RETURNED: 'Đã trả',
};

// ─── Payment methods ────────────────────────────────────────────
export const PAYMENT_METHODS: Record<string, string> = {
  COD: 'Thanh toán khi nhận hàng',
  BANKING: 'Chuyển khoản ngân hàng',
  MOMO: 'Ví MoMo',
  VNPAY: 'VNPay',
};
