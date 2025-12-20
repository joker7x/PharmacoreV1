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
    <div className="w-full bg-slate-200/50 dark:bg-white/5 rounded-[30px] p-1.5 flex items-center border border-slate-200/50 dark:border-white/10">
      {tabs.map((tab) => {
        const isActive = current === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[24px] transition-all duration-300 relative ${isActive ? 'text-blue-600 dark:text-white' : 'text-slate-500 dark:text-zinc-400'}`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white dark:bg-zinc-800 shadow-sm rounded-[24px] border border-slate-100 dark:border-white/10"
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <span className={`transition-transform duration-300 ${isActive ? 'scale-110 font-bold text-blue-500 dark:text-white' : 'scale-100 opacity-80'}`}>
                {tab.icon}
              </span>
              <span className={`text-[13px] ${isActive ? 'font-black' : 'font-bold opacity-80'}`}>{tab.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
};