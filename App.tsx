import React, { useState, useEffect, useCallback } from 'react';
import { Search, Sparkles, RefreshCw, Package, Bell, Layout, ArrowLeft, ShieldCheck, Construction, Clock, AlertTriangle, Eye, Loader2, LogIn, ShieldAlert, Ban, Lock, Settings, Scan } from 'lucide-react';
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
import { InvoiceBuilder } from './components/InvoiceBuilder.tsx';
import { getGlobalConfig, updateGlobalConfig, syncTelegramUser, getInvoice, validateShareToken } from './services/supabase.ts';

const MASTER_ID = 1541678512;

const ViewTransition = ({ children }: { children?: React.ReactNode }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.98 }} 
    animate={{ opacity: 1, scale: 1 }} 
    exit={{ opacity: 0, scale: 1.02 }} 
    transition={{ type: "spring", damping: 25, stiffness: 200 }} 
    className="w-full max-w-lg mx-auto px-5"
  >
    {children}
  </motion.div>
);

const App: React.FC = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [configLoading, setConfigLoading] = useState<boolean>(true);
  const [offset, setOffset] = useState(0);
  const [mode, setMode] = useState<TabMode>('all');
  const [search, setSearch] = useState<string>('');
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [tgUser, setTgUser] = useState<any>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [itemsLimit, setItemsLimit] = useState(100);
  const [sharedInvoice, setSharedInvoice] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [config, setConfig] = useState({
    aiAnalysis: true, marketCheck: true, maintenanceMode: false,
    maintenanceMessage: "نظام Pharma Core حالياً في وضع التحديث.",
    maintenanceTime: "ساعة واحدة", liveSync: true
  });

  const loadNotifications = useCallback(() => {
    const saved = localStorage.getItem('dwa_notifications');
    if (saved) setNotifications(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      
      const user = tg.initDataUnsafe?.user;
      const startParam = tg.initDataUnsafe?.start_param || 
                         new URLSearchParams(window.location.hash.split('?')[1] || window.location.search).get('startapp');

      if (user) {
        setTgUser(user);
        syncTelegramUser(user).then((dbUser: any) => {
          if (dbUser?.id === MASTER_ID || dbUser?.is_admin) {
            setIsAdmin(true); 
            setIsAuthorized(true); 
            setItemsLimit(100000); 
          } else {
            if (dbUser?.device_info?.is_blocked) setIsBlocked(true);
            setItemsLimit(dbUser?.device_info?.items_limit || 100);
          }
        });
      }

      if (startParam && startParam.startsWith('inv_')) {
        const parts = startParam.split('_');
        if (parts.length >= 3) {
          const invId = parts[1];
          const token = parts[2];
          setLoading(true);
          validateShareToken(invId, token).then(isValid => {
            if (isValid) {
              getInvoice(invId).then(inv => {
                if (inv) {
                  setSharedInvoice(inv);
                  setCurrentView('invoice');
                }
              }).finally(() => setLoading(false));
            } else {
              setLoading(false);
            }
          });
        }
      }
    }

    const savedDarkMode = localStorage.getItem('dwa_dark_mode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) document.documentElement.classList.add('dark');
    
    getGlobalConfig().then(c => { if (c) setConfig(c); setConfigLoading(false); });
    loadNotifications();

    window.addEventListener('storage', loadNotifications);
    return () => window.removeEventListener('storage', loadNotifications);
  }, [loadNotifications]);

  const loadData = useCallback(async (isInitial: boolean = false) => {
    if (configLoading || isBlocked || (config.maintenanceMode && !isAdmin)) return;
    setLoading(true);
    const currentOffset = isInitial ? 0 : offset;
    try {
      const results = await fetchDrugBatchFromAPI(currentOffset);
      let filtered = results;
      if (mode === 'changed') filtered = results.filter(d => d.price_new !== d.price_old);
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(d => (d.name_en?.toLowerCase().includes(s)) || (d.name_ar?.includes(s)));
      }
      setDrugs(isInitial ? filtered.slice(0, itemsLimit) : prev => [...prev, ...filtered.slice(0, itemsLimit - prev.length)]);
      setOffset(currentOffset + 100);
    } catch (e) {} finally { setLoading(false); }
  }, [offset, search, mode, configLoading, isBlocked, itemsLimit, config.maintenanceMode, isAdmin]);

  useEffect(() => { if (!configLoading) loadData(true); }, [mode, search, config.maintenanceMode, configLoading, itemsLimit, loadData]);

  const handleLogin = () => {
    if (passcode === '547419') {
      setIsAuthorized(true); 
      setIsAdmin(true);
      setShowLogin(false); 
      setPasscode('');
      setCurrentView('admin'); 
      setItemsLimit(100000);
    } else { alert('رمز الدخول غير صحيح'); }
  };

  if (isBlocked) return <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-8 text-center" dir="rtl"><h1 className="text-3xl font-black text-white mb-4">الدخول محظور</h1><p className="text-zinc-500 font-bold">يرجى التواصل مع الإدارة</p></div>;
  
  if (configLoading) return (
    <div className="min-h-screen bg-brand-background dark:bg-brand-dark flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-3xl bg-blue-600/10 dark:bg-blue-600/20 animate-pulse" />
        <Loader2 className="animate-spin text-blue-600 absolute inset-0 m-auto" size={32} />
      </div>
      <p className="text-sm font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest">Pharma Core Security</p>
    </div>
  );

  // شاشة وضع الصيانة القطعية
  if (config.maintenanceMode && !isAdmin && currentView !== 'admin' && !sharedInvoice) {
    return (
      <div className="min-h-screen bg-brand-background dark:bg-brand-dark flex flex-col items-center justify-center p-8 text-center" dir="rtl">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full">
          <div className="w-24 h-24 bg-amber-500/10 text-amber-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-amber-500/5">
            <Construction size={48} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">وضع الصيانة</h1>
          <p className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-10 leading-relaxed">
            {config.maintenanceMessage}
          </p>
          <div className="bg-slate-50 dark:bg-zinc-900 rounded-[28px] p-6 border border-slate-100 dark:border-white/5 flex items-center justify-center gap-4 mb-10">
            <Clock className="text-blue-600" size={24} />
            <div className="text-right">
              <div className="text-[10px] font-black text-slate-400 uppercase">الوقت المتوقع</div>
              <div className="text-lg font-black text-slate-900 dark:text-white">{config.maintenanceTime}</div>
            </div>
          </div>
          <button onClick={() => setShowLogin(true)} className="w-full py-5 bg-blue-600 text-white rounded-[22px] font-black text-sm shadow-xl shadow-blue-500/20 active:scale-95 transition-all mb-4">
            دخول المسؤولين
          </button>
        </motion.div>

        <AnimatePresence>
          {showLogin && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-zinc-900 border border-white/10 w-full max-w-sm rounded-[40px] p-8 text-center shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center mx-auto mb-6">
                  <Lock size={28} />
                </div>
                <h2 className="text-xl font-black mb-2 dark:text-white">منطقة الإدارة</h2>
                <p className="text-xs font-bold text-slate-500 mb-8">يرجى إدخال رمز الدخول الآمن</p>
                <input 
                  type="password" 
                  value={passcode} 
                  onChange={(e) => setPasscode(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 text-center text-3xl font-black mb-6 tracking-widest outline-none focus:border-blue-500" 
                  autoFocus 
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowLogin(false)} className="flex-1 py-4 bg-slate-100 dark:bg-zinc-800 dark:text-white rounded-2xl font-black text-sm active:scale-95 transition-all">إلغاء</button>
                  <button onClick={handleLogin} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all">دخول</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'admin': return <AdminView onBack={() => setCurrentView('home')} drugsCount={drugs.length} config={config} onUpdateConfig={c => { setConfig(prev => ({...prev, ...c})); updateGlobalConfig({...config, ...c}); }} currentUser={tgUser}/>;
      case 'settings': return <SettingsView user={tgUser} darkMode={darkMode} toggleDarkMode={() => { const next = !darkMode; setDarkMode(next); if (next) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); localStorage.setItem('dwa_dark_mode', next.toString()); }} onClearFavorites={() => {}} onBack={() => setCurrentView('home')} isAdmin={isAdmin} onOpenAdmin={() => isAdmin ? setCurrentView('admin') : setShowLogin(true)} />;
      case 'stats': return <StatsView drugs={drugs} onBack={() => setCurrentView('home')} />;
      case 'invoice': return <InvoiceBuilder onBack={() => { setSharedInvoice(null); setCurrentView('home'); }} sharedInvoice={sharedInvoice} />;
      default: return (
        <ViewTransition>
          <div className="pt-6 pb-4">
            <div className="flex items-center justify-between mb-8 px-1">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-[16px] bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 active:scale-95 transition-all">
                  <Sparkles size={18} />
                </div>
                <button onClick={() => setShowNotifications(true)} className="w-11 h-11 rounded-[16px] bg-white dark:bg-zinc-900 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-white/5 shadow-sm relative active:scale-95 transition-all">
                  <Bell size={18} />
                  {notifications.some(n => !n.isRead) && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900 animate-pulse" />}
                </button>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-[9px] font-black text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">PREMIUM</span>
                  <h1 className="text-[20px] font-black text-slate-900 dark:text-white leading-none">Pharma <span className="text-blue-600">Core</span></h1>
                </div>
                <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 mt-1">مرحباً، {tgUser?.first_name || 'صيدلي كور'}</p>
              </div>
            </div>

            <div className="relative group mb-6">
              <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="ابحث عن دواء بالاسم..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-[22px] px-6 py-4.5 pr-13 text-[14px] font-bold text-right outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all shadow-sm dark:shadow-none" 
              />
            </div>

            <TabFilter current={mode} onChange={setMode} />

            <div className="mt-8 space-y-4">
              {loading && drugs.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center gap-4">
                  <div className="relative">
                    <Loader2 className="animate-spin text-blue-600/20" size={48} />
                    <Loader2 className="animate-spin text-blue-600 absolute inset-0 m-auto" size={24} />
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">تحديث البيانات اللحظية...</p>
                </div>
              ) : (
                <>
                  {drugs.length === 0 ? (
                    <div className="py-20 text-center">
                      <Package size={48} className="mx-auto text-slate-200 dark:text-zinc-800 mb-4" />
                      <p className="text-sm font-bold text-slate-400">لا توجد نتائج مطابقة</p>
                    </div>
                  ) : (
                    drugs.map((drug, idx) => (
                      <DrugCard 
                        key={idx} 
                        drug={drug} 
                        index={idx} 
                        isFavorite={false} 
                        onToggleFavorite={() => {}} 
                        onOpenInfo={(d) => setSelectedDrug(d)} 
                      />
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        </ViewTransition>
      );
    }
  };

  return (
    <div className={`min-h-screen pb-40 ${darkMode ? 'bg-brand-dark text-white' : 'bg-brand-background text-slate-900'}`}>
      <AnimatePresence mode="wait">{renderView()}</AnimatePresence>
      {(currentView !== 'invoice') && <BottomNavigation currentView={currentView} onNavigate={setCurrentView} />}
      
      <AnimatePresence>
        {selectedDrug && <DrugIntelligenceModal drug={selectedDrug} onClose={() => setSelectedDrug(null)} isMarketEnabled={config.marketCheck} isAiEnabled={config.aiAnalysis} />}
      </AnimatePresence>
      
      <AnimatePresence>
        {showNotifications && (
          <NotificationsModal 
            notifications={notifications} 
            onClose={() => setShowNotifications(false)} 
            onClear={() => {
              setNotifications([]);
              localStorage.setItem('dwa_notifications', '[]');
              window.dispatchEvent(new Event('storage'));
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;