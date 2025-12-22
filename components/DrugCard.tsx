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
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3), ease: [0.23, 1, 0.32, 1] }}
      onClick={() => onOpenInfo(drug)}
      className="group active:scale-[0.98] transition-transform duration-200"
    >
      <div className="premium-card relative w-full rounded-[28px] p-5 overflow-hidden flex flex-col gap-4">
        {/* Subtle Accent for price changes */}
        {hasPriceChange && (
          <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-[60px] opacity-[0.08] dark:opacity-[0.15] ${isIncrease ? 'bg-red-500' : 'bg-emerald-500'}`} />
        )}

        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1 min-w-0">
            <h3 className="text-[17px] font-bold text-slate-900 dark:text-slate-50 leading-tight mb-1 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {drug.name_en}
            </h3>
            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
              {drug.name_ar || 'بدون اسم عربي'}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 mr-3 shrink-0">
            <div className={`w-11 h-11 rounded-[18px] flex items-center justify-center border transition-colors ${hasPriceChange ? (isIncrease ? 'bg-red-50/50 border-red-100 text-red-500 dark:bg-red-500/10 dark:border-red-500/20' : 'bg-emerald-50/50 border-emerald-100 text-emerald-500 dark:bg-emerald-500/10 dark:border-emerald-500/20') : 'bg-slate-50 border-slate-100 text-slate-400 dark:bg-zinc-800 dark:border-white/5'}`}>
              <Pill size={20} strokeWidth={2.5} />
            </div>
            {hasPriceChange && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${isIncrease ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                {isIncrease ? 'زيادة' : 'خصم'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between mt-auto relative z-10">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                {pNew !== null ? pNew.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--'}
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">ج.م</span>
            </div>
            {hasPriceChange && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[12px] font-medium text-slate-400 dark:text-slate-600 line-through">
                  {pOld?.toFixed(1)}
                </span>
                <div className={`flex items-center text-[11px] font-bold ${isIncrease ? 'text-red-500' : 'text-emerald-500'}`}>
                   {isIncrease ? <ArrowUpRight size={12} strokeWidth={2.5} /> : <TrendingDown size={12} strokeWidth={2.5} />}
                   {pOld && pNew ? `${Math.abs(((pNew - pOld) / pOld) * 100).toFixed(0)}%` : ''}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-800/80 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-1.5">
              <Calendar size={12} className="text-slate-400 dark:text-zinc-500" />
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                {formatDate(drug.api_updated_at)}
              </span>
            </div>
            
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 active:scale-90 transition-all">
              <ChevronLeft size={18} strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});