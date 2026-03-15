// ── Revenue Chart Data ────────────────────────────────────────────
export const revenue7Days = [
  { name: 'T2', revenue: 4000, prevRevenue: 3200, orders: 24 },
  { name: 'T3', revenue: 3000, prevRevenue: 3800, orders: 18 },
  { name: 'T4', revenue: 5000, prevRevenue: 4200, orders: 35 },
  { name: 'T5', revenue: 2780, prevRevenue: 3500, orders: 15 },
  { name: 'T6', revenue: 6890, prevRevenue: 5100, orders: 48 },
  { name: 'T7', revenue: 8390, prevRevenue: 7200, orders: 60 },
  { name: 'CN', revenue: 9490, prevRevenue: 6800, orders: 75 },
];

export const revenueMonth = [
  { name: 'T1', revenue: 24000, prevRevenue: 20000, orders: 124 },
  { name: 'T2', revenue: 33000, prevRevenue: 28000, orders: 218 },
  { name: 'T3', revenue: 45000, prevRevenue: 38000, orders: 335 },
  { name: 'T4', revenue: 37800, prevRevenue: 35000, orders: 215 },
  { name: 'T5', revenue: 42000, prevRevenue: 40000, orders: 250 },
  { name: 'T6', revenue: 55000, prevRevenue: 45000, orders: 310 },
  { name: 'T7', revenue: 48000, prevRevenue: 52000, orders: 280 },
  { name: 'T8', revenue: 61000, prevRevenue: 50000, orders: 350 },
  { name: 'T9', revenue: 59000, prevRevenue: 55000, orders: 340 },
  { name: 'T10', revenue: 72000, prevRevenue: 60000, orders: 410 },
  { name: 'T11', revenue: 85000, prevRevenue: 68000, orders: 480 },
  { name: 'T12', revenue: 105000, prevRevenue: 78000, orders: 550 },
];

export const revenueQuarter = [
  { name: 'Quý 1', revenue: 124000, prevRevenue: 98000, orders: 1124 },
  { name: 'Quý 2', revenue: 133000, prevRevenue: 110000, orders: 1218 },
  { name: 'Quý 3', revenue: 145000, prevRevenue: 125000, orders: 1335 },
  { name: 'Quý 4', revenue: 187800, prevRevenue: 140000, orders: 1815 },
];

// ── Pie Chart Data ────────────────────────────────────────────────
export const pieData = [
  { name: 'Hoàn trả', value: 30 },
  { name: 'Hủy đơn', value: 15 },
];
export const PIE_COLORS = ['#f59e0b', '#ef4444'];

// ── Recent Orders ─────────────────────────────────────────────────
export const recentOrders = [
  { id: '#ORD-001', customer: 'Nguyễn Văn A', date: '20/10/2023', amount: '34.990.000đ', status: 'completed' },
  { id: '#ORD-002', customer: 'Trần Thị B', date: '20/10/2023', amount: '15.990.000đ', status: 'processing' },
  { id: '#ORD-003', customer: 'Lê Văn C', date: '19/10/2023', amount: '4.990.000đ', status: 'shipping' },
  { id: '#ORD-004', customer: 'Phạm Thị D', date: '19/10/2023', amount: '2.490.000đ', status: 'cancelled' },
];

// ── Top Products ──────────────────────────────────────────────────
export const topProducts = [
  { id: 1, name: 'iPhone 15 Pro Max 256GB', sold: 1245, revenue: '36.092.550.000đ', image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:50:50/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png' },
  { id: 2, name: 'MacBook Pro 14 M3 Pro', sold: 856, revenue: '42.791.440.000đ', image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:50:50/q:90/plain/https://cellphones.com.vn/media/catalog/product/m/a/macbook-pro-14-2024-m4-1.png' },
  { id: 3, name: 'Samsung Galaxy S24 Ultra', sold: 643, revenue: '20.569.570.000đ', image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:50:50/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-s24-ultra.png' },
  { id: 4, name: 'AirPods Pro Gen 2', sold: 2105, revenue: '12.608.950.000đ', image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:50:50/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/r/group_169_1.png' },
];

// ── Top Categories ────────────────────────────────────────────────
export const topCategories = [
  { id: 1, name: 'Điện thoại thông minh', sold: 4521, percent: 45 },
  { id: 2, name: 'Laptop & MacBook', sold: 2145, percent: 25 },
  { id: 3, name: 'Âm thanh', sold: 3210, percent: 15 },
  { id: 4, name: 'Phụ kiện', sold: 5412, percent: 15 },
];

// ── Category Sales ────────────────────────────────────────────────
export const categorySalesDay = [
  { name: 'Laptop', sold: 4 },
  { name: 'Điện thoại', sold: 2 },
  { name: 'Âm thanh', sold: 3 },
  { name: 'Màn hình', sold: 1 },
  { name: 'Phụ kiện', sold: 5 },
  { name: 'Máy tính bảng', sold: 0 },
];

export const categorySalesWeek = [
  { name: 'Laptop', sold: 25 },
  { name: 'Điện thoại', sold: 18 },
  { name: 'Âm thanh', sold: 12 },
  { name: 'Màn hình', sold: 6 },
  { name: 'Phụ kiện', sold: 30 },
  { name: 'Máy tính bảng', sold: 8 },
];

export const categorySalesMonth = [
  { name: 'Laptop', sold: 120 },
  { name: 'Điện thoại', sold: 95 },
  { name: 'Âm thanh', sold: 85 },
  { name: 'Màn hình', sold: 22 },
  { name: 'Phụ kiện', sold: 150 },
  { name: 'Máy tính bảng', sold: 35 },
];

export const categorySalesYear = [
  { name: 'Laptop', sold: 1800 },
  { name: 'Điện thoại', sold: 1450 },
  { name: 'Âm thanh', sold: 1250 },
  { name: 'Màn hình', sold: 390 },
  { name: 'Phụ kiện', sold: 2100 },
  { name: 'Máy tính bảng', sold: 560 },
];

export const CATEGORY_COLORS = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];

export type CategoryPeriod = 'day' | 'week' | 'month' | 'year';

export const categoryDataMap: Record<CategoryPeriod, typeof categorySalesDay> = {
  day: categorySalesDay,
  week: categorySalesWeek,
  month: categorySalesMonth,
  year: categorySalesYear,
};

export const categoryPeriodLabels: Record<CategoryPeriod, string> = {
  day: 'Theo ngày',
  week: 'Theo tuần',
  month: 'Theo tháng',
  year: 'Theo năm',
};

// ── Top Customers ─────────────────────────────────────────────────
export const topCustomers = [
  { id: 1, name: 'Trần Đại Quang', spent: '156.450.000đ', orders: 12, avatar: 'https://i.pravatar.cc/50?img=1' },
  { id: 2, name: 'Lê Thị Hoa', spent: '98.200.000đ', orders: 8, avatar: 'https://i.pravatar.cc/50?img=5' },
  { id: 3, name: 'Phạm Minh Tuấn', spent: '75.500.000đ', orders: 15, avatar: 'https://i.pravatar.cc/50?img=8' },
  { id: 4, name: 'Hoàng Văn Thái', spent: '62.100.000đ', orders: 5, avatar: 'https://i.pravatar.cc/50?img=12' },
];

// ── Review Stats ──────────────────────────────────────────────────
export const reviewStats = {
  total: 4521,
  thisMonth: 342,
  average: 4.8,
  distribution: [
    { stars: 5, count: 3800, percent: 84 },
    { stars: 4, count: 500, percent: 11 },
    { stars: 3, count: 150, percent: 3 },
    { stars: 2, count: 50, percent: 1 },
    { stars: 1, count: 21, percent: 1 },
  ]
};

// ── Helper ────────────────────────────────────────────────────────
export function getChartSummary(data: { name: string; revenue: number }[]) {
  const total = data.reduce((s, d) => s + d.revenue, 0);
  const avg = Math.round(total / data.length);
  const max = data.reduce((m, d) => (d.revenue > m.revenue ? d : m), data[0]);
  return { total, avg, maxDay: max.name, maxVal: max.revenue };
}
