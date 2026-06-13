'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ChevronRight, ChevronLeft, CheckCircle2, Search, BookOpen, Edit3, Mic, FolderKanban } from 'lucide-react';
import { completeOnboarding } from '@/app/actions/authActions';
import useAuth from '@/hooks/useAuth';
import Link from 'next/link';

const TOUR_STEPS = [
  {
    title: "Selamat Datang di EduSpaceAI!",
    content: "Halo! Saya Prof. Kore, asisten akademik berbasis AI milikmu. Mari berkeliling sejenak untuk mempelajari cara memanfaatkan platform ini agar riset dan penulisan skripsimu menjadi jauh lebih cepat dan berkualitas!",
    target: null,
    icon: <Sparkles className="text-indigo-500 animate-pulse" size={36} />
  },
  {
    title: "Proyek & Workspace",
    content: "Ini adalah Workspace utama kamu. Di sini kamu bisa membuat proyek baru. Setiap proyek akan memisahkan riwayat chat, catatan, dan dokumen penelitian yang sedang kamu analisis agar tidak bercampur.",
    target: "#sidebar-nav",
    icon: <FolderKanban className="text-indigo-500" size={28} />
  },
  {
    title: "Dosen AI / Model Selector",
    content: "Kamu bisa mengganti model AI yang kamu gunakan secara fleksibel. Kami mendukung model tercepat (Gemini 2.5 Flash), model analitis (Gemini 2.5 Pro), hingga model penulisan kreatif (Claude 4.5 Sonnet).",
    target: "#agent-selector-bar",
    icon: <Search className="text-indigo-500" size={28} />
  },
  {
    title: "AI Document Workspace",
    content: "Menulis draf skripsi atau paper akademik di sini sangat mudah. Buka folder Workspace, upload berkas, dan panggil asisten AI untuk memparafrase, meringkas, atau mengecek tata bahasa Indonesia akademik (PUEBI) langsung di dalam editor.",
    target: "#editor-nav-link",
    icon: <BookOpen className="text-indigo-500" size={28} />
  },
  {
    title: "Live Call dengan Prof. Kore",
    content: "Bosan mengetik? Kamu bisa mengklik tombol bimbingan suara ini untuk berdiskusi langsung menggunakan suara (seperti telepon biasa) dengan saya mengenai metodologi penelitian atau topik risetmu.",
    target: "#live-call-button",
    icon: <Mic className="text-indigo-500" size={28} />
  },
  {
    title: "Tingkatkan Produktivitas Akademik!",
    content: "Semua fitur dasar dapat kamu akses secara gratis setiap hari. Jika kamu membutuhkan memori riset jangka panjang, unggah dokumen besar, atau kuota harian yang lebih besar, kamu bisa meng-upgrade ke paket Premium.",
    target: null,
    icon: <CheckCircle2 className="text-indigo-500" size={36} />
  }
];

export default function OnboardingTour() {
  const { user, fetchUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);

  // Trigger tour if user has is_first_login set to true
  useEffect(() => {
    if (user && user.is_first_login) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [user]);

  const activeStep = TOUR_STEPS[currentStep];

  // Calculate bounding rect of the target element when step changes
  useEffect(() => {
    if (!isVisible) return;

    const calculateRect = () => {
      if (activeStep.target) {
        const el = document.querySelector(activeStep.target);
        if (el) {
          const r = el.getBoundingClientRect();
          setTargetRect(r);
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          setTargetRect(null);
        }
      } else {
        setTargetRect(null);
      }
    };

    // Calculate immediately and also wait a brief delay to let page settle
    calculateRect();
    const t = setTimeout(calculateRect, 300);

    window.addEventListener('resize', calculateRect);
    window.addEventListener('scroll', calculateRect);

    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', calculateRect);
      window.removeEventListener('scroll', calculateRect);
    };
  }, [currentStep, isVisible, activeStep.target]);

  // Keyboard controls
  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, currentStep]);

  const handleSkip = async () => {
    setIsVisible(false);
    try {
      const res = await completeOnboarding();
      if (res.success) {
        await fetchUser();
      }
    } catch (err) {
      console.error("Gagal mengakhiri onboarding:", err);
    }
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSkip();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Dynamic SVG Highlight Overlay Mask */}
      <div className="fixed inset-0 pointer-events-none z-[160] w-full h-full">
        <svg className="w-full h-full">
          <defs>
            <mask id="onboarding-cutout-mask">
              <rect width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect
                  x={targetRect.left - 8}
                  y={targetRect.top - 8}
                  width={targetRect.width + 16}
                  height={targetRect.height + 16}
                  rx={12}
                  ry={12}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.65)"
            mask="url(#onboarding-cutout-mask)"
            className="pointer-events-auto backdrop-blur-[2px]"
            onClick={handleSkip}
          />
        </svg>
      </div>

      {/* Tour Dialogue Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, type: "spring", stiffness: 260, damping: 26 }}
          ref={modalRef}
          className={`relative z-[170] w-full max-w-md bg-white/95 dark:bg-[#1C1C1C]/95 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col gap-6 ${
            activeStep.target ? 'md:absolute' : ''
          }`}
          style={
            activeStep.target && targetRect
              ? {
                  // Position the modal dynamically relative to the highlighted target element if on desktop
                  left: window.innerWidth > 768 ? `${Math.min(window.innerWidth - 460, Math.max(20, targetRect.left + (targetRect.width / 2) - 224))}px` : 'auto',
                  top: window.innerWidth > 768 ? `${Math.min(window.innerHeight - 400, Math.max(20, targetRect.bottom + 16))}px` : 'auto',
                }
              : {}
          }
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/20">
                {activeStep.icon}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                  {activeStep.title}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-widest font-bold mt-0.5">
                  Langkah {currentStep + 1} dari {TOUR_STEPS.length}
                </p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
              aria-label="Lewati onboarding"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed font-medium">
            {activeStep.content}
          </div>

          {/* Footer & Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 shrink-0">
            {/* Step Indicators */}
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    currentStep === idx ? 'w-4 bg-indigo-600' : 'bg-slate-300 dark:bg-gray-700 hover:bg-slate-400'
                  }`}
                  aria-label={`Pindah ke langkah ${idx + 1}`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-3.5 py-2 text-xs font-bold text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 transition-all flex items-center gap-1"
                >
                  <ChevronLeft size={14} /> Kembali
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-lg transition-all active:scale-[0.98] flex items-center gap-1"
              >
                {currentStep === TOUR_STEPS.length - 1 ? (
                  "Mulai Belajar"
                ) : (
                  <>Lanjut <ChevronRight size={14} /></>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
