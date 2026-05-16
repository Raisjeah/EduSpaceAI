'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { createTransaction } from '@/app/actions/subscriptionActions';
import { Check, Sparkles, Zap, Crown, ShieldCheck, PartyPopper } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const plans = [
  {
    id: 'free',
    name: 'FREE',
    price: '0',
    icon: <ShieldCheck className="text-slate-400" />,
    features: [
      'Gemini 2.5 Flash',
      '20 pesan / hari',
      'Konteks pendek',
      'Tanpa upload file',
    ],
    buttonText: 'Paket Saat Ini',
    disabled: true,
  },
  {
    id: 'classic',
    name: 'CLASSIC',
    price: '50.000',
    icon: <Zap className="text-blue-500" />,
    features: [
      'Gemini 2.5 Pro',
      '150 pesan / hari',
      'Upload File & Gambar',
      'Chat Memory (7 hari)',
    ],
    buttonText: 'Pilih Classic',
    recommended: false,
  },
  {
    id: 'pro',
    name: 'PRO',
    price: '100.000',
    icon: <Sparkles className="text-purple-500" />,
    features: [
      'Gemini 3.1 Pro',
      '500 pesan / hari',
      'Advanced AI Agent',
      'Workspace Tools',
      'Pencarian Internet',
    ],
    buttonText: 'Pilih Pro',
    recommended: true,
  },
  {
    id: 'ultra',
    name: 'ULTRA',
    price: '200.000',
    promo: 'DISKON 70% Bulan Pertama',
    icon: <Crown className="text-amber-500" />,
    features: [
      'Claude 4.6 Sonnet',
      'Unlimited Fair Usage',
      'Long-term Project Memory',
      'Smart Project Tracking',
      'Respon Prioritas',
    ],
    buttonText: 'Pilih Ultra',
    recommended: false,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { userId, user, showNotification, fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchasedPlan, setPurchasedPlan] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (showSuccessModal && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showSuccessModal && countdown === 0) {
      router.push('/');
    }
  }, [showSuccessModal, countdown, router]);

  useEffect(() => {
    // Load Midtrans Snap script
    const script = document.createElement('script');
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  async function handleSubscribe(planName) {
    if (!userId) {
      showNotification('Silakan login terlebih dahulu');
      return;
    }

    setLoading(true);
    // Note: We need the actual plan MongoDB ID. For this demo, let's assume we find it by name.
    // In a real app, you'd fetch the plans first.
    // Assuming planName matches what's in our seeding.

    try {
      const result = await createTransaction(planName);

      if (result.success) {
        window.snap.pay(result.snapToken, {
          onSuccess: function(result) {
            setPurchasedPlan(planName);
            setShowSuccessModal(true);
            fetchUser(); // Update user state without reload
          },
          onPending: function(result) {
            showNotification('Menunggu pembayaran...');
          },
          onError: function(result) {
            showNotification('Pembayaran Gagal!');
          },
          onClose: function() {
            showNotification('Widget ditutup tanpa menyelesaikan pembayaran');
          }
        });
      } else {
        showNotification(result.error || 'Gagal memulai transaksi');
      }
    } catch (err) {
      showNotification('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0F0F0F] py-12 px-6 transition-colors">
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-200 dark:border-white/10"
            >
              <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <PartyPopper size={40} className="text-green-600 dark:text-green-500" />
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
                Selamat!
              </h2>
              <p className="text-slate-600 dark:text-gray-400 mb-8">
                Pembayaran berhasil. Paket <span className="font-bold text-indigo-600 dark:text-indigo-400">{purchasedPlan}</span> Anda kini telah aktif. Selamat menikmati fitur premium EduSpaceAI!
              </p>

              <div className="mb-6 text-xs text-slate-400 dark:text-gray-500">
                Mengalihkan ke dashboard dalam {countdown} detik...
              </div>

              <button
                onClick={() => router.push('/')}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                Mulai Chat Sekarang
                <Check size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
          Pilih Paket Belajar Pintarmu
        </h1>
        <p className="text-slate-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Tingkatkan produktivitas skripsimu dengan kekuatan AI tercanggih dan fitur memori cerdas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col p-8 rounded-3xl border transition-all ${
              plan.recommended
                ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-600/5 shadow-xl scale-105 z-10'
                : 'border-slate-200 dark:border-[#2A2A2A] bg-white dark:bg-[#151515]'
            }`}
          >
            {plan.recommended && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Paling Populer
              </div>
            )}

            {plan.promo && (
              <div className="mb-4 bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500 text-[10px] font-bold px-2 py-1 rounded uppercase w-fit">
                {plan.promo}
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl bg-slate-100 dark:bg-[#1E1E1E]`}>
                {plan.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{plan.name}</h3>
            </div>

            <div className="mb-6">
              <span className="text-slate-900 dark:text-white text-sm font-bold mr-1">Rp</span>
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
              <span className="text-slate-500 dark:text-gray-500 text-sm">/bulan</span>
            </div>

            <div className="space-y-4 mb-8 flex-1">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-gray-400">
                  <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleSubscribe(plan.name)}
              disabled={loading || plan.disabled || user?.current_plan === plan.name}
              className={`w-full py-3 rounded-2xl font-bold transition-all ${
                user?.current_plan === plan.name
                  ? 'bg-slate-100 dark:bg-[#252525] text-slate-400 cursor-not-allowed'
                  : plan.recommended
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90'
              } disabled:opacity-50`}
            >
              {user?.current_plan === plan.name ? 'Aktif' : plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-20 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8 text-slate-900 dark:text-white">Perbandingan Fitur</h2>
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-[#2A2A2A]">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-[#1A1A1A] border-b border-slate-200 dark:border-[#2A2A2A]">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-900 dark:text-white">Fitur</th>
                <th className="px-6 py-4 font-bold text-slate-900 dark:text-white text-center">FREE</th>
                <th className="px-6 py-4 font-bold text-slate-900 dark:text-white text-center">CLASSIC</th>
                <th className="px-6 py-4 font-bold text-slate-900 dark:text-white text-center">PRO</th>
                <th className="px-6 py-4 font-bold text-slate-900 dark:text-white text-center">ULTRA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E1E1E] text-slate-600 dark:text-gray-400">
              <tr>
                <td className="px-6 py-4">Daily Messages</td>
                <td className="px-6 py-4 text-center">20</td>
                <td className="px-6 py-4 text-center">150</td>
                <td className="px-6 py-4 text-center">500</td>
                <td className="px-6 py-4 text-center">Unlimited*</td>
              </tr>
              <tr>
                <td className="px-6 py-4">Upload File</td>
                <td className="px-6 py-4 text-center text-red-500">✕</td>
                <td className="px-6 py-4 text-center text-green-500">✓ (5MB)</td>
                <td className="px-6 py-4 text-center text-green-500">✓ (20MB)</td>
                <td className="px-6 py-4 text-center text-green-500">✓ (100MB)</td>
              </tr>
              <tr>
                <td className="px-6 py-4">AI Agent Level</td>
                <td className="px-6 py-4 text-center">Basic</td>
                <td className="px-6 py-4 text-center">Intermediate</td>
                <td className="px-6 py-4 text-center">Advanced</td>
                <td className="px-6 py-4 text-center">Full Access</td>
              </tr>
              <tr>
                <td className="px-6 py-4">Project Memory</td>
                <td className="px-6 py-4 text-center text-red-500">✕</td>
                <td className="px-6 py-4 text-center text-red-500">✕</td>
                <td className="px-6 py-4 text-center text-green-500">✓</td>
                <td className="px-6 py-4 text-center text-green-500">✓ (Long-term)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
