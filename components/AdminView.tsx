
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowRight, Activity, Cpu, Database, Zap, Bell, Send, Users, ShieldOff, Shield, Loader2, Sparkles, Globe, Construction, Clock, Info, AlertCircle, UserCheck, UserMinus, Star, Trash2 } from 'lucide-react';
import { AppNotification } from '../types';
import { getAllUsers, toggleUserAdminStatus } from '../services/supabase.ts';

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'features' | 'broadcast' | 'maintenance'>('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Broadcast State
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifType, setNotifType] = useState<'info' | 'warning' | 'success' | 'update'>('update');

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoadingUsers(false);
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const handleToggleAdmin = async (userId: number, currentStatus: boolean) => {
    if (userId === MASTER_ID) return;
    if (confirm(`هل أنت متأكد من ${currentStatus ? 'سحب الصلاحية' : 'منح صلاحية الأدمن'} لهذا المستخدم؟`)) {
      await toggleUserAdminStatus(userId, !currentStatus);
      fetchUsers();
    }
  };

  const handleBroadcast = () => {
    if (!notifTitle.trim() || !notifBody.trim()) {
      alert('يرجى كتابة العنوان ومحتوى الرسالة');
      return;
    }

    const newNotif: AppNotification = { 
      id: Date.now().toString(), 
      title: notifTitle, 
      message: notifBody, 
      type: notifType, 
      timestamp: new Date().toISOString(), 
      isRead: false 
    };

    const existing = JSON.parse(localStorage.getItem('dwa_notifications') || '[]');
    const updated = [newNotif, ...existing];
    localStorage.setItem('dwa_notifications', JSON.stringify(updated));
    
    // تفعيل التنبيه اللحظي للمستخدمين النشطين
    window.dispatchEvent(new Event('storage'));
    
    setNotifTitle('');
    setNotifBody('');
    alert('تم إرسال البث بنجاح لجميع المستخدمين');
  };

  const AdminCard = ({ children, title, icon: Icon, badge, color = "blue" }: any) => (
    <div className="bg-zinc-900/60 border border-white/5 rounded-[32px] p-6 shadow-xl backdrop-blur-sm relative overflow-hidden mb-5">
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-${color}-500/10 text-${color}-400`}><Icon size={18} /></div>
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{title}</h3>
        </div>
        {badge && ( <span className={`text-[9px] font-black px-2 py-0.5 rounded-full bg-${color}-500/10 text-${color}-400 border border-${color}-500/20 uppercase`}>{badge}</span> )}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black text-white pt-16 px-6 pb-40 overflow-y-auto no-scrollbar" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/40"><ShieldCheck size={28} /></div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">إدارة Pharma Core</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Master Root Panel</span>
            </div>
          </div>
        </div>
        <button onClick={onBack} className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 active:scale-90 transition-all shadow-lg"><ArrowRight size={20} /></button>
      </div>

      {/* Tabs Menu */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md pb-4 pt-2 mb-6">
        <div className="flex bg-zinc-900 rounded-3xl p-1 border border-white/5 overflow-x-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'الحالة', icon: Activity },
            { id: 'users', label: 'المستخدمين', icon: Users },
            { id: 'features', label: 'الميزات', icon: Cpu },
            { id: 'broadcast', label: 'البث', icon: Bell },
            { id: 'maintenance', label: 'الصيانة', icon: Construction },
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as any)} 
              className={`flex-1 min-w-[85px] py-4 rounded-[22px] flex items-center justify-center gap-2 text-[11px] font-black transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid grid-cols-2 gap-4">
                <AdminCard title="إجمالي الأصناف" icon={Database} badge="Sync" color="blue">
                  <div className="text-3xl font-black">{drugsCount.toLocaleString()}</div>
                  <div className="text-[10px] text-zinc-500 font-bold mt-1">Inventory Feed</div>
                </AdminCard>
                <AdminCard title="المستخدمين" icon={Users} badge="Live" color="emerald">
                  <div className="text-3xl font-black">{users.length || '--'}</div>
                  <div className="text-[10px] text-zinc-500 font-bold mt-1">Active Accounts</div>
                </AdminCard>
              </div>
              <AdminCard title="محرك النظام" icon={Zap} badge="Active" color="indigo">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-zinc-500">زمن استجابة الـ API</span>
                    <span className="text-emerald-400">Excellent (34ms)</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[94%]" />
                  </div>
                </div>
              </AdminCard>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
               {loadingUsers ? <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={32} /></div> : (
                 <div className="space-y-3">
                   {users.length > 0 ? users.map((u) => (
                     <div key={u.id} className={`bg-zinc-900/60 border ${u.id === MASTER_ID ? 'border-amber-500/40' : u.is_premium ? 'border-blue-500/40' : 'border-white/5'} p-4 rounded-[28px] flex items-center justify-between`}>
                        <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${u.id === MASTER_ID ? 'bg-amber-500/20 text-amber-500' : u.is_premium ? 'bg-blue-500/20 text-blue-500' : 'bg-zinc-800 text-zinc-500'}`}>
                              {u.id === MASTER_ID ? <Star size={20} fill="currentColor" /> : (u.first_name?.[0] || 'U')}
                           </div>
                           <div>
                              <div className="text-sm font-black flex items-center gap-2">
                                {u.first_name} {u.last_name}
                                {u.id === MASTER_ID && <span className="text-[8px] px-1.5 py-0.5 bg-amber-500 rounded-full text-white uppercase tracking-tighter">Owner</span>}
                                {u.is_premium && u.id !== MASTER_ID && <span className="text-[8px] px-1.5 py-0.5 bg-blue-500 rounded-full text-white uppercase tracking-tighter">Admin</span>}
                              </div>
                              <div className="text-[10px] text-zinc-500 font-bold mt-1">ID: {u.id} {u.username ? `@${u.username}` : ''}</div>
                           </div>
                        </div>
                        {u.id !== MASTER_ID && (
                          <button 
                            onClick={() => handleToggleAdmin(u.id, !!u.is_premium)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${u.is_premium ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}
                          >
                            {u.is_premium ? <UserMinus size={18} /> : <UserCheck size={18} />}
                          </button>
                        )}
                     </div>
                   )) : <div className="py-20 text-center text-zinc-600 font-bold uppercase tracking-widest">لا يوجد مستخدمين مسجلين</div>}
                 </div>
               )}
            </motion.div>
          )}

          {activeTab === 'features' && (
            <motion.div key="features" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
               <AdminCard title="إدارة الأنظمة الذكية" icon={Cpu} color="blue">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-800 rounded-xl text-blue-400"><Sparkles size={18} /></div>
                      <div>
                        <div className="text-sm font-black">تحليل الذكاء الاصطناعي</div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase">Gemini 3 Pro Core</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => onUpdateConfig({ aiAnalysis: !config.aiAnalysis })} 
                      className={`w-12 h-6 rounded-full p-1 flex items-center transition-all ${config.aiAnalysis ? 'bg-blue-600' : 'bg-zinc-700'}`}
                    >
                      <motion.div animate={{ x: config.aiAnalysis ? -24 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-sm" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-800 rounded-xl text-emerald-400"><Globe size={18} /></div>
                      <div>
                        <div className="text-sm font-black">فحص السوق الموازي</div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase">Real-time Market Index</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => onUpdateConfig({ marketCheck: !config.marketCheck })} 
                      className={`w-12 h-6 rounded-full p-1 flex items-center transition-all ${config.marketCheck ? 'bg-emerald-600' : 'bg-zinc-700'}`}
                    >
                      <motion.div animate={{ x: config.marketCheck ? -24 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-sm" />
                    </button>
                  </div>
                </div>
              </AdminCard>
            </motion.div>
          )}

          {activeTab === 'broadcast' && (
            <motion.div key="broadcast" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <AdminCard title="بث إشعار عالمي" icon={Bell} color="indigo">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 mr-2 uppercase tracking-widest">عنوان الرسالة</label>
                    <input 
                      type="text" 
                      placeholder="مثال: تحديث أسعار جديد..." 
                      value={notifTitle} 
                      onChange={(e) => setNotifTitle(e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 mr-2 uppercase tracking-widest">محتوى الإشعار</label>
                    <textarea 
                      placeholder="اكتب هنا تفاصيل الرسالة التي ستصل للمستخدمين..." 
                      value={notifBody} 
                      onChange={(e) => setNotifBody(e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none h-32 resize-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 mr-2 uppercase tracking-widest">نوع التنبيه</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'info', label: 'معلومات', color: 'bg-blue-500' },
                        { id: 'update', label: 'تحديث', color: 'bg-indigo-500' },
                        { id: 'warning', label: 'تحذير', color: 'bg-amber-500' },
                        { id: 'success', label: 'نجاح', color: 'bg-emerald-500' },
                      ].map((t) => (
                        <button 
                          key={t.id} 
                          onClick={() => setNotifType(t.id as any)}
                          className={`py-3 rounded-xl text-[10px] font-black transition-all border ${notifType === t.id ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-zinc-500 hover:bg-white/5'}`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${t.color}`} />
                            {t.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={handleBroadcast} 
                    className="w-full py-5 bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-500/20"
                  >
                    <Send size={18} /> إرسال البث الآن
                  </button>
                </div>
              </AdminCard>
            </motion.div>
          )}

          {activeTab === 'maintenance' && (
            <motion.div key="maintenance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <AdminCard title="إدارة الصيانة" icon={Construction} color="amber">
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="text-right">
                      <div className="text-sm font-black text-white">وضع القفل الشامل</div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase">Lock Public Interface</div>
                    </div>
                    <button 
                      onClick={() => onUpdateConfig({ maintenanceMode: !config.maintenanceMode })} 
                      className={`w-14 h-7 rounded-full p-1 flex items-center transition-all ${config.maintenanceMode ? 'bg-amber-500' : 'bg-zinc-700'}`}
                    >
                      <motion.div animate={{ x: config.maintenanceMode ? -28 : 0 }} className="w-5 h-5 bg-white rounded-full" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 mr-2 uppercase tracking-widest">رسالة التنبيه</label>
                    <textarea 
                      value={config.maintenanceMessage} 
                      onChange={(e) => onUpdateConfig({ maintenanceMessage: e.target.value })} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none resize-none h-24 focus:border-amber-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 mr-2 uppercase tracking-widest">وقت العودة</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-4 flex items-center text-zinc-500"><Clock size={16} /></div>
                      <input 
                        type="text" 
                        value={config.maintenanceTime} 
                        onChange={(e) => onUpdateConfig({ maintenanceTime: e.target.value })} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-sm font-bold outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>
                </div>
              </AdminCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
