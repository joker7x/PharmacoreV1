
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Added Loader2 to the imports
import { ShieldCheck, ArrowRight, Activity, Cpu, Database, Zap, Trash2, BarChart3, Server, Construction, AlertCircle, Bell, Send, Users, MousePointer2, Clock, MessageSquare, Timer, Globe, Sparkles, Eye, User, Calendar, Loader2 } from 'lucide-react';
import { AppNotification } from '../types';
import { getAllUsers } from '../services/supabase.ts';

interface AdminViewProps {
  onBack: () => void;
  drugsCount: number;
  config: {
    aiAnalysis: boolean;
    marketCheck: boolean;
    maintenanceMode: boolean;
    maintenanceMessage: string;
    maintenanceTime: string;
    liveSync: boolean;
  };
  onUpdateConfig: (config: any) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBack, drugsCount, config, onUpdateConfig }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'features' | 'broadcast' | 'maintenance'>('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifType, setNotifType] = useState<'info' | 'warning' | 'success' | 'update'>('info');

  useEffect(() => {
    if (activeTab === 'users') {
      setLoadingUsers(true);
      getAllUsers().then(data => {
        setUsers(data);
        setLoadingUsers(false);
      });
    }
  }, [activeTab]);

  const handleBroadcast = () => {
    if (!notifTitle || !notifBody) { alert('يرجى ملء جميع الحقول'); return; }
    const newNotif: AppNotification = { id: Date.now().toString(), title: notifTitle, message: notifBody, type: notifType, timestamp: new Date().toISOString(), isRead: false };
    const existing = JSON.parse(localStorage.getItem('dwa_notifications') || '[]');
    localStorage.setItem('dwa_notifications', JSON.stringify([newNotif, ...existing]));
    setNotifTitle(''); setNotifBody(''); alert('تم بث الإشعار بنجاح لجميع المستخدمين');
  };

  const AdminCard = ({ children, title, icon: Icon, badge, color = "blue" }: any) => (
    <div className="bg-zinc-900/60 border border-white/5 rounded-[32px] p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-${color}-500/10 text-${color}-400`}>
            <Icon size={18} />
          </div>
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{title}</h3>
        </div>
        {badge && ( <span className={`text-[9px] font-black px-2 py-0.5 rounded-full bg-${color}-500/10 text-${color}-400 border border-${color}-500/20 uppercase`}>{badge}</span> )}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black text-white pt-16 px-6 pb-40 overflow-y-auto no-scrollbar" dir="rtl">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/40"><ShieldCheck size={28} /></div>
          <div><h1 className="text-2xl font-black tracking-tight">الإدارة المركزية</h1><div className="flex items-center gap-2 mt-1"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Telegram Root Terminal</span></div></div>
        </div>
        <button onClick={onBack} className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 active:scale-90 transition-all shadow-lg"><ArrowRight size={20} /></button>
      </div>

      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md pb-4 pt-2">
        <div className="flex bg-zinc-900 rounded-3xl p-1 border border-white/5 overflow-x-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'الحالة', icon: Activity },
            { id: 'users', label: 'المستخدمين', icon: Users },
            { id: 'features', label: 'الميزات', icon: Cpu },
            { id: 'broadcast', label: 'البث', icon: Bell },
            { id: 'maintenance', label: 'الصيانة', icon: Construction },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 min-w-[85px] py-4 rounded-[22px] flex items-center justify-center gap-2 text-[11px] font-black transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-zinc-500'}`}><tab.icon size={14} /> {tab.label}</button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <AdminCard title="إجمالي الأصناف" icon={Database} badge="Live" color="blue">
                  <div className="text-3xl font-black text-white">{drugsCount.toLocaleString()}</div>
                  <div className="text-[10px] text-zinc-500 font-bold mt-1">Medhome Feed</div>
                </AdminCard>
                <AdminCard title="المستخدمين" icon={Users} badge="Total" color="emerald">
                  <div className="text-3xl font-black text-white">{users.length || '--'}</div>
                  <div className="text-[10px] text-zinc-500 font-bold mt-1">Registered Accounts</div>
                </AdminCard>
              </div>
              <AdminCard title="مراقبة النظام" icon={Zap} badge="Real-time" color="indigo">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[11px] font-bold"><span className="text-zinc-500">استهلاك المعالجة</span><span className="text-white">Low Latency</span></div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 w-[30%]" /></div>
                </div>
              </AdminCard>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
               <div className="flex items-center justify-between px-2 mb-2">
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">قائمة مستخدمي تليجرام</h3>
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full font-black">{users.length} مستخدم</span>
               </div>
               {loadingUsers ? (
                 <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={32} /></div>
               ) : (
                 <div className="space-y-3">
                   {users.map((u) => (
                     <div key={u.id} className="bg-zinc-900/60 border border-white/5 p-4 rounded-[28px] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-black text-xl">
                              {u.first_name?.[0]}
                           </div>
                           <div>
                              <div className="text-sm font-black flex items-center gap-2">
                                 {u.first_name} {u.last_name}
                                 {u.username && <span className="text-[9px] text-zinc-500">@{u.username}</span>}
                              </div>
                              <div className="text-[10px] text-zinc-500 font-bold flex items-center gap-1.5 mt-1">
                                 <User size={10} /> {u.id} 
                                 <span className="mx-1">•</span>
                                 <Calendar size={10} /> {new Date(u.last_seen).toLocaleDateString('ar-EG')}
                              </div>
                           </div>
                        </div>
                        <div className="text-left">
                           <div className="text-[10px] font-black text-blue-500 uppercase">نشط</div>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
            </motion.div>
          )}

          {activeTab === 'features' && (
            <motion.div key="features" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
               <AdminCard title="إدارة الميزات" icon={Cpu} color="blue">
                <div className="space-y-3">
                  {[
                    { id: 'aiAnalysis', label: 'الذكاء الاصطناعي', icon: Sparkles, desc: 'Gemini Analysis' },
                    { id: 'marketCheck', label: 'فحص التوريد', icon: Globe, desc: 'Tawreed Live API' },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3 text-right">
                        <div className="p-2 bg-zinc-800 rounded-xl text-zinc-500"><item.icon size={18} /></div>
                        <div><div className="text-sm font-black text-white">{item.label}</div><div className="text-[10px] text-zinc-500 font-bold">{item.desc}</div></div>
                      </div>
                      <button onClick={() => onUpdateConfig({ [item.id]: !((config as any)[item.id]) })} className={`w-12 h-6 rounded-full p-1 flex items-center transition-all ${config[item.id as keyof typeof config] ? 'bg-blue-600' : 'bg-zinc-700'}`}><motion.div animate={{ x: config[item.id as keyof typeof config] ? -24 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-sm" /></button>
                    </div>
                  ))}
                </div>
              </AdminCard>
            </motion.div>
          )}

          {activeTab === 'broadcast' && (
            <motion.div key="broadcast" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <AdminCard title="بث إشعار عام" icon={Bell} color="indigo">
                <div className="space-y-4">
                  <input type="text" placeholder="عنوان الإشعار" value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none" />
                  <textarea placeholder="محتوى الإشعار للمستخدمين..." value={notifBody} onChange={(e) => setNotifBody(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none h-28 resize-none" />
                  <button onClick={handleBroadcast} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-colors">
                    <Send size={18}/> إرسال الإشعار الآن
                  </button>
                </div>
              </AdminCard>
            </motion.div>
          )}

          {activeTab === 'maintenance' && (
            <motion.div key="maintenance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <AdminCard title="وضع الصيانة" icon={Construction} color="amber">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="text-right"><div className="text-sm font-black text-white">إغلاق التطبيق</div><div className="text-[10px] text-zinc-500 font-bold">Lock Public Access</div></div>
                    <button onClick={() => onUpdateConfig({ maintenanceMode: !config.maintenanceMode })} className={`w-14 h-7 rounded-full p-1 flex items-center transition-all ${config.maintenanceMode ? 'bg-amber-500' : 'bg-zinc-700'}`}><motion.div animate={{ x: config.maintenanceMode ? -28 : 0 }} className="w-5 h-5 bg-white rounded-full" /></button>
                  </div>
                  <textarea value={config.maintenanceMessage} onChange={(e) => onUpdateConfig({ maintenanceMessage: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none resize-none h-24" placeholder="رسالة الصيانة..." />
                  <input type="text" value={config.maintenanceTime} onChange={(e) => onUpdateConfig({ maintenanceTime: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none" placeholder="وقت العودة..." />
                  <button onClick={onBack} className="w-full py-4 bg-white/5 text-blue-400 border border-blue-500/20 rounded-2xl font-black text-xs uppercase">العودة للمعاينة</button>
                </div>
              </AdminCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
