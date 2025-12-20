import React, { memo } from 'react';
import { Drug } from '../types';
import { Pill, ArrowUpRight, TrendingDown, ChevronLeft, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface DrugCardProps {
  drug: Drug;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenInfo: (drug: Drug) => void;
  index: number;
}

export const DrugCard = memo(({ drug, onOpenInfo, index }: DrugCardProps) => {
  const pNew = drug.price_new !== null ? Number(drug.price_new) : null;
  const pOld = drug.price_old !== null ? Number(drug.price_old) : null;
  const hasPriceChange = pNew !== null && pOld !== null && pNew !== pOld;
  const isIncrease = hasPriceChange && pNew! > pOld!;
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'محدث الآن';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short' }).format(date);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.4), ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onOpenInfo(drug)}
      className="group"
    >
      <div className="premium-card relative w-full rounded-[32px] p-6 overflow-hidden flex flex-col gap-4">
        {/* Top edge glow for dark mode visibility */}
        <div className="card-glow hidden dark:block"></div>
        
        {/* Price change background accent */}
        {hasPriceChange && (
          <div className={`absolute top-0 right-0 w-48 h-48 -mr-24 -mt-24 rounded-full blur-[80px] opacity-[0.05] dark:opacity-[0.2] ${isIncrease ? 'bg-rose-500' : 'bg-emerald-500'}`} />
        )}

        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1 min-w-0">
            {/* English Name - Explicit white for dark mode visibility */}
            <h3 className="text-[18px] font-bold text-slate-900 dark:text-white leading-[1.3] mb-1.5 break-words group-active:text-blue-500 transition-colors">
              {drug.name_en}
            </h3>
            {/* Arabic Name - High contrast secondary color for dark mode */}
            <p className="text-[14px] font-medium text-slate-500 dark:text-slate-300">
              {drug.name_ar}
            </p>
          </div>

          <div className="relative shrink-0 flex items-center gap-3 mr-4">
             {hasPriceChange && (
              <span className={`text-[11px] font-black px-2.5 py-1 rounded-xl shadow-sm ${isIncrease ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300'}`}>
                {isIncrease ? 'زيادة' : 'انخفاض'}
              </span>
            )}
            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-300 dark:text-zinc-500 border border-slate-100 dark:border-white/10 shadow-inner">
              <Pill size={24} />
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between mt-auto relative z-10">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-zinc-50 tracking-tighter">
                {pNew !== null ? pNew.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--'}
              </span>
              <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase">ج.م</span>
            </div>
            {hasPriceChange && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[12px] font-medium text-slate-400 dark:text-zinc-600 line-through">
                  {pOld?.toFixed(2)}
                </span>
                <div className={`flex items-center text-[11px] font-black ${isIncrease ? 'text-rose-500' : 'text-emerald-500'}`}>
                   {isIncrease ? <ArrowUpRight size={12} strokeWidth={3} className="ml-0.5" /> : <TrendingDown size={12} strokeWidth={3} className="ml-0.5" />}
                   {pOld && pNew ? `${Math.abs(((pNew - pOld) / pOld) * 100).toFixed(0)}%` : ''}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 rounded-full border border-slate-100 dark:border-white/5">
              <Calendar size={12} className="text-slate-400 dark:text-zinc-500" />
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                {formatDate(drug.api_updated_at)}
              </span>
            </div>
            
            <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-active:bg-blue-600 group-active:text-white transition-all shadow-sm">
              <ChevronLeft size={18} strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});