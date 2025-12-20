
import React from 'react';
import { Moon, Info, Settings, ShieldCheck, Smartphone, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface SettingsViewProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  onClearFavorites: () => void;
  onBack: () => void;
}

const SettingSection = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="mb-6">
    <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
      {title}
    </h3>
    <div className="glass-panel rounded-[24px] overflow-hidden">
      {children}
    </div>
  </div>
);

const SettingItem = ({ icon: Icon, label, action, isLast = false, valueLabel }: any) => (
  <motion.button
      whileTap={{ backgroundColor: "rgba(0,0,0,0.05)" }}
      onClick={action}
      className={`w-full flex items-center justify-between p-4 ${!isLast ? 'border-b border-gray-100/50 dark:border-gray-700/50' : ''} transition-colors text-right`}
  >
      <div className="flex items-center gap-3.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400">
              <Icon size={18} strokeWidth={2} />
          </div>
          <span className="font-semibold text-[15px] text-gray-700 dark:text-gray-200">{label}</span>
      </div>
      <div className="flex items-center gap-2">
          {valueLabel && <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100/50 dark:bg-gray-800/50 px-2 py-1 rounded-md">{valueLabel}</span>}
          {action && <ChevronLeft size={16} className="text-gray-300 dark:text-gray-600" />}
      </div>
  </motion.button>
);

export const SettingsView: React.FC<SettingsViewProps> = ({ darkMode, toggleDarkMode, onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pt-14 px-5 pb-32 min-h-screen"
    >
        <div className="flex items-center gap-4 mb-8 pt-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Settings size={24} strokeWidth={2} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">الإعدادات</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">تخصيص تجربة الاستخدام</p>
            </div>
        </div>

        <SettingSection title="المظهر">
            <div className="w-full flex items-center justify-between p-4 border-b border-gray-100/50 dark:border-gray-700/50">
                <div className="flex items-center gap-3.5">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400">
                        <Moon size={18} strokeWidth={2} />
                    </div>
                    <span className="font-semibold text-[15px] text-gray-700 dark:text-gray-200">الوضع الليلي</span>
                </div>
                
                <div 
                    onClick={toggleDarkMode}
                    dir="ltr"
                    className={`w-12 h-7 rounded-full p-1 cursor-pointer flex items-center transition-colors duration-300 ease-in-out ${darkMode ? 'bg-indigo-500 shadow-indigo-200' : 'bg-gray-200'}`}
                >
                    <motion.div 
                        layout 
                        className="w-5 h-5 bg-white rounded-full shadow-sm"
                        animate={{ x: darkMode ? 20 : 0 }}
                    />
                </div>
            </div>
        </SettingSection>

        <SettingSection title="حول التطبيق">
             <SettingItem icon={Info} label="إصدار التطبيق" valueLabel="v1.1.0-live" />
             <SettingItem icon={ShieldCheck} label="سياسة الخصوصية" />
             <SettingItem icon={Smartphone} label="تواصل معنا" isLast />
        </SettingSection>

        <div className="text-center mt-12 mb-6">
            <p className="text-gray-300 dark:text-gray-600 text-[10px] font-mono tracking-widest uppercase mb-1">DWA Prices Live Feed</p>
            <p className="text-gray-300 dark:text-gray-600 text-[10px]">Direct API Connection (Medhome)</p>
        </div>
    </motion.div>
  );
}
