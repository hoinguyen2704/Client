import { FiMoreVertical } from 'react-icons/fi';
import { topProducts, topCategories, topCustomers } from '@/utils/mockDashboard';

export default function DashboardLists() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Products */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Top sản phẩm bán chạy</h2>
          <button className="text-slate-400 hover:text-purple-600"><FiMoreVertical /></button>
        </div>
        <div className="space-y-4">
          {topProducts.map((product, idx) => (
            <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="w-6 text-center font-bold text-slate-400">{idx + 1}</div>
              <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{product.name}</h4>
                <p className="text-xs text-slate-500">{product.sold} đã bán</p>
              </div>
              <div className="text-right"><p className="font-bold text-sm text-purple-600 dark:text-purple-400">{product.revenue}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Top Categories */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold mb-6">Danh mục nổi bật</h2>
          <div className="space-y-4">
            {topCategories.map((cat) => (
              <div key={cat.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-slate-500">{cat.sold} SP ({cat.percent}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full" style={{ width: `${cat.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold mb-6">Khách hàng tiềm năng</h2>
          <div className="space-y-4">
            {topCustomers.slice(0, 3).map((customer) => (
              <div key={customer.id} className="flex items-center gap-4">
                <img src={customer.avatar} alt={customer.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{customer.name}</h4>
                  <p className="text-xs text-slate-500">{customer.orders} đơn hàng</p>
                </div>
                <div className="text-right"><p className="font-bold text-sm text-blue-600 dark:text-blue-400">{customer.spent}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
