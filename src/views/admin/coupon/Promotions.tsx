import { useState } from 'react';
import { FiPlus, FiSearch, FiFilter, FiEdit2, FiTrash2, FiGift } from 'react-icons/fi';

const mockPromotions = [
  { id: 1, name: 'Siêu Sale 11.11', type: 'Giảm giá toàn sàn', value: 'Lên đến 50%', startDate: '10/11/2023', endDate: '12/11/2023', status: 'active' },
  { id: 2, name: 'Black Friday', type: 'Flash Sale', value: 'Đồng giá 99k', startDate: '24/11/2023', endDate: '26/11/2023', status: 'scheduled' },
  { id: 3, name: 'Mừng Xuân Mới', type: 'Tặng quà', value: 'Tặng tai nghe', startDate: '01/01/2023', endDate: '15/01/2023', status: 'expired' },
];

export default function AdminPromotions() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Chương trình khuyến mãi</h1>
        <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2">
          <FiPlus /> Tạo chương trình
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Tìm kiếm chương trình..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
        </div>
        <div className="flex gap-2">
          <select className="h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 font-medium outline-none">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang diễn ra</option>
            <option value="scheduled">Sắp tới</option>
            <option value="expired">Đã kết thúc</option>
          </select>
          <button className="h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 font-medium">
            <FiFilter /> Lọc
          </button>
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                <th className="p-4 font-medium w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                </th>
                <th className="p-4 font-medium">Tên chương trình</th>
                <th className="p-4 font-medium">Loại / Ưu đãi</th>
                <th className="p-4 font-medium">Thời gian</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {mockPromotions.map((promo) => (
                <tr key={promo.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="p-4">
                    <input type="checkbox" className="rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
                        <FiGift />
                      </div>
                      <span className="font-bold">{promo.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{promo.type}</div>
                    <div className="text-sm text-purple-600 font-bold">{promo.value}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    <div>Từ: {promo.startDate}</div>
                    <div>Đến: {promo.endDate}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      promo.status === 'active' ? 'bg-green-100 text-green-600' :
                      promo.status === 'scheduled' ? 'bg-blue-100 text-blue-600' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {promo.status === 'active' ? 'Đang diễn ra' :
                       promo.status === 'scheduled' ? 'Sắp tới' : 'Đã kết thúc'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <FiEdit2 />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
