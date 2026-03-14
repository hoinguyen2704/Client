import { useState } from 'react';
import { FiMessageCircle, FiCheckCircle, FiClock, FiSettings, FiActivity, FiUsers, FiCpu, FiMessageSquare } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const chatStats = [
  { name: 'T2', total: 120, resolved: 95 },
  { name: 'T3', total: 150, resolved: 120 },
  { name: 'T4', total: 180, resolved: 145 },
  { name: 'T5', total: 140, resolved: 110 },
  { name: 'T6', total: 200, resolved: 160 },
  { name: 'T7', total: 250, resolved: 190 },
  { name: 'CN', total: 220, resolved: 175 },
];

const recentChats = [
  { id: 'CHAT-001', user: 'Nguyễn Văn A', intent: 'Hỏi về bảo hành', status: 'resolved_ai', time: '10:30 AM', duration: '2m 15s' },
  { id: 'CHAT-002', user: 'Trần Thị B', intent: 'Kiểm tra đơn hàng', status: 'transferred', time: '10:15 AM', duration: '5m 30s' },
  { id: 'CHAT-003', user: 'Lê Văn C', intent: 'Tư vấn sản phẩm', status: 'resolved_ai', time: '09:45 AM', duration: '1m 45s' },
  { id: 'CHAT-004', user: 'Phạm D', intent: 'Hủy đơn hàng', status: 'transferred', time: '09:20 AM', duration: '8m 10s' },
];

export default function Chatbot() {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'logs'>('overview');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FiCpu className="text-purple-600" /> Quản lý AI Chatbot
          </h1>
          <p className="text-sm text-slate-500 mt-1">Powered by Alibaba Cloud Beebot</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 h-10 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors text-sm flex items-center gap-2">
            <FiSettings /> Cấu hình Beebot
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'overview' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
        >
          Tổng quan
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'settings' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
        >
          Cấu hình
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'logs' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
        >
          Lịch sử Chat
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Tổng lượt chat</p>
                  <h3 className="text-2xl font-bold">1,260</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                  <FiMessageCircle />
                </div>
              </div>
              <div className="text-sm text-green-500 font-medium">+15% so với tuần trước</div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Tỷ lệ giải quyết tự động</p>
                  <h3 className="text-2xl font-bold">78.5%</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-xl">
                  <FiCheckCircle />
                </div>
              </div>
              <div className="text-sm text-green-500 font-medium">+2.4% so với tuần trước</div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Chuyển CSKH</p>
                  <h3 className="text-2xl font-bold">21.5%</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl">
                  <FiUsers />
                </div>
              </div>
              <div className="text-sm text-red-500 font-medium">-1.2% so với tuần trước</div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Thời gian phản hồi TB</p>
                  <h3 className="text-2xl font-bold">1.2s</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl">
                  <FiClock />
                </div>
              </div>
              <div className="text-sm text-slate-500 font-medium">Ổn định</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold mb-6">Lưu lượng Chat (7 ngày)</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chatStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="total" name="Tổng lượt chat" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold mb-6">Tỷ lệ giải quyết (AI vs CSKH)</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chatStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="resolved" name="AI Giải quyết" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="total" name="Chuyển CSKH" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-bold">Lịch sử Chat gần đây</h2>
            <div className="flex gap-2">
              <input type="text" placeholder="Tìm kiếm user, intent..." className="h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="p-4 font-medium">Mã Chat</th>
                  <th className="p-4 font-medium">Khách hàng</th>
                  <th className="p-4 font-medium">Intent (Ý định)</th>
                  <th className="p-4 font-medium">Thời gian</th>
                  <th className="p-4 font-medium">Thời lượng</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                  <th className="p-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {recentChats.map((chat) => (
                  <tr key={chat.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-sm">{chat.id}</td>
                    <td className="p-4 text-sm">{chat.user}</td>
                    <td className="p-4 text-sm"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">{chat.intent}</span></td>
                    <td className="p-4 text-sm text-slate-500">{chat.time}</td>
                    <td className="p-4 text-sm text-slate-500">{chat.duration}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        chat.status === 'resolved_ai' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {chat.status === 'resolved_ai' ? 'AI đã giải quyết' : 'Chuyển CSKH'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Xem Log">
                        <FiMessageSquare />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <h2 className="text-lg font-bold mb-4">Cấu hình Prompt (Hành vi)</h2>
              <div>
                <label className="block font-medium mb-2">System Prompt</label>
                <textarea 
                  defaultValue="Bạn là nhân viên tư vấn của cửa hàng TechStore. Nhiệm vụ của bạn là tư vấn sản phẩm, giải đáp thắc mắc về bảo hành, giao hàng một cách lịch sự, chuyên nghiệp và ngắn gọn."
                  className="w-full h-48 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 resize-y outline-none"
                ></textarea>
                <p className="text-sm text-slate-500 mt-2">Định hướng cách Chatbot trả lời khách hàng.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <h2 className="text-lg font-bold mb-4">Cấu hình Giao diện</h2>
              
              <div>
                <label className="block font-medium mb-2">Tên Bot</label>
                <input type="text" defaultValue="TechStore Support" className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
              </div>

              <div>
                <label className="block font-medium mb-2">Màu sắc chủ đạo</label>
                <div className="flex items-center gap-3">
                  <input type="color" defaultValue="#9333ea" className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0" />
                  <input type="text" defaultValue="#9333ea" className="flex-1 h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 uppercase" />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-2">Avatar Bot</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=TechStore" alt="Bot Avatar" className="w-full h-full object-cover" />
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm">
                    Thay đổi
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors w-full">
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
