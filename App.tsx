
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Sparkles, RefreshCw, Package, Bell, Layout, ArrowLeft, ShieldCheck, Construction, Clock, AlertTriangle, Eye, Loader2, LogIn, ShieldAlert, Ban, Lock } from 'lucide-react';
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

const PageTransition = ({ children }: { children?: React.ReactNode }) => (
  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="w-full">
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [itemsLimit, setItemsLimit] = useState(100);
  const [sharedInvoice, setSharedInvoice] = useState<any | null>(null);

  const [config, setConfig] = useState({
    aiAnalysis: true, marketCheck: true, maintenanceMode: false,
    maintenanceMessage: "نظام Pharma Core حالياً في وضع التحديث.",
    maintenanceTime: "ساعة واحدة", liveSync: true
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      const user = tg.initDataUnsafe?.user;
      const startParam = tg.initDataUnsafe?.start_param;

      if (user) {
        setTgUser(user);
        syncTelegramUser(user).then((dbUser: any) => {
          if (dbUser?.id === MASTER_ID || dbUser?.is_admin) {
            setIsAdmin(true); setIsAuthorized(true); setItemsLimit(100000); 
          } else {
            if (dbUser?.device_info?.is_blocked) setIsBlocked(true);
            setItemsLimit(dbUser?.device_info?.items_limit || 100);
          }
        });
      }

      // معالجة الروابط العميقة الآمنة (inv_ID_TOKEN)
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
              alert("هذا الرابط غير صالح أو انتهت صلاحيته.");
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
  }, []);

  const loadData = useCallback(async (isInitial: boolean = false) => {
    if (configLoading || isBlocked) return;
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
      setHasMore(filtered.length >= 100 && drugs.length < itemsLimit);
      setOffset(currentOffset + 100);
    } catch (e) {} finally { setLoading(false); }
  }, [offset, search, mode, configLoading, isBlocked, itemsLimit, drugs.length]);

  useEffect(() => { if (!configLoading) loadData(true); }, [mode, search, config.maintenanceMode, configLoading, itemsLimit]);

  const handleLogin = () => {
    if (passcode === '547419') {
      setIsAuthorized(true); setShowLogin(false); setPasscode('');
      setCurrentView('admin'); setItemsLimit(100000);
    } else { alert('رمز الدخول غير صحيح'); }
  };

  if (isBlocked) return <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-8 text-center" dir="rtl"><h1 className="text-3xl font-black text-white mb-4">الدخول محظور</h1></div>;

  if (configLoading) return <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

  const renderView = () => {
    switch (currentView) {
      case 'admin': return <PageTransition><AdminView onBack={() => setCurrentView('home')} drugsCount={drugs.length} config={config} onUpdateConfig={c => { setConfig(c); updateGlobalConfig(c); }} currentUser={tgUser}/></PageTransition>;
      case 'settings': return <PageTransition><SettingsView user={tgUser} darkMode={darkMode} toggleDarkMode={() => { const next = !darkMode; setDarkMode(next); if (next) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); }} onClearFavorites={() => {}} onBack={() => setCurrentView('home')} /></PageTransition>;
      case 'stats': return <PageTransition><StatsView drugs={drugs} onBack={() => setCurrentView('home')} /></PageTransition>;
      case 'invoice': return <PageTransition><InvoiceBuilder onBack={() => { setSharedInvoice(null); setCurrentView('home'); }} sharedInvoice={sharedInvoice} /></PageTransition>;
      default: return (
        <PageTransition>
          <div className="w-full max-w-lg mx-auto px-6 pt-10">
            <div className="flex items-center justify-between mb-8"><button onClick={() => setShowNotifications(true)} className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 border relative"><Bell size={20} /></button>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Pharma <span className="text-blue-600 font-medium">Core</span></h1>
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white"><Sparkles size={20} /></div></div>
            <input type="text" placeholder="ابحث عن دواء..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white dark:bg-slate-900 border rounded-3xl px-6 py-4.5 text-right outline-none mb-6" />
            <TabFilter current={mode} onChange={setMode} />
            <div className="mt-8 space-y-4">{drugs.map((drug, idx) => (<DrugCard key={idx} drug={drug} index={idx} isFavorite={false} onToggleFavorite={() => {}} onOpenInfo={(d) => setSelectedDrug(d)} />))}</div>
          </div>
        </PageTransition>
      );
    }
  };

  return (
    <div className={`min-h-screen pb-40 ${darkMode ? 'bg-slate-950 text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
      <AnimatePresence mode="wait">{renderView()}</AnimatePresence>
      {(currentView !== 'invoice') && <BottomNavigation currentView={currentView} onNavigate={setCurrentView} />}
      <AnimatePresence>{showLogin && (<div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6"><div className="bg-white dark:bg-zinc-900 border w-full max-w-sm rounded-[40px] p-8 text-center"><h2 className="text-xl font-black mb-6">منطقة الإدارة</h2><input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border rounded-2xl py-4 text-center text-2xl mb-6" autoFocus /><div className="flex gap-3"><button onClick={() => setShowLogin(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl">إلغاء</button><button onClick={handleLogin} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl">دخول</button></div></div></div>)}</AnimatePresence>
      <AnimatePresence>{selectedDrug && <DrugIntelligenceModal drug={selectedDrug} onClose={() => setSelectedDrug(null)} isMarketEnabled={config.marketCheck} isAiEnabled={config.aiAnalysis} />}</AnimatePresence>
    </div>
  );
};

export default App;
