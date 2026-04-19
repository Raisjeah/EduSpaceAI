import { Menu, Search, User } from 'lucide-react';

export default function Header({ setIsSidebarOpen }) {
  return (
    <header className="flex justify-between items-center p-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setIsSidebarOpen(true)} className="text-gray-400 hover:text-white transition-colors md:hidden">
          <Menu size={20} />
        </button>
      </div>
      <div className="flex items-center gap-4 text-gray-400">
        <Search size={18} className="cursor-pointer hover:text-white" />
        <div className="w-7 h-7 rounded-full bg-[#333] flex items-center justify-center border border-[#444]">
          <User size={14} />
        </div>
      </div>
    </header>
  );
}
