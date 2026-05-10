'use client';

import { useState, useEffect } from 'react';
import { updateProfile } from '@/app/actions/authActions';
import useAuth from '@/hooks/useAuth';
import { User, Mail, Save, ArrowLeft, Crown, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, userId, updateUserName } = useAuth();
  const [name, setName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsUpdating(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('name', name);
    formData.append('userId', userId);

    const result = await updateProfile(formData);

    if (result.success) {
      updateUserName(name);
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Gagal memperbarui profil' });
    }
    setIsUpdating(false);
  };

  if (!user) return null;

  return (
    <div className="p-8 max-w-2xl mx-auto h-full overflow-y-auto custom-scrollbar bg-white dark:bg-[#0F0F0F] transition-colors duration-200">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 hover:bg-slate-100 dark:hover:bg-[#1A1A1A] rounded-xl transition-colors text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Profil & Paket</h2>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-[2rem] border border-slate-200 dark:border-[#2A2A2A] p-8 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-inner mb-4 overflow-hidden">
            {user.image ? (
              <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-white" />
            )}
          </div>
          <p className="text-slate-500 dark:text-gray-400 text-sm">{user.email}</p>
        </div>

        {/* Subscription Card */}
        <div className="mb-10 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg">
                  <Crown size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 dark:text-gray-500 uppercase font-bold tracking-widest leading-none mb-1">Paket Saat Ini</p>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{user.current_plan || 'FREE'}</h3>
                </div>
              </div>
              <Link href="/pricing" className="px-4 py-2 bg-white text-indigo-600 hover:bg-indigo-50 text-xs font-bold rounded-xl transition-all shadow-lg">
                Upgrade
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-black/5 dark:bg-black/20 rounded-xl p-3">
                <p className="text-[10px] text-slate-500 dark:text-gray-500 uppercase font-bold mb-1">Status</p>
                <p className="text-sm text-slate-900 dark:text-gray-200 font-medium">Aktif</p>
              </div>
              <div className="bg-black/5 dark:bg-black/20 rounded-xl p-3">
                <p className="text-[10px] text-slate-500 dark:text-gray-500 uppercase font-bold mb-1">Masa Berlaku</p>
                <p className="text-sm text-slate-900 dark:text-gray-200 font-medium">
                  {user.plan_expired_at ? new Date(user.plan_expired_at).toLocaleDateString() : 'Selamanya'}
                </p>
              </div>
            </div>
          </div>
          <Sparkles className="absolute -bottom-6 -right-6 text-indigo-500/10 w-32 h-32" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest px-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 dark:text-gray-500">
                <User size={18} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full bg-slate-50 dark:bg-[#0F0F0F] border border-slate-200 dark:border-[#2A2A2A] rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-gray-200 outline-none focus:border-indigo-500/50 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-2 opacity-60">
            <label className="text-[12px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest px-1">
              Alamat Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 dark:text-gray-500">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full bg-slate-50 dark:bg-[#0F0F0F] border border-slate-200 dark:border-[#2A2A2A] rounded-xl py-3 pl-12 pr-4 text-slate-400 dark:text-gray-400 outline-none cursor-not-allowed text-sm"
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-gray-600 px-1 italic">Email tidak dapat diubah untuk saat ini.</p>
          </div>

          {message.text && (
            <div className={`p-4 rounded-xl text-sm font-medium ${
              message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isUpdating || name === user.name}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-gray-800 disabled:text-slate-400 dark:disabled:text-gray-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
          >
            {isUpdating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save size={18} /> Simpan Perubahan
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
