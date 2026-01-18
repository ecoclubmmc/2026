import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Badge } from '../types';

export default function HolographicBadge({ badge }: { badge: Badge }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);

  function handleMouse(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  }

  const isLocked = badge.status === 'locked';
  const isPending = badge.status === 'pending';

  return (
    <motion.div
      style={{ perspective: 1000 }}
      className="relative w-24 h-32 group"
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      <motion.div
        style={{ rotateX: isLocked ? 0 : rotateX, rotateY: isLocked ? 0 : rotateY }}
        className={`w-full h-full rounded-xl flex flex-col items-center justify-center p-4 border transition-all duration-300 relative overflow-hidden ${
          isLocked 
            ? 'bg-slate-200 border-slate-300 opacity-70 grayscale' 
            : isPending
              ? 'bg-slate-100 border-slate-300'
              : 'bg-gradient-to-br from-white/90 to-emerald-50/50 backdrop-blur-md border-emerald-200 shadow-xl'
        }`}
      >
        <div className={`text-4xl mb-3 filter drop-shadow-md transition-transform duration-300 ${!isLocked && 'group-hover:scale-110'}`}>
          {isLocked ? '❓' : badge.image}
        </div>
        <div className="text-xs font-bold text-center text-slate-700 z-10 relative">{badge.name}</div>
        
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 z-20">
             <div className="bg-slate-800 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Pending</div>
          </div>
        )}

        {!isLocked && !isPending && (
           <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 animate-pulse" style={{ mixBlendMode: 'overlay' }} />
        )}
      </motion.div>
    </motion.div>
  );
}
