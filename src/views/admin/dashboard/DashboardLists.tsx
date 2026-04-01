import { Card } from '@/components/ui';
import { formatPrice } from '@/utils/format';
import type { DashboardChildProps } from './types';

export default function DashboardLists({ stats }: DashboardChildProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Products */}
      <Card>
        <h2 className="text-lg font-bold mb-6">Top sản phẩm bán chạy</h2>
        <div className="space-y-4">
          {(stats.topProducts || []).length === 0 ? (
            <div className="text-center text-slate-400 py-6">Chưa có dữ liệu</div>
          ) : (
            stats.topProducts.map((product, idx) => (
              <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="w-6 text-center font-bold text-slate-400">{idx + 1}</div>
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs">N/A</div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{product.name}</h4>
                  <p className="text-xs text-slate-500">{product.totalSold} đã bán</p>
                </div>
                <div className="text-right"><p className="font-bold text-sm text-purple-600 dark:text-purple-400">{formatPrice(product.revenue)}</p></div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Top Categories */}
        <Card>
          <h2 className="text-lg font-bold mb-6">Danh mục nổi bật</h2>
          <div className="space-y-4">
            {(stats.topCategories || []).length === 0 ? (
              <div className="text-center text-slate-400 py-6">Chưa có dữ liệu</div>
            ) : (
              (() => {
                const totalSold = stats.topCategories.reduce((s, c) => s + c.totalSold, 0) || 1;
                return stats.topCategories.map((cat) => {
                  const percent = Math.round((cat.totalSold / totalSold) * 100);
                  return (
                    <div key={cat.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-slate-500">{cat.totalSold} SP ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                });
              })()
            )}
          </div>
        </Card>

        {/* Top Customers */}
        <Card>
          <h2 className="text-lg font-bold mb-6">Khách hàng tiềm năng</h2>
          <div className="space-y-4">
            {(stats.topCustomers || []).length === 0 ? (
              <div className="text-center text-slate-400 py-6">Chưa có dữ liệu</div>
            ) : (
              stats.topCustomers.slice(0, 5).map((customer) => (
                <div key={customer.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold text-sm">
                    {customer.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{customer.name}</h4>
                    <p className="text-xs text-slate-500">{customer.totalOrders} đơn hàng</p>
                  </div>
                  <div className="text-right"><p className="font-bold text-sm text-blue-600 dark:text-blue-400">{formatPrice(customer.totalSpent)}</p></div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
