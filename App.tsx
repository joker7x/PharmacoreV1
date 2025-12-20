
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Sparkles, RefreshCw, Package, Bell, Layout, ArrowLeft, ShieldCheck, Construction, Clock, AlertTriangle, Eye, Loader2, LogIn, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchDrugBatchFromAPI } from './services/api.ts';
import { Drug, TabMode, AppView, AppNotification } from './types.ts';
import { DrugCard } from './components/DrugCard.tsx';
import { TabFilter } from './components/TabFilter.tsx';
import { BottomNavigation } from './components/Navigation.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { DrugIntelligenceModal } from './components/DrugIntelligenceModal.tsx';
import { StatsView } from './components/StatsView.tsx';
import { AdminView } from './components/AdminView.tsx';
import { NotificationsModal } from './components/NotificationsModal.tsx';
import { getGlobalConfig, updateGlobalConfig, syncTelegramUser } from './services/supabase.ts';

const PageTransition = ({ children }: { children?: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, x: 10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -10 }}
    transition={{ type: "spring", damping: 25, stiffness: 200 }}
    className="w-full"
  >
    {children}
  </motion.div>
);

const App: React.FC = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [configLoading, setConfigLoading] = useState<boolean>(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [mode, setMode] = useState<TabMode>('all');
  const [search, setSearch] = useState<string>('');
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [previewMaintenance, setPreviewMaintenance] = useState(false);
  
  const [showLogin, setShowLogin] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const [tgUser, setTgUser] = useState<any>(null);
  const [isBlocked, setIsBlocked] = useState(false);

  const [config, setConfig] = useState({
    aiAnalysis: true,
    marketCheck: true,
    maintenanceMode: false,
    maintenanceMessage: "نظام Pharma Core حالياً في وضع التحديث لضمان دقة البيانات وتجربة استخدام أسرع.",
    maintenanceTime: "ساعة واحدة",
    liveSync: true
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Sync Notifications from LocalStorage
  const syncNotifications = useCallback(() => {
    const savedNotifs = localStorage.getItem('dwa_notifications');
    if (savedNotifs) {
      setNotifications(JSON.parse(savedNotifs));
    }
  }, []);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setTgUser(user);
        syncTelegramUser(user).then((dbUser: any) => {
          if (dbUser?.is_blocked) setIsBlocked(true);
        });
      }
    }

    const savedDarkMode = localStorage.getItem('dwa_dark_mode') === 'true';
    syncNotifications();
    
    setDarkMode(savedDarkMode);
    if (savedDarkMode) document.documentElement.classList.add('dark');
    
    // Listen for storage changes (broadcasts)
    window.addEventListener('storage', syncNotifications);
    
    const syncRemoteConfig = async () => {
      const remoteConfig = await getGlobalConfig();
      if (remoteConfig) setConfig(remoteConfig);
      setConfigLoading(false);
    };

    syncRemoteConfig();
    return () => window.removeEventListener('storage', syncNotifications);
  }, [syncNotifications]);

  const loadData = useCallback(async (isInitial: boolean = false) => {
    if (configLoading || isBlocked) return;
    if (config.maintenanceMode && !isAuthorized) {
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const currentOffset = isInitial ? 0 : offset;
    try {
      const results = await fetchDrugBatchFromAPI(currentOffset);
      let filtered = results;
      if (mode === 'changed') filtered = results.filter(d => d.price_new !== null && d.price_old !== null && d.price_new !== d.price_old);
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(d => (d.name_en?.toLowerCase().includes(s)) || (d.name_ar?.includes(s)));
      }
      if (isInitial) setDrugs(filtered);
      else setDrugs(prev => [...prev, ...filtered]);
      setOffset(currentOffset + 100);
      setHasMore(results.length === 100);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [offset, search, mode, config.maintenanceMode, isAuthorized, configLoading, isBlocked]);

  useEffect(() => {
    if (!configLoading) loadData(true);
  }, [mode, search, config.maintenanceMode, configLoading]);

  const updateConfig = async (newConfig: any) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    await updateGlobalConfig(updated);
  };

  const handleAdminAccess = () => {
    if (isAuthorized) setCurrentView('admin');
    else setShowLogin(true);
  };

  const handleLogin = () => {
    if (passcode === '547419') {
      setIsAuthorized(true);
      setShowLogin(false);
      setPasscode('');
      setPreviewMaintenance(false);
      setCurrentView('admin');
    } else {
      alert('كلمة المرور غير صحيحة');
      setPasscode('');
    }
  };

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-rose-950 flex flex-col items-center justify-center p-8 text-center" dir="rtl">
        <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500 mb-6 border border-rose-500/30">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">تم تقييد الوصول</h1>
        <p className="text-rose-200/60 font-medium">حسابك محظور من استخدام Pharma Core حالياً. يرجى مراجعة الإدارة.</p>
        <div className="mt-8 text-[10px] text-rose-500 font-bold uppercase tracking-widest">User ID: {tgUser?.id}</div>
      </div>
    );
  }

  if (configLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  const isMaintenanceActive = config.maintenanceMode && (!isAuthorized || previewMaintenance);

  const renderView = () => {
    switch (currentView) {
      case 'admin':
        return (
          <PageTransition>
            <AdminView onBack={() => setCurrentView('home')} drugsCount={drugs.length} config={config} onUpdateConfig={updateConfig} />
          </PageTransition>
        );
      case 'settings':
        return (
          <PageTransition>
            <SettingsView user={tgUser} darkMode={darkMode} toggleDarkMode={() => {
              const next = !darkMode;
              setDarkMode(next);
              localStorage.setItem('dwa_dark_mode', String(next));
              if (next) document.documentElement.classList.add('dark');
              else document.documentElement.classList.remove('dark');
            }} onClearFavorites={() => {}} onBack={() => setCurrentView('home')} />
          </PageTransition>
        );
      case 'stats':
        return (
          <PageTransition>
            <StatsView drugs={drugs} onBack={() => setCurrentView('home')} />
          </PageTransition>
        );
      default:
        return (
          <PageTransition>
            <div className="w-full max-w-lg mx-auto px-6 pt-10">
              {isAuthorized && config.maintenanceMode && (
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6 p-4 bg-amber-500 text-white rounded-2xl flex items-center justify-between shadow-lg shadow-amber-500/30">
                  <div className="flex items-center gap-3"><AlertTriangle size={20} /><span className="text-xs font-black">وضع المعاينة (التطبيق مغلق)</span></div>
                  <button onClick={() => setPreviewMaintenance(true)} className="px-3 py-1.5 bg-white/20 rounded-xl text-[10px] font-black flex items-center gap-1.5"><Eye size={12} /> معاينة القفل</button>
                </motion.div>
              )}

              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setShowNotifications(true)} className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-white/10 active:scale-90 transition-all shadow-sm relative">
                  <Bell size={20} />
                  {notifications.some(n => !n.isRead) && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-bounce" />}
                </button>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform" onClick={handleAdminAccess}>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Pharma <span className="text-blue-600 font-medium">Core</span></h1>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">CORE ENGINE ACTIVE</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${config.maintenanceMode ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 active:scale-90 transition-all">
                  {config.aiAnalysis ? <Sparkles size={20} fill="currentColor" /> : <Layout size={20} />}
                </div>
              </div>
              
              <div className="relative mb-6">
                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-400"><Search size={20} /></div>
                <input type="text" placeholder="ابحث عن دواء بالاسم..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl px-6 pr-12 py-4.5 text-[16px] font-bold shadow-sm outline-none placeholder:text-slate-400 dark:text-white focus:ring-4 focus:ring-blue-500/10 dark:focus:border-blue-500/30 transition-all text-right" />
              </div>

              <TabFilter current={mode} onChange={setMode} />
              
              <div className="mt-8 space-y-4">
                <AnimatePresence mode="popLayout">
                  {drugs.length > 0 ? (
                    <>
                      {drugs.map((drug, idx) => (
                        <DrugCard key={`${drug.drug_no}-${idx}`} drug={drug} index={idx} isFavorite={false} onToggleFavorite={() => {}} onOpenInfo={(d) => setSelectedDrug(d)} />
                      ))}
                      {hasMore && (
                        <motion.button onClick={() => loadData()} disabled={loading} className="w-full py-5 rounded-3xl bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold text-sm shadow-sm border border-slate-200 dark:border-white/10 flex items-center justify-center gap-2 active:scale-95 transition-all">
                          {loading ? <RefreshCw className="animate-spin" size={18} /> : <span>عرض المزيد من الأصناف</span>}
                        </motion.button>
                      )}
                    </>
                  ) : loading ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-32 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 loading-shimmer" />) : (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
                      <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-700"><Package size={48} /></div>
                      <p className="font-bold text-slate-400 dark:text-zinc-600">لا توجد نتائج مطابقة لبحثك</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </PageTransition>
        );
    }
  };

  return (
    <div className={`min-h-screen pb-40 transition-colors duration-700 ${darkMode ? 'bg-slate-950 text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
      <AnimatePresence mode="wait">
        {isMaintenanceActive ? (
          <motion.div key="maintenance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen flex flex-col items-center justify-center p-8 text-center" dir="rtl">
            <div className="max-w-md w-full">
              <div className="w-24 h-24 bg-amber-500/10 dark:bg-amber-500/20 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-500 mx-auto mb-8 animate-pulse shadow-2xl shadow-amber-500/10"><Construction size={48} /></div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">صيانة طارئة</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">{config.maintenanceMessage}</p>
              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[32px] p-6 flex items-center justify-between mb-8 shadow-sm">
                <div className="text-right"><span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">العودة المتوقعة خلال</span><span className="text-xl font-black text-amber-600 dark:text-amber-500">{config.maintenanceTime}</span></div>
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-500"><Clock size={24} /></div>
              </div>
              <button onClick={() => setShowLogin(true)} className="mt-4 flex items-center gap-2 text-[11px] font-black text-blue-500 bg-blue-500/5 px-6 py-3 rounded-full border border-blue-500/10 hover:bg-blue-500/10 transition-all mx-auto"><LogIn size={14} /> دخول المسؤول</button>
            </div>
          </motion.div>
        ) : (
          <div key="app-content" className="w-full">{renderView()}</div>
        )}
      </AnimatePresence>
      {!isMaintenanceActive && <BottomNavigation currentView={currentView} onNavigate={setCurrentView} />}
      <AnimatePresence>{showNotifications && <NotificationsModal notifications={notifications} onClose={() => setShowNotifications(false)} onClear={() => { setNotifications([]); localStorage.setItem('dwa_notifications', JSON.stringify([])); }} />}</AnimatePresence>
      <AnimatePresence>{showLogin && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 w-full max-w-sm rounded-[40px] p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-blue-500/30"><ShieldCheck size={32} /></div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">منطقة الإدارة</h2>
            <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="••••••" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 text-center text-2xl tracking-[0.5em] text-blue-600 dark:text-blue-400 font-bold mb-6 outline-none" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            <div className="flex gap-3">
              <button onClick={() => setShowLogin(false)} className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 font-bold text-sm">إلغاء</button>
              <button onClick={handleLogin} className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black text-sm">دخول</button>
            </div>
          </motion.div>
        </div>
      )}</AnimatePresence>
      <AnimatePresence>{selectedDrug && <DrugIntelligenceModal drug={selectedDrug} onClose={() => setSelectedDrug(null)} isMarketEnabled={config.marketCheck} isAiEnabled={config.aiAnalysis} />}</AnimatePresence>
    </div>
  );
};

export default App;
