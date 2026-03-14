import { FiBell, FiSearch, FiLogOut } from 'react-icons/fi';

interface AdminHeaderProps {
  onLogout: () => void;
}

export default function AdminHeader({ onLogout }: AdminHeaderProps) {
  return (
    <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96 hidden md:block group">
          <input
            type="text"
            placeholder="Tìm kiếm trong admin..."
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-purple-500 transition-colors" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative">
          <FiBell className="text-xl" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
        <button onClick={onLogout} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors">
          <img src="https://picsum.photos/seed/admin/100/100" alt="Admin" className="w-10 h-10 rounded-full object-cover" />
          <div className="hidden md:block text-sm text-left">
            <p className="font-bold">Admin Manager</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Super Admin</p>
          </div>
          <FiLogOut className="text-slate-400 ml-2" />
        </button>
      </div>
    </header>
  );
}
