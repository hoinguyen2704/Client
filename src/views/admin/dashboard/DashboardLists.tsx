import { Card, UserAvatar } from '@/components';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '@/utils/format';
import type { DashboardChildProps } from './types';

export default function DashboardLists({ stats }: DashboardChildProps) {
  const { t } = useTranslation('adminDashboard');
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Top Products */}
      <Card>
        <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6">{t('overview.lists.topProductsTitle')}</h2>
        <div className="space-y-3 sm:space-y-4">
          {(stats.topProducts || []).length === 0 ? (
            <div className="text-center text-subtle py-6">{t('overview.lists.empty')}</div>
          ) : (
            stats.topProducts.map((product, idx) => (
              <div key={product.id} className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="w-6 text-center font-bold text-subtle">{idx + 1}</div>
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-subtle text-sm">
                    {t('overview.lists.imageFallback')}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-md truncate">{product.name}</h4>
                  <p className="text-sm text-muted">
                    {t('overview.lists.soldSuffix', { count: product.totalSold })}
                  </p>
                </div>
                <div className="text-right"><p className="font-bold text-md text-blue-600 dark:text-blue-400">{formatPrice(product.revenue)}</p></div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Right Column */}
      <div className="space-y-4 sm:space-y-6">
        {/* Top Categories */}
        <Card>
          <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6">{t('overview.lists.featuredCategoriesTitle')}</h2>
          <div className="space-y-3 sm:space-y-4">
            {(stats.topCategories || []).length === 0 ? (
              <div className="text-center text-subtle py-6">{t('overview.lists.empty')}</div>
            ) : (
              (() => {
                const totalSold = stats.topCategories.reduce((s, c) => s + c.totalSold, 0) || 1;
                return stats.topCategories.map((cat) => {
                  const percent = Math.round((cat.totalSold / totalSold) * 100);
                  return (
                    <div key={cat.id}>
                      <div className="flex justify-between text-md mb-1">
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-muted">
                          {t('overview.lists.categorySoldSuffix', {
                            count: cat.totalSold,
                            percent,
                          })}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full" style={{ width: `${percent}%` }} />
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
          <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6">{t('overview.lists.potentialCustomersTitle')}</h2>
          <div className="space-y-3 sm:space-y-4">
            {(stats.topCustomers || []).length === 0 ? (
              <div className="text-center text-subtle py-6">{t('overview.lists.empty')}</div>
            ) : (
              stats.topCustomers.slice(0, 5).map((customer) => (
                <div key={customer.id} className="flex items-center gap-4">
                  <UserAvatar name={customer.name} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-md truncate">{customer.name}</h4>
                    <p className="text-sm text-muted">
                      {t('overview.lists.ordersSuffix', { count: customer.totalOrders })}
                    </p>
                  </div>
                  <div className="text-right"><p className="font-bold text-md text-blue-600 dark:text-blue-400">{formatPrice(customer.totalSpent)}</p></div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
