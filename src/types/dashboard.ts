//  Dashboard
export interface DashboardStatsResponse {
  totalRevenue: number;
  totalOrders: number;
  newOrders?: number;
  totalCustomers: number;
  newCustomers?: number;
  productsSold?: number;
  cancelledOrders?: number;
  returnedOrders?: number;
  totalFeedbacks?: number;
  newFeedbacks?: number;
  revenueChart?: RevenueChartItem[];
  topProducts?: TopProductItem[];
  topVariants?: TopVariantItem[];
  topCategories?: TopCategoryItem[];
  topCustomers?: TopCustomerItem[];
  recentOrders?: RecentOrderItem[];
  ratingDistribution?: Record<number, number>;
}

export interface DashboardSummaryResponse {
  totalRevenue: number;
  totalOrders: number;
  newOrders: number;
  totalCustomers: number;
  newCustomers: number;
  productsSold: number;
  cancelledOrders: number;
  returnedOrders: number;
  totalFeedbacks: number;
  newFeedbacks: number;
}

export interface DashboardRevenueResponse {
  revenueChart: RevenueChartItem[];
}

export interface DashboardTopListsResponse {
  topProducts?: TopProductItem[];
  topCategories?: TopCategoryItem[];
  topCustomers?: TopCustomerItem[];
}

export interface DashboardReviewStatsResponse {
  totalFeedbacks: number;
  newFeedbacks: number;
  ratingDistribution?: Record<number, number>;
}

export interface RevenueChartItem {
  label: string;
  revenue: number;
  orders: number;
}

export interface TopProductItem {
  id: string;
  name: string;
  imageUrl?: string;
  totalSold: number;
  revenue: number;
}

export interface TopVariantItem {
  variantId: string;
  productId: string;
  productName: string;
  variantName: string;
  totalSold: number;
  grossSoldQty?: number;
  returnedQty?: number;
  netSoldQty?: number;
  revenue: number;
}

export interface TopCategoryItem {
  id: string;
  name: string;
  totalSold: number;
  revenue: number;
}

export interface TopCustomerItem {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
}

export interface RecentOrderItem {
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}
