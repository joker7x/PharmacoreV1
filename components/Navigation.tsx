
import React from 'react';
import { Home, BarChart2, MoreHorizontal, FileText, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppView } from '../types.ts';

interface BottomNavigationProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const tabs: { id: AppView; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'الرئيسية', icon: Home },
  { id: 'quiz', label: 'الأكاديمية', icon: Trophy },
  { id: 'stats', label: 'تحليل السوق', icon: BarChart2 },
  { id: 'settings', label: 'المزيد', icon: MoreHorizontal },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentView, onNavigate }) => {
  // Use any to bypass TypeScript errors for motion props
  const MDiv = motion.div as any;

  const handleNavClick = (view: AppView) => {
    if (view === 'home' && currentView === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    onNavigate(view);
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[100] flex justify-center px-6 pointer-events-none print:hidden">
      <div className="glass-effect rounded-[32px] px-2 py-1.5 shadow-2xl shadow-black/10 flex items-center justify-around w-full max-w-[440px] border border-white/40 dark:border-white/10 pointer-events-auto overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = currentView === tab.id;
          const Icon = tab.icon;
          return (
            <button 
              key={tab.id}
              onClick={() => handleNavClick(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-2xl transition-all duration-300 relative ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-zinc-500'}`}
            >
              <div className={`transition-all duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : 'scale-100 opacity-70'}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[9px] font-black tracking-tighter transition-all ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                {tab.label}
              </span>
              {isActive && (
                <MDiv 
                  layoutId="navIndicator"
                  className="absolute -top-1 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
