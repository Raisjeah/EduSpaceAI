'use client';

import { useState, useEffect } from 'react';
import { updateProfile } from '@/app/actions/authActions';
import useAuth from '@/hooks/useAuth';
import { User, Mail, Save, ArrowLeft } from 'lucide-react';
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
    <div className="p-8 max-w-2xl mx-auto h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 hover:bg-[#1A1A1A] rounded-xl transition-colors text-gray-400 hover:text-white">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold text-white">Edit Profil</h2>
      </div>

      <div className="bg-[#1A1A1A] rounded-[2rem] border border-[#2A2A2A] p-8 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-inner mb-4 overflow-hidden">
            {user.image ? (
              <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-white" />
            )}
          </div>
          <p className="text-gray-400 text-sm">{user.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest px-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                <User size={18} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl py-3 pl-12 pr-4 text-gray-200 outline-none focus:border-indigo-500/50 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-2 opacity-60">
            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest px-1">
              Alamat Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl py-3 pl-12 pr-4 text-gray-400 outline-none cursor-not-allowed text-sm"
              />
            </div>
            <p className="text-[10px] text-gray-600 px-1 italic">Email tidak dapat diubah untuk saat ini.</p>
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
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
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
