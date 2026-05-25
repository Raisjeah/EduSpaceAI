'use client';

import { motion, useReducedMotion, useInView } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

export default function FloatingOrbs() {
  const [isMobile, setIsMobile] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const isInView = useInView(containerRef);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const blurValue = isMobile ? 'blur-[40px]' : 'blur-[80px]';
  const blurValueLarge = isMobile ? 'blur-[50px]' : 'blur-[100px]';
  const blurValueMedium = isMobile ? 'blur-[45px]' : 'blur-[90px]';

  // Disable animations if not in view or if user prefers reduced motion
  const animateStatus = !isInView || shouldReduceMotion ? false : true;

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <motion.div
        animate={animateStatus ? {
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1],
        } : {}}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute top-[10%] left-[15%] w-64 h-64 bg-brand-primary/20 rounded-full ${blurValue} will-change-[transform,opacity]`}
      />
      <motion.div
        animate={animateStatus ? {
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.15, 0.05],
        } : {}}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className={`absolute bottom-[20%] right-[10%] w-96 h-96 bg-blue-400/15 rounded-full ${blurValueLarge} will-change-[transform,opacity]`}
      />
      {!isMobile && (
        <>
          <motion.div
            animate={animateStatus ? {
              x: [0, 40, 0],
              scale: [1, 1.1, 1],
              opacity: [0.05, 0.1, 0.05],
            } : {}}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className={`absolute top-[40%] right-[30%] w-72 h-72 bg-blue-500/10 rounded-full ${blurValueMedium} will-change-[transform,opacity]`}
          />
          <motion.div
            animate={animateStatus ? {
              y: [0, -40, 0],
              scale: [1, 1.15, 1],
              opacity: [0.05, 0.12, 0.05],
            } : {}}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
            className={`absolute bottom-[10%] left-[20%] w-80 h-80 bg-brand-primary/10 rounded-full ${blurValue} will-change-[transform,opacity]`}
          />
        </>
      )}
    </div>
  );
}
