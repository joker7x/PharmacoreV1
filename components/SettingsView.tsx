
import React from 'react';
import { Moon, Info, Settings, ShieldCheck, Smartphone, ChevronLeft, User, ExternalLink, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface SettingsViewProps {
  user: any;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onClearFavorites: () => void;
  onBack: () => void;
}

const SettingSection = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="mb-6">
    <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3 px-4 flex items-center gap-2">
      {title}
    </h3>
    <div className="bg-white dark:bg-white/5 rounded-[32px] overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm">
      {children}
    </div>
  </div>
);

const SettingItem = ({ icon: Icon, label, action, isLast = false, valueLabel, color = "blue" }: any) => (
  <motion.button
      whileTap={{ backgroundColor: "rgba(0,0,0,0.02)" }}
      onClick={action}
      className={`w-full flex items-center justify-between p-5 ${!isLast ? 'border-b border-slate-50 dark:border-white/5' : ''} transition-colors text-right`}
  >
      <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-2xl bg-${color}-50 dark:bg-${color}-500/10 text-${color}-500 dark:text-${color}-400`}>
              <Icon size={18} strokeWidth={2.5} />
          </div>
          <span className="font-black text-[15px] text-slate-700 dark:text-slate-200">{label}</span>
      </div>
      <div className="flex items-center gap-2">
          {valueLabel && <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-lg uppercase">{valueLabel}</span>}
          {action && <ChevronLeft size={16} className="text-slate-300 dark:text-slate-600" />}
      </div>
  </motion.button>
);

export const SettingsView: React.FC<SettingsViewProps> = ({ user, darkMode, toggleDarkMode, onBack }) => {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="pt-14 px-6 pb-32 min-h-screen">
        <div className="flex items-center gap-4 mb-10 pt-4">
            <div className="w-14 h-14 rounded-[22px] bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <Settings size={28} strokeWidth={2.5} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">الإعدادات</h1>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">App Configuration</p>
            </div>
        </div>

        {user && (
          <div className="mb-8 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] text-white shadow-2xl shadow-blue-500/30 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16" />
             <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-2xl font-black">
                   {user.first_name?.[0] || 'U'}
                </div>
                <div className="flex-1">
                   <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black">{user.first_name} {user.last_name}</h2>
                      {user.username && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">@{user.username}</span>}
                   </div>
                   <p className="text-[10px] font-black text-blue-100/70 uppercase tracking-widest mt-1">ID: {user.id}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                   <User size={20} />
                </div>
             </div>
          </div>
        )}

        <SettingSection title="المظهر والخصوصية">
            <div className="w-full flex items-center justify-between p-5 border-b border-slate-50 dark:border-white/5">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
                        <Moon size={18} strokeWidth={2.5} />
                    </div>
                    <span className="font-black text-[15px] text-slate-700 dark:text-slate-200">الوضع الليلي</span>
                </div>
                <div onClick={toggleDarkMode} dir="ltr" className={`w-12 h-7 rounded-full p-1 cursor-pointer flex items-center transition-all duration-300 ${darkMode ? 'bg-indigo-500' : 'bg-slate-200'}`}>
                    <motion.div layout className="w-5 h-5 bg-white rounded-full shadow-sm" animate={{ x: darkMode ? 20 : 0 }} />
                </div>
            </div>
            <SettingItem icon={Shield} label="إدارة البيانات والخصوصية" color="emerald" />
        </SettingSection>

        <SettingSection title="حول التطبيق">
             <SettingItem icon={Info} label="إصدار التطبيق" valueLabel="v2.0.0-tma" color="amber" />
             <SettingItem icon={ShieldCheck} label="سياسة الاستخدام" color="blue" />
             <SettingItem icon={Smartphone} label="تواصل مع المطور" isLast color="rose" />
        </SettingSection>

        <div className="bg-slate-50 dark:bg-white/5 rounded-[32px] p-6 border border-slate-100 dark:border-white/5 mb-8">
           <div className="flex items-center gap-2 mb-3">
              <Shield size={16} className="text-emerald-500" />
              <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">التزام الخصوصية</h4>
           </div>
           <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              نحن نحتفظ ببيانات ملفك الشخصي في تليجرام (الاسم والمعرف) لتخصيص تجربتك ومراقبة أداء النظام. لا يتم مشاركة هذه البيانات مع أي أطراف خارجية.
           </p>
        </div>

        <div className="text-center mb-6">
            <p className="text-slate-300 dark:text-zinc-700 text-[10px] font-black tracking-[0.3em] uppercase mb-1">DWA Prices Premium</p>
            <p className="text-slate-300 dark:text-zinc-700 text-[10px] font-bold">Encrypted Telegram WebApp Connection</p>
        </div>
    </motion.div>
  );
}
