'use client';

import { useEffect, useState } from 'react';
import { User, Sparkles, MessageSquare, FileText, Calendar, ArrowRight, Settings, CreditCard, History, Plus, Briefcase } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { getUserUsageStats } from '@/app/actions/subscriptionActions';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SkeletonStatCard } from '@/components/ui/Skeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const data = await getUserUsageStats();
      setStats(data);
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 bg-slate-50 dark:bg-[#0F0F0F]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-[#222] animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-6 w-32 bg-slate-200 dark:bg-[#222] rounded animate-pulse"></div>
                <div className="h-4 w-48 bg-slate-200 dark:bg-[#222] rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-32 bg-slate-200 dark:bg-[#222] rounded-xl animate-pulse"></div>
              <div className="h-10 w-32 bg-slate-200 dark:bg-[#222] rounded-xl animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
          <div className="space-y-4">
             <div className="h-6 w-32 bg-slate-200 dark:bg-[#222] rounded animate-pulse"></div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="h-32 bg-slate-200 dark:bg-[#222] rounded-3xl animate-pulse"></div>
                <div className="h-32 bg-slate-200 dark:bg-[#222] rounded-3xl animate-pulse"></div>
                <div className="h-32 bg-slate-200 dark:bg-[#222] rounded-3xl animate-pulse"></div>
                <div className="h-32 bg-slate-200 dark:bg-[#222] rounded-3xl animate-pulse"></div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  const messageProgress = stats ? (stats.messagesUsed / stats.messageLimit) * 100 : 0;

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 bg-slate-50 dark:bg-[#0F0F0F]">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl border-4 border-white dark:border-[#1A1A1A] overflow-hidden">
              {user?.image ? (
                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user?.name}</h1>
              <p className="text-slate-500 dark:text-gray-400">{user?.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="px-3 py-1 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/20">
                  Paket {stats?.planName}
                </span>
                {stats?.daysRemaining > 0 && (
                  <span className="text-[11px] text-slate-400 font-medium">
                    Sisa {stats.daysRemaining} hari
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
             <Link href="/profile" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-xl text-sm font-bold text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-[#222] transition-all">
               <Settings size={16} /> Edit Profil
             </Link>
             <Link href="/pricing" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20">
               <Sparkles size={16} /> Ganti Paket
             </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Daily Messages */}
          <div className="bg-white dark:bg-[#151515] p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                <MessageSquare size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pesan Harian</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.messagesUsed}</span>
                <span className="text-sm text-slate-400 mb-1">/ {stats?.messageLimit}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-[#222] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(messageProgress, 100)}%` }}
                  className={`h-full ${messageProgress > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Batas pesan diperbarui setiap hari pukul 00:00 UTC.
              </p>
            </div>
          </div>

          {/* Live Call Usage */}
          <div className="bg-white dark:bg-[#151515] p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                <Sparkles size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Call</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stats?.liveCall?.used || 0} <span className="text-sm font-normal text-slate-400">mnt</span>
                </span>
                <span className="text-sm text-slate-400 mb-1">/ {stats?.liveCall?.limit === -1 ? '∞' : stats?.liveCall?.limit} mnt</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-[#222] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats?.liveCall?.limit > 0 ? Math.min(((stats?.liveCall?.used || 0) / stats?.liveCall?.limit) * 100, 100) : 0}%` }}
                  className="h-full bg-red-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {stats?.liveCall?.limit > 0 && stats?.liveCall?.windowResetAt ? (
                  <>Reset pada: <span className="font-bold text-slate-700 dark:text-gray-300">{new Date(stats.liveCall.windowResetAt).toLocaleTimeString('id-ID')}</span></>
                ) : 'Akses Live Call tidak tersedia / Unlimited'}
              </p>
            </div>
          </div>

          {/* Agent Requests */}
          <div className="bg-white dark:bg-[#151515] p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-2xl text-green-500">
                <User size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Agent Limit</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.agentRequests?.used || 0}</span>
                <span className="text-sm text-slate-400 mb-1">/ {stats?.agentRequests?.limit === -1 ? '∞' : stats?.agentRequests?.limit} req</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-[#222] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats?.agentRequests?.limit > 0 ? Math.min(((stats?.agentRequests?.used || 0) / stats?.agentRequests?.limit) * 100, 100) : 0}%` }}
                  className="h-full bg-green-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {stats?.agentRequests?.limit > 0 && stats?.agentRequests?.windowResetAt ? (
                  <>Reset pada: <span className="font-bold text-slate-700 dark:text-gray-300">{new Date(stats.agentRequests.windowResetAt).toLocaleTimeString('id-ID')}</span></>
                ) : 'Akses AI Agent tidak tersedia / Unlimited'}
              </p>
            </div>
          </div>

          {/* File Storage / Upload Window */}
          <div className="bg-white dark:bg-[#151515] p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                <FileText size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload File</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.fileUploadWindow?.used || 0}</span>
                <span className="text-sm text-slate-400 mb-1">/ {stats?.fileUploadWindow?.limit === -1 ? '∞' : stats?.fileUploadWindow?.limit} file</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-[#222] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats?.fileUploadWindow?.limit > 0 ? Math.min(((stats?.fileUploadWindow?.used || 0) / stats?.fileUploadWindow?.limit) * 100, 100) : 0}%` }}
                  className="h-full bg-amber-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {stats?.fileUploadWindow?.limit > 0 && stats?.fileUploadWindow?.windowResetAt ? (
                  <>Reset pada: <span className="font-bold text-slate-700 dark:text-gray-300">{new Date(stats.fileUploadWindow.windowResetAt).toLocaleTimeString('id-ID')}</span></>
                ) : 'Upload File Terbatas / Unlimited'}
              </p>
            </div>
          </div>

          {/* Plan Details */}
          <div className="bg-white dark:bg-[#151515] p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
                <CreditCard size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detail Paket</span>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900 dark:text-white">EduSpaceAI {stats?.planName}</span>
                <span className="text-xs text-slate-500">
                  {stats?.planExpiry ? `Berakhir pada ${new Date(stats.planExpiry).toLocaleDateString('id-ID', { dateStyle: 'long' })}` : 'Berlaku selamanya'}
                </span>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <li className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-gray-400">
                  <div className={`w-1.5 h-1.5 rounded-full ${stats?.imageUpload ? 'bg-green-500' : 'bg-slate-300'}`} />
                  Analisis Gambar: {stats?.imageUpload ? 'Aktif' : 'Tidak Aktif'}
                </li>
                <li className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-gray-400">
                  <div className={`w-1.5 h-1.5 rounded-full ${stats?.fileUpload ? 'bg-green-500' : 'bg-slate-300'}`} />
                  Upload Dokumen: {stats?.fileUpload ? 'Aktif' : 'Tidak Aktif'}
                </li>
                <li className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-gray-400">
                  <div className={`w-1.5 h-1.5 rounded-full ${stats?.liveCall?.enabled ? 'bg-green-500' : 'bg-slate-300'}`} />
                  Live Call (Prof. Kore): {stats?.liveCall?.enabled ? 'Aktif' : 'Tidak Aktif'}
                </li>
                <li className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-gray-400">
                  <div className={`w-1.5 h-1.5 rounded-full ${stats?.agentRequests?.enabled ? 'bg-green-500' : 'bg-slate-300'}`} />
                  AI Agent (Custom): {stats?.agentRequests?.enabled ? 'Aktif' : 'Tidak Aktif'}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
           <h2 className="text-lg font-bold text-slate-900 dark:text-white px-1">Aksi Cepat</h2>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickActionCard
                icon={<Plus className="text-indigo-500" />}
                title="Mulai Belajar"
                desc="Chat dengan Dosen AI"
                href="/"
              />
              <QuickActionCard
                icon={<Briefcase className="text-blue-500" />}
                title="Workspace"
                desc="Kelola Proyek & File"
                href="/workspace"
              />
              <QuickActionCard
                icon={<History className="text-amber-500" />}
                title="Billing"
                desc="Riwayat Pembayaran"
                href="/pricing"
              />
              <QuickActionCard
                icon={<Settings className="text-slate-500" />}
                title="Profil"
                desc="Pengaturan Akun"
                href="/profile"
              />
           </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ icon, title, desc, href }) {
  return (
    <Link href={href} className="bg-white dark:bg-[#151515] p-5 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
      <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-[#1A1A1A] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
      <p className="text-[10px] text-slate-500 leading-tight">{desc}</p>
    </Link>
  );
}
