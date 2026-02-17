
import React, { memo } from 'react';
import { Drug } from '../types.ts';
import { Pill, ArrowUpRight, TrendingDown, ChevronLeft, Calendar, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

interface DrugCardProps {
  drug: Drug;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenInfo: (drug: Drug) => void;
  index: number;
}

export const DrugCard = memo(({ drug, onOpenInfo, index }: DrugCardProps) => {
  const MDiv = motion.div as any;
  const pNew = drug.price_new !== null ? Number(drug.price_new) : null;
  const pOld = drug.price_old !== null ? Number(drug.price_old) : null;
  const hasPriceChange = pNew !== null && pOld !== null && pNew !== pOld;
  const isIncrease = hasPriceChange && pNew! > pOld!;
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'محدث الآن';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  };

  return (
    <MDiv 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
      onClick={() => onOpenInfo(drug)}
      className="group active:scale-[0.97] transition-all cursor-pointer"
    >
      <div className="premium-card relative w-full rounded-[40px] p-8 flex flex-col gap-6 overflow-hidden shadow-2xl hover:border-white/10 transition-colors">
        {/* Decorative background gradients */}
        {hasPriceChange && (
          <div className={`absolute -top-16 -right-16 w-48 h-48 blur-[100px] opacity-[0.15] ${isIncrease ? 'bg-red-500' : 'bg-emerald-500'}`} />
        )}
        <div className="absolute -bottom-16 -left-16 w-48 h-48 blur-[100px] opacity-10 bg-blue-600" />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
               <div className={`p-1.5 rounded-lg ${hasPriceChange ? (isIncrease ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500') : 'bg-zinc-800 text-zinc-500'}`}>
                  <Tag size={12} strokeWidth={3} />
               </div>
               <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{drug.company || 'شركة الأدوية'}</span>
            </div>
            <h3 className="text-xl font-black text-white leading-tight mb-2 truncate group-hover:text-blue-400 transition-colors">
              {drug.name_en}
            </h3>
            <p className="text-[14px] font-bold text-zinc-400">
              {drug.name_ar || 'الإسم العربي غير متوفر'}
            </p>
          </div>

          <div className="shrink-0 ml-4">
            <div className={`w-14 h-14 rounded-3xl flex items-center justify-center border-2 ${hasPriceChange ? (isIncrease ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500') : 'bg-[#1a1a1c] border-white/5 text-zinc-600'}`}>
              <Pill size={28} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between mt-2 relative z-10">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white tracking-tighter">
                {pNew !== null ? pNew.toFixed(2) : '--'}
              </span>
              <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">EGP</span>
            </div>
            {hasPriceChange && (
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm font-bold text-zinc-600 line-through decoration-zinc-700 decoration-2">{pOld?.toFixed(2)}</span>
                <div className={`px-3 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 ${isIncrease ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'}`}>
                   {isIncrease ? <ArrowUpRight size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
                   {pOld && pNew ? `${Math.abs(((pNew - pOld) / pOld) * 100).toFixed(0)}%` : ''}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-3">
             <div className="px-4 py-2.5 bg-[#1a1a1c] rounded-2xl flex items-center gap-2 border border-white/5">
                <Calendar size={14} className="text-zinc-500" />
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">{formatDate(drug.api_updated_at)}</span>
             </div>
             <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-600/30 group-hover:scale-110 transition-transform">
                <ChevronLeft size={24} strokeWidth={3} />
             </div>
          </div>
        </div>
      </div>
    </MDiv>
  );
});
