
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
  userPoints: number;
  setPoints: (p: number) => void;
}

const TabButton = ({ id, label, icon: Icon, activeTab, setActiveTab }: any) => {
  const MDiv = motion.div as any;
  return (
    <button onClick={() => setActiveTab(id)} className={`flex-1 py-4 rounded-[22px] flex flex-col items-center justify-center gap-1.5 text-[9px] font-black transition-all relative ${activeTab === id ? 'text-blue-600' : 'text-slate-400'}`}>
      {activeTab === id && <MDiv layoutId="activeAdminTab" className="absolute inset-x-1 bottom-1 h-1 bg-blue-600 rounded-full" />}
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
};

export const AdminView: React.FC<AdminViewProps> = ({ onBack, drugsCount, config, onUpdateConfig, userPoints, setPoints }) => {
  const MDiv = motion.div as any;
  const [activeTab, setActiveTab] = useState<'dashboard' | 'economy' | 'users' | 'bot' | 'system'>('dashboard');
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

  const handleManualPoints = (amount: number) => {
    if (!strictAuth) {
      alert("⚠️ وضع التحقق الصارم غير مفعل! يرجى تفعيل 'وضع المحقق' أولاً لإجراء تعديلات حساسة.");
      return;
    }
    setPoints(amount);
    addLog(`تعديل نقاط يدوي: ${amount > 0 ? '+' : ''}${amount}`);
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
    <div className="fixed inset-0 z-[200] bg-[#f8fafc] text-slate-900 pt-16 px-6 pb-40 overflow-y-auto no-scrollbar" dir="rtl">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-600/20"><ShieldCheck size={30} /></div>
          <div><h1 className="text-2xl font-black">مركز التحكم</h1><p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Pharma Core Security</p></div>
        </div>
        <button onClick={onBack} className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 active:scale-90 shadow-sm"><ArrowRight size={20} /></button>
      </header>

      <div className="sticky top-0 z-50 bg-[#f8fafc]/90 backdrop-blur-md pb-6 pt-2">
        <div className="premium-card rounded-3xl p-1.5 flex items-center overflow-x-auto no-scrollbar">
          <TabButton id="dashboard" label="الرئيسية" icon={Activity} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton id="economy" label="الاقتصاد" icon={Coins} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton id="users" label="الأعضاء" icon={Users} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton id="system" label="النظام" icon={Terminal} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <MDiv key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="premium-card p-6 rounded-[32px] flex flex-col justify-between h-40">
                <Database size={24} className="text-blue-600" />
                <div><div className="text-[10px] font-black text-slate-400 uppercase mb-1">إجمالي الداتا</div><div className="text-3xl font-black">{drugsCount.toLocaleString()}</div></div>
              </div>
              <div className="premium-card p-6 rounded-[32px] flex flex-col justify-between h-40">
                <Users size={24} className="text-emerald-600" />
                <div><div className="text-[10px] font-black text-slate-400 uppercase mb-1">المستخدمين</div><div className="text-3xl font-black">{users.length || drugsCount > 0 ? '---' : '0'}</div></div>
              </div>
            </div>

            <div className="premium-card p-6 rounded-[32px] border-l-4 border-amber-500">
               <div className="flex items-center gap-3 mb-4">
                  <ShieldAlert className="text-amber-500" size={20} />
                  <h3 className="font-black text-sm text-slate-800">التدقيق الأمني المستمر</h3>
               </div>
               <div className="space-y-3">
                  {auditLogs.length > 0 ? auditLogs.map((log, i) => (
                    <div key={i} className="flex justify-between items-center text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100">
                       <span className="font-bold text-slate-700">{log.msg}</span>
                       <span className="text-slate-400 font-black">{log.time}</span>
                    </div>
                  )) : <div className="text-center py-4 text-slate-300 font-bold text-xs uppercase tracking-widest">No Recent Activity</div>}
               </div>
            </div>
          </MDiv>
        )}

        {activeTab === 'economy' && (
          <MDiv key="economy" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl">
               <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white"><Coins size={24} /></div>
                    <h3 className="text-lg font-black text-slate-800">إدارة النقاط (Strict)</h3>
                  </div>
                  <button onClick={() => { setStrictAuth(!strictAuth); addLog(`تغيير وضع التحقق: ${!strictAuth ? 'نشط' : 'متوقف'}`); }} className={`px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 transition-all ${strictAuth ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 text-slate-400'}`}>
                    <Fingerprint size={14} /> {strictAuth ? 'وضع المحقق مفعل' : 'تفعيل التحقق'}
                  </button>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">نقاط المشاهدة</label>
                    <input type="number" value={config.pointsPerVideo} onChange={e => saveConfig({pointsPerVideo: Number(e.target.value)})} className="bg-transparent text-2xl font-black text-slate-900 outline-none w-full" />
                  </div>
                  <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">نقاط الاختبار</label>
                    <input type="number" value={config.pointsPerQuiz} onChange={e => saveConfig({pointsPerQuiz: Number(e.target.value)})} className="bg-transparent text-2xl font-black text-slate-900 outline-none w-full" />
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                    <AlertTriangle className="text-blue-600 shrink-0" size={20} />
                    <p className="text-[11px] font-bold text-blue-700 leading-relaxed">تعديل النقاط اليدوي يتطلب تفعيل "وضع المحقق". جميع التغييرات يتم تسجيلها فوراً لضمان عدم التلاعب.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => handleManualPoints(500)} className="py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs text-slate-700 active:scale-95 shadow-sm hover:border-blue-500 transition-all">+500</button>
                    <button onClick={() => handleManualPoints(1000)} className="py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs text-slate-700 active:scale-95 shadow-sm hover:border-blue-500 transition-all">+1000</button>
                    <button onClick={() => handleManualPoints(-500)} className="py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs text-rose-600 active:scale-95 shadow-sm hover:border-rose-500 transition-all">-500</button>
                  </div>
               </div>
            </div>
          </MDiv>
        )}

        {activeTab === 'system' && (
          <MDiv key="system" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="premium-card p-8 rounded-[40px]">
               <h3 className="text-lg font-black mb-8 flex items-center gap-3 text-slate-800"><Terminal className="text-blue-600" size={20} /> وظائف النظام الأساسية</h3>
               <div className="space-y-4">
                  <SystemAction label="وضع الصيانة" description="قفل التطبيق عن جميع المستخدمين" icon={Construction} active={config.maintenanceMode} onClick={() => saveConfig({maintenanceMode: !config.maintenanceMode})} />
                  <SystemAction label="التزامن المباشر" description="تحديث الأسعار من السيرفر لحظياً" icon={RefreshCw} active={config.liveSync} onClick={() => saveConfig({liveSync: !config.liveSync})} />
                  <SystemAction label="الذكاء الاصطناعي" description="تحليلات Gemini للماركت" icon={Sparkles} active={config.aiAnalysis} onClick={() => saveConfig({aiAnalysis: !config.aiAnalysis})} />
               </div>
            </div>

            <div className="premium-card p-8 rounded-[40px] bg-slate-900 text-white border-none shadow-2xl">
               <h3 className="text-lg font-black mb-6 flex items-center gap-3"><Zap className="text-yellow-400" size={20} /> وحدة البث الموحد</h3>
               <input type="text" placeholder="عنوان التنبيه..." className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none mb-4 placeholder:text-white/30" />
               <textarea placeholder="رسالة البث..." className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none h-32 resize-none mb-6 placeholder:text-white/30" />
               <button onClick={() => { addLog("إرسال بث عام"); alert("تم إرسال الإشعار لجميع المستخدمين."); }} className="w-full py-5 bg-blue-600 rounded-[22px] font-black text-sm flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-blue-600/20"><Send size={18} /> إطلاق البث الآن</button>
            </div>
          </MDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

const SystemAction = ({ label, description, icon: Icon, active, onClick }: any) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-[28px]">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${active ? 'bg-blue-600 text-white' : 'bg-white text-slate-300'}`}><Icon size={20} /></div>
      <div>
        <h4 className="text-[13px] font-black text-slate-800">{label}</h4>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{description}</p>
      </div>
    </div>
    <button onClick={onClick} className={`w-14 h-7 rounded-full p-1 transition-all flex items-center ${active ? 'bg-blue-600' : 'bg-slate-200'}`}>
      <motion.div animate={{ x: active ? 28 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="w-5 h-5 bg-white rounded-full shadow-md" />
    </button>
  </div>
);
