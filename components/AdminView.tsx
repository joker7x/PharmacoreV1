
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, ArrowRight, Activity, Cpu, Database, Zap, Bell, Send, Users, 
  ShieldOff, Shield, Loader2, Sparkles, Globe, Construction, Clock, Info, 
  AlertCircle, UserCheck, UserMinus, Star, Search, Filter, Smartphone, Calendar,
  Ban, Lock, Unlock, Layers, CheckSquare, Square, Trash2, MessageSquare, Bot
} from 'lucide-react';
import { AppNotification } from '../types';
import { getAllUsers, updateUserPermissions } from '../services/supabase.ts';
import { BOT_TOKEN } from '../constants';

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
  currentUser: any;
}

const MASTER_ID = 1541678512;

export const AdminView: React.FC<AdminViewProps> = ({ onBack, drugsCount, config, onUpdateConfig, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'bot' | 'broadcast' | 'maintenance'>('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [botStatus, setBotStatus] = useState<any>(null);
  
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifType, setNotifType] = useState<'info' | 'warning' | 'success' | 'update'>('update');

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (e) { console.error(e); } finally { setLoadingUsers(false); }
  };

  const checkBotStatus = async () => {
    try {
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
      const data = await res.json();
      setBotStatus(data.result);
    } catch (e) { setBotStatus({ error: true }); }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'bot') checkBotStatus();
  }, [activeTab]);

  const handleToggleAdmin = async (userId: number, currentStatus: boolean) => {
    if (userId === MASTER_ID) return;
    await updateUserPermissions(userId, { is_admin: !currentStatus });
    fetchUsers();
  };

  const handleToggleBlock = async (userId: number, currentStatus: boolean) => {
    if (userId === MASTER_ID) return;
    if (confirm(currentStatus ? "فك الحظر؟" : "حظر المستخدم؟")) {
      await updateUserPermissions(userId, { is_blocked: !currentStatus });
      fetchUsers();
    }
  };

  const handleBroadcast = () => {
    if (!notifTitle.trim() || !notifBody.trim()) return;
    const newNotif: AppNotification = { 
      id: Date.now().toString(), title: notifTitle, message: notifBody, type: notifType, 
      timestamp: new Date().toISOString(), isRead: false 
    };
    const existingStr = localStorage.getItem('dwa_notifications') || '[]';
    localStorage.setItem('dwa_notifications', JSON.stringify([newNotif, ...JSON.parse(existingStr)]));
    window.dispatchEvent(new Event('storage'));
    setNotifTitle(''); setNotifBody('');
    alert('تم البث بنجاح');
  };

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button onClick={() => setActiveTab(id)} className={`flex-1 py-4 rounded-[22px] flex flex-col items-center justify-center gap-1.5 text-[10px] font-black transition-all relative ${activeTab === id ? 'text-white' : 'text-zinc-500'}`}>
      {activeTab === id && <motion.div layoutId="adminTab" className="absolute inset-0 bg-blue-600 rounded-[22px] shadow-lg" />}
      <Icon size={16} className="relative z-10" />
      <span className="relative z-10">{label}</span>
    </button>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-[#09090b] text-white pt-16 px-6 pb-40 overflow-y-auto no-scrollbar" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl"><ShieldCheck size={30} /></div>
          <div><h1 className="text-2xl font-black">لوحة التحكم</h1><p className="text-[10px] font-bold text-blue-500 uppercase">Pharma Core Terminal</p></div>
        </div>
        <button onClick={onBack} className="w-12 h-12 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400"><ArrowRight size={20} /></button>
      </div>

      <div className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md pb-4 pt-2">
        <div className="flex bg-zinc-900/50 rounded-3xl p-1.5 border border-white/5">
          <TabButton id="dashboard" label="الحالة" icon={Activity} />
          <TabButton id="users" label="الأعضاء" icon={Users} />
          <TabButton id="bot" label="البوت" icon={Bot} />
          <TabButton id="broadcast" label="البث" icon={Bell} />
          <TabButton id="maintenance" label="الصيانة" icon={Construction} />
        </div>
      </div>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-2 gap-4">
               <div className="bg-zinc-900/60 p-6 rounded-[32px] border border-white/5 flex flex-col justify-between h-36">
                 <Database size={20} className="text-blue-500" />
                 <div><div className="text-[10px] font-black text-zinc-500 uppercase mb-1">الأصناف</div><div className="text-3xl font-black">{drugsCount}</div></div>
               </div>
               <div className="bg-zinc-900/60 p-6 rounded-[32px] border border-white/5 flex flex-col justify-between h-36">
                 <Users size={20} className="text-emerald-500" />
                 <div><div className="text-[10px] font-black text-zinc-500 uppercase mb-1">المستخدمين</div><div className="text-3xl font-black">{users.length || '...'}</div></div>
               </div>
            </motion.div>
          )}

          {activeTab === 'bot' && (
            <motion.div key="bot" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="bg-zinc-900/60 p-8 rounded-[40px] border border-white/5 text-center">
                <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-500 border border-indigo-500/30">
                  <Bot size={40} />
                </div>
                {botStatus ? (
                  <>
                    <h3 className="text-xl font-black mb-1">@{botStatus.username}</h3>
                    <p className="text-zinc-500 text-sm mb-6">{botStatus.first_name}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                        <div className="text-[10px] font-black text-zinc-500 uppercase mb-1">Status</div>
                        <div className="text-emerald-500 font-black">Connected</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                        <div className="text-[10px] font-black text-zinc-500 uppercase mb-1">Gateway</div>
                        <div className="text-blue-500 font-black">Vercel API</div>
                      </div>
                    </div>
                  </>
                ) : <Loader2 className="animate-spin mx-auto text-zinc-600" size={32} />}
              </div>

              <div className="bg-amber-500/10 p-6 rounded-[32px] border border-amber-500/20 flex gap-4">
                <AlertCircle className="text-amber-500 shrink-0" size={24} />
                <div>
                  <h4 className="font-black text-amber-500 text-sm mb-1">تنبيه المطور</h4>
                  <p className="text-[11px] text-amber-500/80 leading-relaxed font-bold">
                    يتم التحكم في البوت بالكامل عبر Vercel Serverless Functions. أي تغيير في منطق البوت يجب أن يتم في ملف `api/telegram.ts`.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <input type="text" placeholder="بحث باسم أو ID..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="w-full bg-zinc-900/60 border border-white/10 rounded-2xl py-4 pr-6 text-sm font-bold outline-none" />
              {loadingUsers ? <Loader2 className="animate-spin mx-auto text-blue-500" /> : users.filter(u => u.first_name?.includes(userSearch) || u.id?.toString().includes(userSearch)).map((u) => (
                <div key={u.id} className="bg-zinc-900/40 border border-white/5 p-5 rounded-[32px] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-lg font-black border border-white/5">{u.first_name?.[0]}</div>
                    <div>
                      <div className="font-black text-sm">{u.first_name} {u.id === MASTER_ID && '⭐'}</div>
                      <div className="text-[10px] text-zinc-500 font-bold">ID: {u.id}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleBlock(u.id, u.device_info?.is_blocked)} className={`w-10 h-10 rounded-full flex items-center justify-center ${u.device_info?.is_blocked ? 'bg-rose-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}><Ban size={18} /></button>
                    <button onClick={() => handleToggleAdmin(u.id, u.is_admin)} className={`w-10 h-10 rounded-full flex items-center justify-center ${u.is_admin ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}><Shield size={18} /></button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'broadcast' && (
             <motion.div key="broadcast" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
              <input type="text" placeholder="عنوان الإشعار..." value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none" />
              <textarea placeholder="محتوى الرسالة..." value={notifBody} onChange={(e) => setNotifBody(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none h-32 resize-none" />
              <button onClick={handleBroadcast} className="w-full py-5 bg-blue-600 rounded-2xl font-black text-sm flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-blue-600/20"><Send size={18} /> إرسال البث</button>
            </motion.div>
          )}

          {activeTab === 'maintenance' && (
            <motion.div key="maintenance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="bg-zinc-900/60 border border-white/5 rounded-[40px] p-8">
                <div className="flex items-center justify-between mb-8">
                  <div><h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">وضع الصيانة</h3><p className="text-[10px] text-zinc-600 font-bold uppercase">System Lock</p></div>
                  <button onClick={() => onUpdateConfig({ maintenanceMode: !config.maintenanceMode })} className={`w-14 h-7 rounded-full p-1 flex items-center transition-all ${config.maintenanceMode ? 'bg-amber-500' : 'bg-zinc-800'}`}><motion.div animate={{ x: config.maintenanceMode ? -28 : 0 }} className="w-5 h-5 bg-white rounded-full shadow-lg" /></button>
                </div>
                <textarea value={config.maintenanceMessage} onChange={(e) => onUpdateConfig({ maintenanceMessage: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none h-24 resize-none mb-4" />
                <input type="text" value={config.maintenanceTime} onChange={(e) => onUpdateConfig({ maintenanceTime: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
