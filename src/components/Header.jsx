import { Menu, Search, User } from 'lucide-react';

export default function Header({ setIsSidebarOpen, user }) {
  return (
    <header className="flex justify-between items-center p-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setIsSidebarOpen(true)} className="text-gray-400 hover:text-white transition-colors md:hidden">
          <Menu size={20} />
        </button>
      </div>
      <div className="flex items-center gap-4 text-gray-400">
        <Search size={18} className="cursor-pointer hover:text-white" />
        <div className="flex items-center gap-3 bg-[#1A1A1A] border border-white/5 py-1.5 pl-3 pr-1.5 rounded-full">
          <span className="text-[11px] font-bold text-gray-400">{user?.name || 'User'}</span>
          <div className="w-7 h-7 rounded-full bg-[#333] flex items-center justify-center border border-[#444] overflow-hidden">
            {user?.image ? <img src={user.image} alt="" /> : <User size={14} />}
          </div>
        </div>
      </div>
    </header>
  );
}
