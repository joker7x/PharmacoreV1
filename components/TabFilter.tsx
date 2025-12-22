import React from 'react';
import { TabMode } from '../types';
import { LayoutGrid, TrendingUp, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface TabFilterProps { current: TabMode; onChange: (mode: TabMode) => void; }

export const TabFilter: React.FC<TabFilterProps> = ({ current, onChange }) => {
  const tabs: { id: TabMode; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'الكل', icon: <LayoutGrid size={18} /> },
    { id: 'changed', label: 'تغييرات', icon: <TrendingUp size={18} /> },
    { id: 'fav', label: 'المفضلة', icon: <Star size={18} /> },
  ];

  return (
    <div className="w-full bg-slate-100 dark:bg-zinc-900 rounded-[22px] p-1 flex items-center border border-slate-200 dark:border-white/5">
      {tabs.map((tab) => {
        const isActive = current === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[18px] transition-all duration-200 relative ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600'}`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white dark:bg-zinc-800 shadow-sm rounded-[18px] border border-slate-200 dark:border-white/10"
                transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <span className={`transition-all duration-300 ${isActive ? 'scale-110 text-blue-600 dark:text-blue-400' : 'scale-100'}`}>
                {tab.icon}
              </span>
              <span className={`text-[12px] ${isActive ? 'font-black' : 'font-bold'}`}>{tab.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
};