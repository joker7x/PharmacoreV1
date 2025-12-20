
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  ArrowRight, 
  Activity, 
  Cpu, 
  Database, 
  Zap, 
  Trash2, 
  BarChart3,
  Server,
  Construction,
  AlertCircle,
  Bell,
  Send,
  Users,
  MousePointer2,
  Clock,
  MessageSquare,
  Timer,
  Globe,
  Sparkles,
  Eye
} from 'lucide-react';
import { AppNotification } from '../types';

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'stats' | 'features' | 'broadcast' | 'maintenance'>('dashboard');
  
  // Broadcast State
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifType, setNotifType] = useState<'info' | 'warning' | 'success' | 'update'>('info');

  const handleBroadcast = () => {
    if (!notifTitle || !notifBody) {
      alert('يرجى ملء جميع الحقول');
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
    
    // Trigger sync for current session
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'dwa_notifications',
      newValue: JSON.stringify(updated)
    }));

    setNotifTitle('');
    setNotifBody('');
    alert('تم بث الإشعار بنجاح لجميع المستخدمين');
  };

  const AdminCard = ({ children, title, icon: Icon, badge, color = "blue" }: any) => (
    <div className="bg-zinc-900/60 border border-white/5 rounded-[32px] p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-${color}-500/10 text-${color}-400`}>
            <Icon size={18} />
          </div>
          <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">{title}</h3>
        </div>
        {badge && (
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full bg-${color}-500/10 text-${color}-400 border border-${color}-500/20 uppercase`}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black text-white pt-16 px-6 pb-40 overflow-y-auto no-scrollbar selection:bg-blue-500/30" 
      dir="rtl"
    >
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/40">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">نظام التحكم</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Administrator Root Access</span>
            </div>
          </div>
        </div>
        <button onClick={onBack} className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 active:scale-90 transition-all shadow-lg">
          <ArrowRight size={20} />
        </button>
      </div>

      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md pb-4 pt-2">
        <div className="flex bg-zinc-900 rounded-3xl p-1 border border-white/5 overflow-x-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'الرئيسية', icon: Activity },
            { id: 'stats', label: 'الإحصائيات', icon: BarChart3 },
            { id: 'features', label: 'الميزات', icon: Cpu },
            { id: 'broadcast', label: 'البث', icon: Bell },
            { id: 'maintenance', label: 'الصيانة', icon: Construction },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[85px] py-4 rounded-[22px] flex items-center justify-center gap-2 text-[11px] font-black transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-zinc-500'}`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
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
                  <div className="text-[10px] text-zinc-500 font-bold mt-1">Items Cached</div>
                </AdminCard>
                <AdminCard title="حالة النظام" icon={Construction} badge={config.maintenanceMode ? "Locked" : "Online"} color={config.maintenanceMode ? "amber" : "emerald"}>
                  <div className={`text-xl font-black ${config.maintenanceMode ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {config.maintenanceMode ? 'تحت الصيانة' : 'يعمل الآن'}
                  </div>
                  <button 
                    onClick={() => setActiveTab('maintenance')}
                    className="mt-2 text-[10px] font-bold text-blue-400 flex items-center gap-1 underline"
                  >إدارة الصيانة</button>
                </AdminCard>
              </div>
              <AdminCard title="مراقبة النظام" icon={Zap} badge="Live Monitor" color="indigo">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-zinc-500">استهلاك الذاكرة (RAM)</span>
                    <span className="text-white">14.8 MB</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[55%]" />
                  </div>
                </div>
              </AdminCard>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <AdminCard title="مستخدمين اليوم" icon={Users} color="emerald">
                    <div className="text-3xl font-black">2,840</div>
                    <div className="text-[10px] text-emerald-500 font-bold mt-1">+18% نشاط</div>
                  </AdminCard>
                  <AdminCard title="مستخدمين الشهر" icon={Globe} color="blue">
                    <div className="text-3xl font-black">42.1k</div>
                    <div className="text-[10px] text-blue-400 font-bold mt-1">نمو مستقر</div>
                  </AdminCard>
               </div>
               <AdminCard title="توزيع التفاعل" icon={MousePointer2} color="indigo">
                  <div className="space-y-4">
                    {[{ label: 'البحث', value: 70 }, { label: 'الذكاء الاصطناعي', value: 20 }, { label: 'المفضلة', value: 10 }].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-black uppercase">
                          <span className="text-zinc-500">{item.label}</span>
                          <span className="text-zinc-300">{item.value}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${item.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
               </AdminCard>
            </motion.div>
          )}

          {activeTab === 'features' && (
            <motion.div key="features" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
               <AdminCard title="إدارة الميزات الذكية" icon={Cpu} color="blue">
                <div className="space-y-3">
                  {[
                    { id: 'aiAnalysis', label: 'تحليل الذكاء الاصطناعي', icon: Sparkles, desc: 'Gemini 3 Predictive Engine' },
                    { id: 'marketCheck', label: 'ربط السوق (Tawreed)', icon: Globe, desc: 'Live Availability Lookup' },
                    { id: 'liveSync', label: 'المزامنة الحية', icon: Activity, desc: 'Real-time Cross-tab Sync' },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3 text-right">
                        <div className="p-2 bg-zinc-800 rounded-xl text-zinc-500">
                          <item.icon size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-black text-white">{item.label}</div>
                          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{item.desc}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => onUpdateConfig({ [item.id]: !((config as any)[item.id]) })}
                        className={`w-12 h-6 rounded-full p-1 flex items-center transition-all ${config[item.id as keyof typeof config] ? 'bg-blue-600' : 'bg-zinc-700'}`}
                      >
                        <motion.div 
                          animate={{ x: config[item.id as keyof typeof config] ? -24 : 0 }}
                          className="w-4 h-4 bg-white rounded-full shadow-sm"
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </AdminCard>
            </motion.div>
          )}

          {activeTab === 'broadcast' && (
            <motion.div key="broadcast" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <AdminCard title="بث إشعار جديد" icon={Bell} color="indigo">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase pr-2">عنوان التنبيه</label>
                    <input 
                      type="text" placeholder="مثال: تحديث هام للأسعار" value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-indigo-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase pr-2">نوع الإشعار</label>
                    <div className="flex gap-2">
                      {['info', 'warning', 'success', 'update'].map((t) => (
                        <button 
                          key={t}
                          onClick={() => setNotifType(t as any)}
                          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase border ${notifType === t ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-zinc-500'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase pr-2">محتوى الإشعار</label>
                    <textarea 
                      placeholder="اكتب تفاصيل التنبيه هنا..." value={notifBody}
                      onChange={(e) => setNotifBody(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none h-28 resize-none focus:border-indigo-500/50"
                    />
                  </div>
                  <button onClick={handleBroadcast} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20">
                    <Send size={18}/> بث الإشعار الآن لجميع الأجهزة
                  </button>
                </div>
              </AdminCard>
            </motion.div>
          )}

          {activeTab === 'maintenance' && (
            <motion.div key="maintenance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <AdminCard title="إعدادات وضع الصيانة" icon={Construction} color="amber">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="text-right">
                      <div className="text-sm font-black text-white">تفعيل إغلاق التطبيق</div>
                      <div className="text-[10px] text-zinc-500 font-bold">سيمنع جميع المستخدمين من الدخول</div>
                    </div>
                    <button 
                      onClick={() => {
                        const newState = !config.maintenanceMode;
                        onUpdateConfig({ maintenanceMode: newState });
                      }}
                      className={`w-14 h-7 rounded-full p-1 flex items-center transition-all ${config.maintenanceMode ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-zinc-700'}`}
                    >
                      <motion.div animate={{ x: config.maintenanceMode ? -28 : 0 }} className="w-5 h-5 bg-white rounded-full shadow-sm" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2 pr-2">
                      <MessageSquare size={12}/> رسالة الصيانة للمستخدمين
                    </label>
                    <textarea 
                      value={config.maintenanceMessage}
                      onChange={(e) => onUpdateConfig({ maintenanceMessage: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-amber-500/50 resize-none h-24"
                      placeholder="اكتب سبب الصيانة هنا..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2 pr-2">
                      <Timer size={12}/> وقت العودة المتوقع
                    </label>
                    <input 
                      type="text" 
                      value={config.maintenanceTime}
                      onChange={(e) => onUpdateConfig({ maintenanceTime: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-amber-500/50"
                      placeholder="مثال: ساعة واحدة أو الساعة 10 مساءً"
                    />
                  </div>
                  
                  <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                    <p className="text-[11px] text-amber-500 font-bold leading-relaxed text-right">
                      * عند تفعيل هذا الوضع، سيتم توجيه جميع الزوار تلقائياً لشاشة الصيانة ولن يتمكنوا من استخدام ميزات البحث أو الكاش.
                    </p>
                  </div>
                  
                  <button 
                    onClick={onBack}
                    className="w-full py-4 bg-white/5 text-blue-400 border border-blue-500/20 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2"
                  >
                    <Eye size={14} /> العودة لمعاينة التطبيق
                  </button>
                </div>
              </AdminCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Safety area at the bottom to prevent white space */}
      <div className="h-40 w-full bg-black pointer-events-none" />
    </motion.div>
  );
};
