
import React from 'react';
import { Home, BarChart2, MoreHorizontal, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppView } from '../types.ts';

interface BottomNavigationProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentView, onNavigate }) => {
  const tabs: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'settings', label: 'المزيد', icon: <MoreHorizontal size={22} /> },
    { id: 'stats', label: 'إحصائيات', icon: <BarChart2 size={22} /> },
    { id: 'invoice', label: 'فاتورة', icon: <FileText size={22} /> },
    { id: 'home', label: 'الرئيسية', icon: <Home size={22} /> },
  ];

  const handleNavClick = (view: AppView) => {
    if (view === 'home' && currentView === 'home') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }
    onNavigate(view);
  };

  return (
    <div className="fixed bottom-8 left-0 right-0 z-[100] flex justify-center px-8 print:hidden">
      <div className="glass-effect rounded-[36px] px-6 py-2 shadow-mobile-lg flex items-center justify-between w-full max-w-[380px] border border-white/20 dark:border-white/10">
        {tabs.map((tab) => {
          const isActive = currentView === tab.id;
          return (
            <button 
              key={tab.id}
              onClick={() => handleNavClick(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-all duration-300 relative ${isActive ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-zinc-500'}`}
            >
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-1' : 'scale-100 opacity-80'}`}>
                {tab.icon}
              </div>
              <span className={`text-[10px] font-black tracking-tight transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="navActiveIndicator"
                  className="absolute bottom-1 w-1 h-1 bg-blue-500 dark:bg-blue-400 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"
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
