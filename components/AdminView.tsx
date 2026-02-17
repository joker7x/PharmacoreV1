
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, ArrowRight, Activity, Cpu, Database, Zap, Bell, Send, Users, 
  ShieldOff, Shield, Loader2, Sparkles, Globe, Construction, Clock, Info, 
  AlertCircle, UserCheck, UserMinus, Star, Search, Filter, Smartphone, Calendar,
  Ban, Lock, Unlock, Layers, CheckSquare, Square, Trash2, MessageSquare, Bot, Link as LinkIcon, Settings as SettingsIcon,
  RefreshCw, Radio, HardDrive, Terminal, ExternalLink
} from 'lucide-react';
import { AppNotification } from '../types.ts';
import { getAllUsers, updateUserPermissions } from '../services/supabase.ts';
import { BOT_TOKEN } from '../constants.ts';

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
  // Use any to bypass TypeScript errors for motion props
  const MDiv = motion.div as any;
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'bot' | 'broadcast' | 'maintenance' | 'features'>('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [botStatus, setBotStatus] = useState<any>(null);
  const [webhookInfo, setWebhookInfo] = useState<any>(null);
  const [isSettingWebhook, setIsSettingWebhook] = useState(false);
  const [isCheckingBot, setIsCheckingBot] = useState(false);
  
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
    setIsCheckingBot(true);
    try {
      const resMe = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
      const dataMe = await resMe.json();
      setBotStatus(dataMe.result);

      const resWh = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
      const dataWh = await resWh.json();
      setWebhookInfo(dataWh.result);
    } catch (e) { 
      setBotStatus({ error: true }); 
    } finally {
      setIsCheckingBot(false);
    }
  };

  const setupWebhook = async () => {
    let currentUrl = window.location.origin;
    if (currentUrl.includes('localhost')) {
        alert("⚠️ لا يمكن ربط Webhook برابط Localhost. تليجرام تتطلب رابط HTTPS حقيقي.");
        return;
    }

    setIsSettingWebhook(true);
    try {
      const webhookUrl = `${currentUrl}/api/telegram`;
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${webhookUrl}`);
      const data = await res.json();
      if (data.ok) {
        alert(`✅ تم الربط بنجاح!\n${webhookUrl}`);
        checkBotStatus();
      } else {
        alert("❌ فشل الربط: " + data.description);
      }
    } catch (e) { 
      alert("❌ خطأ في الاتصال."); 
    } finally { 
      setIsSettingWebhook(false); 
    }
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
    if (confirm(currentStatus ? "هل تود فك الحظر؟" : "هل تود الحظر؟")) {
      await updateUserPermissions(userId, { is_blocked: !currentStatus });
      fetchUsers();
    }
  };

  const handleBroadcast = () => {
    if (!notifTitle.trim() || !notifBody.trim()) {
      alert('يرجى ملء كافة حقول الإشعار');
      return;
    }
    const newNotif: AppNotification = { 
      id: Date.now().toString(), title: notifTitle, message: notifBody, type: notifType, 
      timestamp: new Date().toISOString(), isRead: false 
    };
    const existingStr = localStorage.getItem('dwa_notifications') || '[]';
    localStorage.setItem('dwa_notifications', JSON.stringify([newNotif, ...JSON.parse(existingStr)]));
    window.dispatchEvent(new Event('storage'));
    setNotifTitle(''); setNotifBody('');
    alert('✅ تم بث الإشعار بنجاح لجميع مستخدمي هذا المتصفح.');
  };

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button onClick={() => setActiveTab(id)} className={`flex-1 py-4 rounded-[22px] flex flex-col items-center justify-center gap-1.5 text-[9px] font-black transition-all relative ${activeTab === id ? 'text-white' : 'text-zinc-500'}`}>
      {activeTab === id && <MDiv layoutId="adminTab" className="absolute inset-0 bg-blue-600 rounded-[22px] shadow-lg" />}
      <Icon size={16} className="relative z-10" />
      <span className="relative z-10">{label}</span>
    </button>
  );

  const FeatureToggle = ({ label, description, icon: Icon, value, onToggle, color }: any) => (
    <div className="bg-zinc-900/60 p-6 rounded-[32px] border border-white/5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-2xl bg-${color}-500/10 text-${color}-500 flex items-center justify-center`}><Icon size={20} /></div>
        <div>
          <h4 className="text-[13px] font-black text-white">{label}</h4>
          <p className="text-[10px] text-zinc-500 font-bold">{description}</p>
        </div>
      </div>
      <button onClick={() => onToggle(!value)} className={`w-14 h-7 rounded-full p-1 transition-all ${value ? 'bg-blue-600' : 'bg-zinc-800'}`}>
        <MDiv animate={{ x: value ? -28 : 0 }} className="w-5 h-5 bg-white rounded-full shadow-md" />
      </button>
    </div>
  );

  return (
    <MDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-[#09090b] text-white pt-16 px-6 pb-40 overflow-y-auto no-scrollbar" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20"><ShieldCheck size={30} /></div>
          <div><h1 className="text-2xl font-black">لوحة التحكم</h1><p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Pharma Core Terminal</p></div>
        </div>
        <button onClick={onBack} className="w-12 h-12 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 active:scale-90 transition-transform"><ArrowRight size={20} /></button>
      </div>

      <div className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md pb-4 pt-2">
        <div className="flex bg-zinc-900/50 rounded-3xl p-1.5 border border-white/5 overflow-x-auto no-scrollbar">
          <TabButton id="dashboard" label="الحالة" icon={Activity} />
          <TabButton id="features" label="المميزات" icon={SettingsIcon} />
          <TabButton id="users" label="الأعضاء" icon={Users} />
          <TabButton id="bot" label="البوت" icon={Bot} />
          <TabButton id="broadcast" label="البث" icon={Bell} />
          <TabButton id="maintenance" label="الصيانة" icon={Construction} />
        </div>
      </div>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <MDiv key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-2 gap-4">
               <div className="bg-zinc-900/60 p-6 rounded-[32px] border border-white/5 flex flex-col justify-between h-36">
                 <Database size={20} className="text-blue-500" />
                 <div><div className="text-[10px] font-black text-zinc-500 uppercase mb-1">الأصناف المتاحة</div><div className="text-3xl font-black">{drugsCount}</div></div>
               </div>
               <div className="bg-zinc-900/60 p-6 rounded-[32px] border border-white/5 flex flex-col justify-between h-36">
                 <Users size={20} className="text-emerald-500" />
                 <div><div className="text-[10px] font-black text-zinc-500 uppercase mb-1">المستخدمين</div><div className="text-3xl font-black">{users.length || '...'}</div></div>
               </div>
            </MDiv>
          )}

          {activeTab === 'features' && (
            <MDiv key="features" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <FeatureToggle label="تحليل الذكاء الاصطناعي" description="تفعيل توقعات Gemini للأصناف" icon={Sparkles} value={config.aiAnalysis} onToggle={(v:boolean) => onUpdateConfig({aiAnalysis:v})} color="indigo" />
              <FeatureToggle label="فحص توفر السوق" description="ربط البيانات مع خوادم التوريد" icon={Globe} value={config.marketCheck} onToggle={(v:boolean) => onUpdateConfig({marketCheck:v})} color="emerald" />
              <FeatureToggle label="التزامن اللحظي" description="تحديث الأسعار في الخلفية" icon={RefreshCw} value={config.liveSync} onToggle={(v:boolean) => onUpdateConfig({liveSync:v})} color="blue" />
            </MDiv>
          )}

          {activeTab === 'bot' && (
            <MDiv key="bot" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="bg-zinc-900/60 p-6 rounded-[40px] border border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-500">
                      <Bot size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black">Telegram Bot Info</h3>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${botStatus?.id ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500'}`} />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">{botStatus?.id ? 'Online' : 'Checking...'}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={checkBotStatus} disabled={isCheckingBot} className="p-3 rounded-xl bg-white/5 text-zinc-400 active:scale-95 transition-all">
                    <RefreshCw size={18} className={isCheckingBot ? 'animate-spin' : ''} />
                  </button>
                </div>

                {botStatus && !botStatus.error ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                        <div className="text-[9px] font-black text-zinc-500 uppercase mb-1">Bot Name</div>
                        <div className="text-sm font-bold truncate">{botStatus.first_name}</div>
                      </div>
                      <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                        <div className="text-[9px] font-black text-zinc-500 uppercase mb-1">Username</div>
                        <div className="text-sm font-bold text-blue-400">@{botStatus.username}</div>
                      </div>
                    </div>
                    <button onClick={setupWebhook} disabled={isSettingWebhook} className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-sm flex items-center justify-center gap-2 active:scale-95 shadow-xl shadow-blue-600/20 transition-all">
                        {isSettingWebhook ? <Loader2 className="animate-spin" size={18} /> : <Terminal size={18} />}
                        تحديث Webhook النظام
                    </button>
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <AlertCircle size={40} className="mx-auto text-rose-500 mb-4" />
                    <p className="text-sm font-bold text-zinc-400">فشل الاتصال بالبوت.</p>
                  </div>
                )}
              </div>
            </MDiv>
          )}

          {activeTab === 'users' && (
            <MDiv key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {loadingUsers ? <Loader2 className="animate-spin mx-auto text-blue-500 py-10" /> : users.map((u) => (
                <div key={u.id} className="bg-zinc-900/40 border border-white/5 p-5 rounded-[32px] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-lg font-black">{u.first_name?.[0]}</div>
                    <div><div className="font-black text-sm">{u.first_name}</div><div className="text-[10px] text-zinc-500">ID: {u.id}</div></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleBlock(u.id, u.device_info?.is_blocked)} className={`w-11 h-11 rounded-2xl flex items-center justify-center ${u.device_info?.is_blocked ? 'bg-rose-600' : 'bg-zinc-800 text-zinc-500'}`}><Ban size={18} /></button>
                  </div>
                </div>
              ))}
            </MDiv>
          )}

          {activeTab === 'broadcast' && (
             <MDiv key="broadcast" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
              <div className="bg-zinc-900/60 p-8 rounded-[40px] border border-white/5">
                <input type="text" placeholder="عنوان الإشعار..." value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none mb-4" />
                <textarea placeholder="محتوى الرسالة..." value={notifBody} onChange={(e) => setNotifBody(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none h-32 resize-none mb-6" />
                <button onClick={handleBroadcast} className="w-full py-5 bg-blue-600 rounded-[24px] font-black text-sm flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-blue-600/20 transition-all"><Send size={18} /> بث الإشعار الآن</button>
              </div>
            </MDiv>
          )}

          {activeTab === 'maintenance' && (
            <MDiv key="maintenance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="bg-zinc-900/60 border border-white/5 rounded-[40px] p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4"><Construction size={24} className="text-amber-500" /><div><h3 className="text-sm font-black">وضع الصيانة</h3><p className="text-[10px] text-zinc-600 font-bold uppercase">System Global Lock</p></div></div>
                  <button onClick={() => onUpdateConfig({ maintenanceMode: !config.maintenanceMode })} className={`w-14 h-7 rounded-full p-1 transition-all ${config.maintenanceMode ? 'bg-amber-500' : 'bg-zinc-800'}`}><MDiv animate={{ x: config.maintenanceMode ? -28 : 0 }} className="w-5 h-5 bg-white rounded-full shadow-lg" /></button>
                </div>
              </div>
            </MDiv>
          )}
        </AnimatePresence>
      </div>
    </MDiv>
  );
};
