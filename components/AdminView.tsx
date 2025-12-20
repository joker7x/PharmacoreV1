
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, ArrowRight, Activity, Cpu, Database, Zap, Bell, Send, Users, 
  ShieldOff, Shield, Loader2, Sparkles, Globe, Construction, Clock, Info, 
  AlertCircle, UserCheck, UserMinus, Star, Search, Filter, Smartphone, Calendar,
  Ban, Lock, Unlock, Layers, CheckSquare, Square, Trash2
} from 'lucide-react';
import { AppNotification } from '../types';
import { getAllUsers, updateUserPermissions } from '../services/supabase.ts';

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
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  
  // Broadcast State
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifType, setNotifType] = useState<'info' | 'warning' | 'success' | 'update'>('update');

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (e) {
      console.error("Fetch users error", e);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const handleToggleAdmin = async (userId: number, currentStatus: boolean) => {
    if (userId === MASTER_ID) return;
    await updateUserPermissions(userId, { is_admin: !currentStatus });
    fetchUsers();
  };

  const handleToggleBlock = async (userId: number, currentStatus: boolean) => {
    if (userId === MASTER_ID) return;
    const msg = currentStatus ? "هل تود فك الحظر عن هذا المستخدم؟" : "هل تود حظر هذا المستخدم من الوصول للتطبيق؟";
    if (confirm(msg)) {
      await updateUserPermissions(userId, { is_blocked: !currentStatus });
      fetchUsers();
    }
  };

  const handleChangeLimit = async (userId: number, newLimit: number) => {
    if (userId === MASTER_ID) return;
    await updateUserPermissions(userId, { items_limit: newLimit });
    fetchUsers();
  };

  const toggleSelectUser = (id: number) => {
    if (id === MASTER_ID) return;
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const applyBulkAction = async (action: 'block' | 'unblock' | 'limit100' | 'limitMax') => {
    if (selectedUserIds.length === 0) return;
    if (confirm(`تطبيق هذا الإجراء على ${selectedUserIds.length} مستخدم؟`)) {
      setLoadingUsers(true);
      for (const id of selectedUserIds) {
        if (action === 'block') await updateUserPermissions(id, { is_blocked: true });
        if (action === 'unblock') await updateUserPermissions(id, { is_blocked: false });
        if (action === 'limit100') await updateUserPermissions(id, { items_limit: 100 });
        if (action === 'limitMax') await updateUserPermissions(id, { items_limit: 10000 });
      }
      setSelectedUserIds([]);
      await fetchUsers();
    }
  };

  const handleBroadcast = () => {
    if (!notifTitle.trim() || !notifBody.trim()) {
      alert('يرجى ملء كافة الحقول');
      return;
    }
    const newNotif: AppNotification = { 
      id: Date.now().toString(), title: notifTitle, message: notifBody, type: notifType, 
      timestamp: new Date().toISOString(), isRead: false 
    };
    try {
      const existingStr = localStorage.getItem('dwa_notifications') || '[]';
      const existing = JSON.parse(existingStr);
      localStorage.setItem('dwa_notifications', JSON.stringify([newNotif, ...existing]));
      
      // إصلاح Illegal Constructor عبر استخدام الطريقة الحديثة والآمنة
      window.dispatchEvent(new Event('storage'));
      
      setNotifTitle(''); 
      setNotifBody('');
      alert('تم إرسال البث لجميع المستخدمين بنجاح');
    } catch (e) {
      console.error("Broadcast failed", e);
    }
  };

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => setActiveTab(id)} 
      className={`flex-1 py-4 rounded-[22px] flex flex-col items-center justify-center gap-1.5 text-[10px] font-black transition-all relative ${activeTab === id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
    >
      {activeTab === id && <motion.div layoutId="adminTab" className="absolute inset-0 bg-blue-600 rounded-[22px] shadow-lg shadow-blue-500/20" />}
      <Icon size={16} className="relative z-10" />
      <span className="relative z-10">{label}</span>
    </button>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-[#09090b] text-white pt-16 px-6 pb-40 overflow-y-auto no-scrollbar" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-blue-500/30"><ShieldCheck size={30} /></div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">لوحة التحكم</h1>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">Pharma Core Terminal</p>
          </div>
        </div>
        <button onClick={onBack} className="w-12 h-12 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 active:scale-90 transition-all"><ArrowRight size={20} /></button>
      </div>

      {/* Tabs Menu */}
      <div className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md pb-4 pt-2">
        <div className="flex bg-zinc-900/50 rounded-3xl p-1.5 border border-white/5 shadow-2xl">
          <TabButton id="dashboard" label="الحالة" icon={Activity} />
          <TabButton id="users" label="الأعضاء" icon={Users} />
          <TabButton id="features" label="الميزات" icon={Cpu} />
          <TabButton id="broadcast" label="البث" icon={Bell} />
          <TabButton id="maintenance" label="الصيانة" icon={Construction} />
        </div>
      </div>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-2 gap-4">
               <div className="bg-zinc-900/60 p-6 rounded-[32px] border border-white/5 flex flex-col justify-between h-40">
                 <Database size={20} className="text-blue-500" />
                 <div>
                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">إجمالي الأصناف</div>
                    <div className="text-3xl font-black">{drugsCount}</div>
                 </div>
               </div>
               <div className="bg-zinc-900/60 p-6 rounded-[32px] border border-white/5 flex flex-col justify-between h-40">
                 <Users size={20} className="text-emerald-500" />
                 <div>
                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">المستخدمين</div>
                    <div className="text-3xl font-black">{users.length}</div>
                 </div>
               </div>
               <div className="col-span-2 bg-zinc-900/60 p-6 rounded-[32px] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400"><Zap size={20}/></div>
                    <div>
                      <div className="text-xs font-black">حالة المحرك</div>
                      <div className="text-[10px] text-emerald-500 font-bold">Excellent Performance</div>
                    </div>
                  </div>
                  <div className="text-[10px] font-black px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">ONLINE</div>
               </div>
            </motion.div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input type="text" placeholder="بحث باسم أو ID..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="w-full bg-zinc-900/60 border border-white/10 rounded-2xl py-4 pr-12 pl-6 text-sm font-bold outline-none focus:border-blue-500/50" />
                </div>
                <button onClick={fetchUsers} className="w-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-400 border border-white/10 active:scale-95"><Layers size={20}/></button>
              </div>

              {selectedUserIds.length > 0 && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-4 bg-blue-600 rounded-[28px] flex flex-wrap gap-2 justify-center mb-6 shadow-xl shadow-blue-600/20">
                   <div className="w-full text-center text-[10px] font-black uppercase mb-1 tracking-widest text-white/70">إجراء جماعي ({selectedUserIds.length})</div>
                   <button onClick={() => applyBulkAction('block')} className="px-4 py-2 bg-white/20 rounded-xl text-[10px] font-bold flex items-center gap-2">حظر</button>
                   <button onClick={() => applyBulkAction('unblock')} className="px-4 py-2 bg-white/20 rounded-xl text-[10px] font-bold flex items-center gap-2">فك حظر</button>
                   <button onClick={() => applyBulkAction('limit100')} className="px-4 py-2 bg-white/20 rounded-xl text-[10px] font-bold">100 صنف</button>
                   <button onClick={() => applyBulkAction('limitMax')} className="px-4 py-2 bg-white/20 rounded-xl text-[10px] font-bold">دخول كامل</button>
                </motion.div>
              )}

              {loadingUsers ? <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={32} /></div> : (
                <div className="space-y-4">
                  {users.filter(u => u.first_name?.includes(userSearch) || u.id?.toString().includes(userSearch)).map((u) => {
                    const info = u.device_info || {};
                    const isBlocked = info.is_blocked;
                    const limit = info.items_limit || 100;
                    
                    return (
                      <div key={u.id} className={`bg-zinc-900/40 border ${isBlocked ? 'border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.05)]' : u.id === MASTER_ID ? 'border-amber-500/30' : 'border-white/5'} p-5 rounded-[32px] relative overflow-hidden group`}>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                          <div className="flex items-center gap-4">
                            <button onClick={() => toggleSelectUser(u.id)} className="w-6 h-6 rounded-lg border border-white/10 flex items-center justify-center">
                               {selectedUserIds.includes(u.id) ? <CheckSquare size={18} className="text-blue-500" /> : <Square size={18} className="text-zinc-700" />}
                            </button>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black border ${u.id === MASTER_ID ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-zinc-800 text-zinc-500 border-white/5'}`}>
                              {u.id === MASTER_ID ? <Star size={20} fill="currentColor" /> : (u.first_name?.[0] || 'U')}
                            </div>
                            <div>
                              <div className="font-black text-[14px] flex items-center gap-2">
                                {u.first_name || 'بدون اسم'}
                                {u.id === MASTER_ID && <span className="text-[8px] bg-amber-500 text-black px-1.5 py-0.5 rounded-full font-black">OWNER</span>}
                                {isBlocked && <span className="text-[8px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-black">BLOCKED</span>}
                              </div>
                              <div className="text-[10px] text-zinc-500 font-bold mt-0.5">ID: {u.id} {u.username ? `@${u.username}` : ''}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => handleToggleBlock(u.id, !!isBlocked)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isBlocked ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'bg-zinc-800 text-zinc-500'}`}>
                               {isBlocked ? <Unlock size={18} /> : <Ban size={18} />}
                             </button>
                             <button onClick={() => handleToggleAdmin(u.id, !!u.is_premium)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${u.is_premium ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-zinc-800 text-zinc-500'}`}>
                               {u.is_premium ? <UserMinus size={18} /> : <UserCheck size={18} />}
                             </button>
                          </div>
                        </div>

                        {u.id !== MASTER_ID && (
                          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/5 relative z-10">
                            <div className="text-[10px] font-black text-zinc-500 uppercase mb-2 col-span-2 text-center tracking-widest">تحديد كمية البيانات المتاحة</div>
                            <button onClick={() => handleChangeLimit(u.id, 100)} className={`py-3 rounded-2xl text-[10px] font-black transition-all ${limit === 100 ? 'bg-white/10 text-white border border-white/20' : 'text-zinc-600 border border-transparent'}`}>100 صنف فقط</button>
                            <button onClick={() => handleChangeLimit(u.id, 10000)} className={`py-3 rounded-2xl text-[10px] font-black transition-all ${limit > 100 ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-zinc-600'}`}>دخول غير محدود</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <motion.div key="features" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
               <div className="bg-zinc-900/60 p-8 rounded-[40px] border border-white/5">
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-8 flex items-center gap-2"><Cpu size={16} className="text-blue-500"/> التحكم في الميزات الذكية</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-3xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500"><Sparkles size={18}/></div>
                        <div>
                          <div className="text-sm font-black">تحليل Gemini AI</div>
                          <div className="text-[10px] text-zinc-600 font-bold uppercase">Predictive Analysis Engine</div>
                        </div>
                      </div>
                      <button onClick={() => onUpdateConfig({ aiAnalysis: !config.aiAnalysis })} className={`w-12 h-6 rounded-full p-1 flex items-center transition-all ${config.aiAnalysis ? 'bg-blue-600' : 'bg-zinc-800'}`}>
                        <motion.div animate={{ x: config.aiAnalysis ? -24 : 0 }} className="w-4 h-4 bg-white rounded-full" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-3xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500"><Globe size={18}/></div>
                        <div>
                          <div className="text-sm font-black">فحص السوق الموازي</div>
                          <div className="text-[10px] text-zinc-600 font-bold uppercase">Tawreed Real-time Sync</div>
                        </div>
                      </div>
                      <button onClick={() => onUpdateConfig({ marketCheck: !config.marketCheck })} className={`w-12 h-6 rounded-full p-1 flex items-center transition-all ${config.marketCheck ? 'bg-emerald-600' : 'bg-zinc-800'}`}>
                        <motion.div animate={{ x: config.marketCheck ? -24 : 0 }} className="w-4 h-4 bg-white rounded-full" />
                      </button>
                    </div>
                  </div>
               </div>
            </motion.div>
          )}

          {/* Broadcast Tab */}
          {activeTab === 'broadcast' && (
             <motion.div key="broadcast" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="bg-zinc-900/60 border border-white/5 rounded-[40px] p-8">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Bell size={16} className="text-indigo-500" /> مركز البث الموحد</h3>
                <div className="space-y-5">
                  <input type="text" placeholder="عنوان الإشعار..." value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-blue-500/50" />
                  <textarea placeholder="محتوى الرسالة..." value={notifBody} onChange={(e) => setNotifBody(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none h-32 resize-none focus:border-blue-500/50" />
                  <div className="grid grid-cols-2 gap-2">
                    {[{id:'info', label:'معلومات'}, {id:'update', label:'تحديث'}, {id:'warning', label:'تحذير'}, {id:'success', label:'نجاح'}].map((t) => (
                      <button key={t.id} onClick={() => setNotifType(t.id as any)} className={`py-3 rounded-xl text-[10px] font-black border transition-all ${notifType === t.id ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-zinc-600 hover:bg-white/5'}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleBroadcast} className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                    <Send size={18} /> إرسال البث لجميع الأعضاء
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <motion.div key="maintenance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="bg-zinc-900/60 border border-white/5 rounded-[40px] p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">وضع القفل الكلي</h3>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase">Maintenance Mode Lock</p>
                  </div>
                  <button onClick={() => onUpdateConfig({ maintenanceMode: !config.maintenanceMode })} className={`w-14 h-7 rounded-full p-1 flex items-center transition-all ${config.maintenanceMode ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-zinc-800'}`}>
                    <motion.div animate={{ x: config.maintenanceMode ? -28 : 0 }} className="w-5 h-5 bg-white rounded-full shadow-lg" />
                  </button>
                </div>
                <div className="space-y-5">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 mr-2 uppercase">رسالة التنبيه</label>
                      <textarea value={config.maintenanceMessage} onChange={(e) => onUpdateConfig({ maintenanceMessage: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none h-24 resize-none focus:border-amber-500/50" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 mr-2 uppercase">الوقت المقدر للعودة</label>
                      <input type="text" value={config.maintenanceTime} onChange={(e) => onUpdateConfig({ maintenanceTime: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-amber-500/50" />
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
