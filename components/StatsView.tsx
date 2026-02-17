
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, TrendingDown, Package, Activity, ChevronLeft, PieChart, ArrowUpRight } from 'lucide-react';
import { Drug, AdminStats } from '../types.ts';
import { fetchAdminStats } from '../services/api.ts';

interface StatsViewProps {
  drugs: Drug[];
  onBack: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ drugs, onBack }) => {
  // Use any to bypass TypeScript errors for motion props
  const MDiv = motion.div as any;
  const stats = useMemo(() => fetchAdminStats(drugs), [drugs]);

  const StatCard = ({ icon: Icon, title, value, subValue, color }: any) => (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-slate-100 dark:border-white/10 shadow-sm">
      <div className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center mb-5 text-white shadow-lg shadow-current/10`}>
        <Icon size={20} />
      </div>
      <div className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">{title}</div>
      <div className="text-2xl font-black text-slate-800 dark:text-white leading-none">{value}</div>
      {subValue && <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mt-1">{subValue}</div>}
    </div>
  );

  return (
    <MDiv 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pt-12 px-6 pb-40 min-h-screen"
    >
      <div className="flex items-center gap-4 mb-10">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-slate-400 dark:text-zinc-400 shadow-sm border border-slate-100 dark:border-white/10 active:scale-90 transition-transform">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">التحليلات</h1>
          <p className="text-[11px] text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-wider">Market Overview</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard icon={Package} title="إجمالي الأصناف" value={stats.totalDrugs.toLocaleString()} color="bg-blue-600" />
        <StatCard icon={Activity} title="أصناف متغيرة" value={stats.totalChanged.toLocaleString()} subValue="آخر 30 يوم" color="bg-indigo-600" />
      </div>

      <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/10 shadow-sm mb-6">
        <h3 className="text-xs font-black text-slate-400 dark:text-zinc-500 mb-6 flex items-center gap-2 uppercase tracking-widest">
          <PieChart size={14} className="text-blue-500" /> توزيع النطاق السعري
        </h3>
        <div className="space-y-6">
          <PriceRangeRow label="أقل من 50 ج.م" count={stats.priceRanges.low} total={stats.totalDrugs} color="bg-emerald-500" />
          <PriceRangeRow label="50 - 200 ج.م" count={stats.priceRanges.mid} total={stats.totalDrugs} color="bg-blue-500" />
          <PriceRangeRow label="أكثر من 200 ج.م" count={stats.priceRanges.high} total={stats.totalDrugs} color="bg-rose-500" />
        </div>
      </div>

      <div className="bg-zinc-900 p-8 rounded-[40px] border border-white/10 text-right overflow-hidden relative shadow-2xl">
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 blur-3xl -ml-16 -mt-16" />
        
        <h3 className="text-xs font-black text-white/50 mb-6 flex items-center gap-2 uppercase tracking-widest relative">
          <TrendingUp size={14} className="text-emerald-400" /> أكبر الارتفاعات السعرية
        </h3>
        <div className="space-y-3 relative">
          {stats.topGainers.map((drug, idx) => {
            const pNew = Number(drug.newPrice ?? drug.price_new ?? 0);
            const pOld = Number(drug.oldPrice ?? drug.price_old ?? 0);
            const percentage = pOld > 0 ? ((pNew - pOld) / pOld * 100).toFixed(0) : '0';
            
            return (
              <MDiv 
                key={idx} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/5"
              >
                <div className="flex-1 text-right min-w-0 pr-2">
                  <div className="text-[13px] font-bold text-slate-100 dark:text-zinc-100 truncate">{drug.name_en || drug.nameEn}</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-500 font-medium truncate">{drug.name_ar || drug.nameAr}</div>
                </div>
                <div className="text-left shrink-0">
                  <div className="text-[14px] font-black text-emerald-400 flex items-center gap-0.5">
                    <ArrowUpRight size={12} />
                    {percentage}%
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-zinc-400 font-bold">{pNew.toFixed(1)} ج.م</div>
                </div>
              </MDiv>
            );
          })}
        </div>
      </div>
    </MDiv>
  );
};

const PriceRangeRow = ({ label, count, total, color }: any) => {
  // Use any to bypass TypeScript errors for motion props
  const MDiv = motion.div as any;
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between text-[11px] font-black uppercase tracking-tight">
        <span className="text-slate-500 dark:text-zinc-500">{label}</span>
        <span className="text-slate-900 dark:text-white">{count} <span className="text-slate-400 font-bold dark:text-zinc-600">({total > 0 ? ((count/total)*100).toFixed(1) : 0}%)</span></span>
      </div>
      <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
        <MDiv 
          initial={{ width: 0 }}
          animate={{ width: `${total > 0 ? (count/total)*100 : 0}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${color}`} 
        />
      </div>
    </div>
  );
};
