
import React, { useState } from 'react';
import { Moon, Info, Settings, ShieldCheck, Smartphone, ChevronLeft, User, ExternalLink, Shield, MessageSquare, Headphones, FileText, ScrollText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
          <div className={`p-2.5 rounded-2xl bg-${color}-50 dark:bg-${color}-500/10 text-${color}-600 dark:text-${color}-400`}>
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

const PolicyModal = ({ title, content, onClose }: { title: string, content: string, onClose: () => void }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md p-6 flex items-center justify-center">
    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[40px] p-8 max-h-[80vh] overflow-y-auto no-scrollbar relative">
      <button onClick={onClose} className="absolute top-6 left-6 w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
        <X size={20} />
      </button>
      <h2 className="text-xl font-black mb-6 text-slate-900 dark:text-white pt-2">{title}</h2>
      <div className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed space-y-4" dir="rtl">
        {content.split('\n').map((line, i) => <p key={i}>{line}</p>)}
      </div>
    </motion.div>
  </motion.div>
);

export const SettingsView: React.FC<SettingsViewProps> = ({ user, darkMode, toggleDarkMode, onBack }) => {
  const [modal, setModal] = useState<{ title: string, content: string } | null>(null);

  const openSupport = () => {
    const tgLink = "https://t.me/your_support_username"; // استبدلها بيوزرك
    window.open(tgLink, "_blank");
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="pt-14 px-6 pb-32 min-h-screen">
        <div className="flex items-center gap-4 mb-10 pt-4">
            <div className="w-14 h-14 rounded-[22px] bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <Settings size={28} strokeWidth={2.5} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Pharma Core</h1>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">مركز التحكم والتواصل</p>
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
                   </div>
                   <p className="text-[10px] font-black text-blue-100/70 uppercase tracking-widest mt-1">المعرف: {user.id}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                   <User size={20} />
                </div>
             </div>
          </div>
        )}

        <SettingSection title="المظهر">
            <div className="w-full flex items-center justify-between p-5">
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
        </SettingSection>

        <SettingSection title="الدعم والتواصل">
            <SettingItem icon={Headphones} label="الدعم الفني المباشر" color="emerald" action={openSupport} />
            <SettingItem icon={MessageSquare} label="أرسل اقتراح أو شكوى" color="indigo" action={openSupport} />
            <SettingItem icon={Smartphone} label="قناة التحديثات الرسمية" color="rose" isLast action={() => window.open("https://t.me/your_channel", "_blank")} />
        </SettingSection>

        <SettingSection title="القانون والسياسات">
            <SettingItem icon={ShieldCheck} label="سياسة الخصوصية" color="blue" action={() => setModal({ title: "سياسة الخصوصية", content: "نحن في Pharma Core نلتزم بحماية بياناتك الشخصية.\nلا يتم مشاركة بيانات هويتك في تليجرام مع أي أطراف ثالثة.\nيتم تخزين بيانات الكاش محلياً على جهازك لسرعة الوصول.\nاستخدامك للتطبيق يعني موافقتك على جمع إحصائيات الاستخدام لتحسين الخدمة." })} />
            <SettingItem icon={ScrollText} label="اتفاقية الاستخدام" color="amber" action={() => setModal({ title: "اتفاقية الاستخدام", content: "تطبيق Pharma Core هو أداة استرشادية لأسعار الدواء.\nالأسعار المعروضة هي الأسعار الرسمية المعلنة من الجهات المختصة.\nقد يحدث تأخير طفيف في تحديث البيانات بناءً على سرعة الاتصال.\nالإدارة غير مسؤولة عن أي قرارات شرائية تتم بناءً على البيانات دون الرجوع للصيدلي." })} />
            <SettingItem icon={Info} label="إصدار التطبيق" valueLabel="v3.1.2 Premium" color="slate" isLast />
        </SettingSection>

        <div className="text-center mb-6">
            <p className="text-slate-300 dark:text-zinc-700 text-[10px] font-black tracking-[0.3em] uppercase mb-1">Pharma Core Engine</p>
            <p className="text-slate-300 dark:text-zinc-700 text-[10px] font-bold">Encrypted Connection Protected</p>
        </div>

        <AnimatePresence>
          {modal && <PolicyModal title={modal.title} content={modal.content} onClose={() => setModal(null)} />}
        </AnimatePresence>
    </motion.div>
  );
}
