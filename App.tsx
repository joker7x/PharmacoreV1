
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Sparkles, RefreshCw, Package, Bell, Layout, ArrowLeft, ShieldCheck, Construction, Clock, AlertTriangle, Eye } from 'lucide-react';
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

const App: React.FC = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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
  
  const [config, setConfig] = useState({
    aiAnalysis: true,
    marketCheck: true,
    maintenanceMode: false,
    maintenanceMessage: "النظام حالياً تحت الصيانة لتحديث الأسعار وتطوير قاعدة البيانات لضمان أفضل تجربة لكم.",
    maintenanceTime: "ساعة واحدة",
    liveSync: true
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Sync settings across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dwa_admin_config' && e.newValue) {
        setConfig(JSON.parse(e.newValue));
      }
      if (e.key === 'dwa_notifications' && e.newValue) {
        setNotifications(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadData = useCallback(async (isInitial: boolean = false) => {
    if (config.maintenanceMode && !isAuthorized) return;
    
    setLoading(true);
    const currentOffset = isInitial ? 0 : offset;
    try {
      const results = await fetchDrugBatchFromAPI(currentOffset);
      let filtered = results;
      if (mode === 'changed') {
        filtered = results.filter(d => d.price_new !== null && d.price_old !== null && d.price_new !== d.price_old);
      }
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
  }, [offset, search, mode, config.maintenanceMode, isAuthorized]);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('dwa_dark_mode') === 'true';
    const savedConfig = localStorage.getItem('dwa_admin_config');
    const savedNotifs = localStorage.getItem('dwa_notifications');
    
    if (savedConfig) setConfig(JSON.parse(savedConfig));
    if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
    
    setDarkMode(savedDarkMode);
    if (savedDarkMode) document.documentElement.classList.add('dark');
    loadData(true);
  }, []);

  useEffect(() => {
    loadData(true);
  }, [mode, search, config.maintenanceMode]);

  const updateConfig = (newConfig: any) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    localStorage.setItem('dwa_admin_config', JSON.stringify(updated));
    // Trigger local storage event for same tab synchronization if needed
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'dwa_admin_config',
      newValue: JSON.stringify(updated)
    }));
  };

  const handleAdminAccess = () => {
    if (isAuthorized) setCurrentView('admin');
    else setShowLogin(true);
  };

  const handleLogin = () => {
    if (passcode === '547419') {
      setIsAuthorized(true);
      setShowLogin(false);
      setCurrentView('admin');
      setPasscode('');
    } else {
      alert('كلمة المرور غير صحيحة');
      setPasscode('');
    }
  };

  // Maintenance Lockdown Component
  const MaintenanceScreen = () => (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center" dir="rtl">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md">
        <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-8 animate-pulse shadow-2xl shadow-amber-500/20">
          <Construction size={48} />
        </div>
        <h1 className="text-3xl font-black text-white mb-4">صيانة طارئة</h1>
        <p className="text-slate-400 font-medium leading-relaxed mb-8">
          {config.maintenanceMessage}
        </p>
        
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 flex items-center justify-between mb-8 shadow-inner">
          <div className="text-right">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">العودة المتوقعة خلال</span>
            <span className="text-xl font-black text-amber-500">{config.maintenanceTime}</span>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
            <Clock size={24} />
          </div>
        </div>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-widest">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
          System Optimization Active
        </div>

        {isAuthorized && (
          <button 
            onClick={() => setPreviewMaintenance(false)}
            className="mt-12 block mx-auto text-[11px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-6 py-3 rounded-full border border-blue-500/20"
          >
            خروج من وضع المعاينة
          </button>
        )}
      </motion.div>
    </div>
  );

  // LOGIC: If maintenance is ON and user is NOT authorized, OR Admin explicitly wants to preview
  if (config.maintenanceMode && (!isAuthorized || previewMaintenance)) {
    return <MaintenanceScreen />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'admin':
        return <AdminView 
          onBack={() => setCurrentView('home')} 
          drugsCount={drugs.length} 
          config={config} 
          onUpdateConfig={updateConfig}
        />;
      case 'settings':
        return <SettingsView darkMode={darkMode} toggleDarkMode={() => {
          const next = !darkMode;
          setDarkMode(next);
          localStorage.setItem('dwa_dark_mode', String(next));
          if (next) document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
        }} onClearFavorites={() => {}} onBack={() => setCurrentView('home')} />;
      case 'stats':
        return <StatsView drugs={drugs} onBack={() => setCurrentView('home')} />;
      default:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-lg mx-auto px-6 pt-10">
            {/* Admin Warning Banner */}
            {isAuthorized && config.maintenanceMode && (
              <motion.div 
                initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="mb-6 p-4 bg-rose-500 text-white rounded-2xl flex items-center justify-between shadow-lg shadow-rose-500/30"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle size={20} />
                  <span className="text-xs font-black">وضع الصيانة نشط حالياً للعامة</span>
                </div>
                <button 
                  onClick={() => setPreviewMaintenance(true)}
                  className="px-3 py-1.5 bg-white/20 rounded-xl text-[10px] font-black flex items-center gap-1.5"
                >
                  <Eye size={12} /> معاينة القفل
                </button>
              </motion.div>
            )}

            <div className="flex items-center justify-between mb-8">
              <button onClick={() => setShowNotifications(true)} className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-white/10 active:scale-90 transition-all shadow-sm relative">
                <Bell size={20} />
                {notifications.some(n => !n.isRead) && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-bounce" />}
              </button>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform" onClick={handleAdminAccess}>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Prices <span className="text-blue-500 font-medium">DWA</span></h1>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">LIVE CONNECT</span>
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
                    <p className="font-bold text-slate-400 dark:text-slate-600">لا توجد نتائج مطابقة لبحثك</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className={`min-h-screen pb-40 transition-colors duration-700 ${darkMode ? 'bg-slate-950 text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
      
      {/* Hide navigation if maintenance is on and not admin */}
      {(!config.maintenanceMode || isAuthorized) && (
        <BottomNavigation currentView={currentView} onNavigate={setCurrentView} />
      )}

      <AnimatePresence>{showNotifications && <NotificationsModal notifications={notifications} onClose={() => setShowNotifications(false)} onClear={() => { setNotifications([]); localStorage.setItem('dwa_notifications', JSON.stringify([])); }} />}</AnimatePresence>
      <AnimatePresence>{showLogin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-zinc-900 border border-white/10 w-full max-w-sm rounded-[40px] p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white"><ShieldCheck size={32} /></div>
            <h2 className="text-xl font-black text-white mb-2">منطقة الإدارة</h2>
            <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="••••••" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 text-center text-2xl tracking-[1em] text-blue-400 font-bold mb-6 outline-none" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            <div className="flex gap-3">
              <button onClick={() => setShowLogin(false)} className="flex-1 py-4 rounded-2xl bg-white/5 text-zinc-400 font-bold text-sm">إلغاء</button>
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
