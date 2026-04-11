
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, ArrowRight, Activity, Database, Users, Sparkles, Globe, Construction, Bell, Send, 
  Bot, RefreshCw, Terminal, Settings as SettingsIcon, ShieldAlert, Coins, History, Ban, Lock, Unlock, 
  Save, AlertTriangle, Fingerprint, Eye, Zap, HeartPulse
} from 'lucide-react';
import { AdminConfig } from '../types.ts';
import { getAllUsers, updateGlobalConfig } from '../services/supabase.ts';

interface AdminViewProps {
  onBack: () => void;
  drugsCount: number;
  config: AdminConfig;
  onUpdateConfig: (config: Partial<AdminConfig>) => void;
  currentUser: any;
}

const TabButton = ({ id, label, icon: Icon, activeTab, setActiveTab }: any) => {
  const MDiv = motion.div as any;
  return (
    <button onClick={() => setActiveTab(id)} className={`flex-1 py-4 rounded-[22px] flex flex-col items-center justify-center gap-1.5 text-[9px] font-black transition-all relative ${activeTab === id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
      {activeTab === id && <MDiv layoutId="activeAdminTab" className="absolute inset-x-1 bottom-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />}
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
};

export const AdminView: React.FC<AdminViewProps> = ({ onBack, drugsCount, config, onUpdateConfig, currentUser }) => {
  const MDiv = motion.div as any;
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'bot' | 'system'>('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [strictAuth, setStrictAuth] = useState(false);
  const [auditLogs, setAuditLogs] = useState<{msg: string, time: string}[]>([]);

  const addLog = (msg: string) => {
    setAuditLogs(prev => [{ msg, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 19)]);
  };

  const saveConfig = async (updates: Partial<AdminConfig>) => {
    onUpdateConfig(updates);
    addLog(`تحديث إعدادات: ${Object.keys(updates).join(', ')}`);
    try {
      await updateGlobalConfig({...config, ...updates});
    } catch (e) {
      console.error("Failed to sync config to cloud", e);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      setLoading(true);
      getAllUsers().then(u => {
        setUsers(u);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [activeTab]);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 pt-14 px-4 pb-40 overflow-y-auto no-scrollbar transition-colors duration-300" dir="rtl">
      <header className="flex items-center justify-between mb-8 pt-4 px-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[20px] bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20"><ShieldCheck size={24} strokeWidth={2.5} /></div>
          <div><h1 className="text-2xl font-black tracking-tight">مركز التحكم</h1><p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-0.5">Pharma Core Security</p></div>
        </div>
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"><ArrowRight size={20} /></button>
      </header>

      <div className="sticky top-0 z-50 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md pb-6 pt-2 px-2">
        <div className="bg-white dark:bg-slate-900 rounded-[28px] p-1.5 flex items-center border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar">
          <TabButton id="dashboard" label="الرئيسية" icon={Activity} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton id="users" label="الأعضاء" icon={Users} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton id="system" label="النظام" icon={Terminal} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <MDiv key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 px-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 rounded-[28px] flex flex-col justify-between h-40">
                <Database size={24} className="text-blue-600 dark:text-blue-400" />
                <div><div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">إجمالي الداتا</div><div className="text-3xl font-black">{drugsCount.toLocaleString()}</div></div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 rounded-[28px] flex flex-col justify-between h-40">
                <Users size={24} className="text-emerald-600 dark:text-emerald-400" />
                <div><div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">المستخدمين</div><div className="text-3xl font-black">{users.length || drugsCount > 0 ? '---' : '0'}</div></div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 rounded-[28px] border-r-4 border-r-amber-500">
               <div className="flex items-center gap-3 mb-4">
                  <ShieldAlert className="text-amber-500" size={20} />
                  <h3 className="font-black text-sm text-slate-800 dark:text-slate-200">التدقيق الأمني المستمر</h3>
               </div>
               <div className="space-y-3">
                  {auditLogs.length > 0 ? auditLogs.map((log, i) => (
                    <div key={i} className="flex justify-between items-center text-[11px] bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                       <span className="font-bold text-slate-700 dark:text-slate-300">{log.msg}</span>
                       <span className="text-slate-400 dark:text-slate-500 font-black">{log.time}</span>
                    </div>
                  )) : <div className="text-center py-4 text-slate-300 dark:text-slate-600 font-bold text-xs uppercase tracking-widest">No Recent Activity</div>}
               </div>
            </div>
          </MDiv>
        )}

        {activeTab === 'system' && (
          <MDiv key="system" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="premium-card p-8 rounded-[40px]">
               <h3 className="text-lg font-black mb-8 flex items-center gap-3 text-slate-800 dark:text-slate-200"><Terminal className="text-blue-600 dark:text-blue-400" size={20} /> وظائف النظام الأساسية</h3>
               <div className="space-y-4">
                  <SystemAction label="وضع الصيانة" description="قفل التطبيق عن جميع المستخدمين" icon={Construction} active={config.maintenanceMode} onClick={() => saveConfig({maintenanceMode: !config.maintenanceMode})} />
                  <SystemAction label="التزامن المباشر" description="تحديث الأسعار من السيرفر لحظياً" icon={RefreshCw} active={config.liveSync} onClick={() => saveConfig({liveSync: !config.liveSync})} />
               </div>
            </div>

            <div className="premium-card p-8 rounded-[40px] bg-slate-900 dark:bg-slate-950 text-white border-none shadow-2xl">
               <h3 className="text-lg font-black mb-6 flex items-center gap-3"><Zap className="text-yellow-400" size={20} /> وحدة البث الموحد</h3>
               <input type="text" placeholder="عنوان التنبيه..." className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none mb-4 placeholder:text-white/30 text-white" />
               <textarea placeholder="رسالة البث..." className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none h-32 resize-none mb-6 placeholder:text-white/30 text-white" />
               <button onClick={() => { addLog("إرسال بث عام"); alert("تم إرسال الإشعار لجميع المستخدمين."); }} className="w-full py-5 bg-blue-600 rounded-[22px] font-black text-sm flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-blue-600/20"><Send size={18} /> إطلاق البث الآن</button>
            </div>
          </MDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

const SystemAction = ({ label, description, icon: Icon, active, onClick }: any) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px]">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${active ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-600'}`}><Icon size={20} /></div>
      <div>
        <h4 className="text-[13px] font-black text-slate-800 dark:text-slate-200">{label}</h4>
        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{description}</p>
      </div>
    </div>
    <button onClick={onClick} className={`w-14 h-7 rounded-full p-1 transition-all flex items-center ${active ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
      <motion.div animate={{ x: active ? 28 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="w-5 h-5 bg-white rounded-full shadow-md" />
    </button>
  </div>
);
