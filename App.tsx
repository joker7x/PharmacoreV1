
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Package2, ShieldCheck, Zap, LayoutGrid, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchDrugBatchFromAPI } from './services/api.ts';
import { Drug, TabMode, AppView, AdminConfig } from './types.ts';
import { DrugCard } from './components/DrugCard.tsx';
import { TabFilter } from './components/TabFilter.tsx';
import { BottomNavigation } from './components/Navigation.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { AdminView } from './components/AdminView.tsx';
import { InvoiceBuilder } from './components/InvoiceBuilder.tsx';
import { ShortagesView } from './components/ShortagesView.tsx';
import { CommunityView } from './components/CommunityView.tsx';
import { getGlobalConfig, syncTelegramUser } from './services/supabase.ts';

const App: React.FC = () => {
  const MDiv = motion.div as any;
  const [allDrugs, setAllDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [mode, setMode] = useState<TabMode>('all');
  const [searchInput, setSearchInput] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  const [isAdmin, setIsAdmin] = useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    const root = document.getElementById('root');
    if (root) {
      root.scrollTo(0, 0);
    }
    window.scrollTo(0, 0);
  };
  
  const [config, setConfig] = useState<AdminConfig>({
    aiAnalysis: true, 
    marketCheck: true, 
    maintenanceMode: false,
    maintenanceMessage: "", 
    maintenanceTime: "", 
    liveSync: true,
    strictMode: true
  });

  useEffect(() => {
    const bootstrap = async () => {
      const timer = setTimeout(() => setInitialLoading(false), 500);
      try {
        const tg = (window as any).Telegram?.WebApp;
        if (tg) {
          tg.ready();
          tg.expand();
          tg.headerColor = '#f8fafc';
          tg.backgroundColor = '#f8fafc';
          const user = tg.initDataUnsafe?.user;
          if (user) {
            setCurrentUser(user);
            syncTelegramUser(user).then(dbUser => {
              if (dbUser?.is_admin || user.id === 1541678512) setIsAdmin(true);
            }).catch(() => {});
          } else {
            // Mock user for browser preview
            setCurrentUser({
              id: 123456789,
              first_name: 'مستخدم',
              last_name: 'تجريبي',
              username: 'testuser'
            });
            setIsAdmin(true);
          }
        }

        const [configRes, drugsRes] = await Promise.allSettled([
          getGlobalConfig(),
          fetchDrugBatchFromAPI(0)
        ]);

        if (configRes.status === 'fulfilled' && configRes.value) setConfig({...config, ...configRes.value});
        if (drugsRes.status === 'fulfilled' && drugsRes.value) {
          setAllDrugs(drugsRes.value);
        }
      } catch (e) {
        console.warn("Bootstrap process finished with warnings.");
      } finally {
        setLoading(false);
        clearTimeout(timer);
        setInitialLoading(false);
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(searchInput);
      setAllDrugs([]);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    setAllDrugs([]);
  }, [mode]);

  const filteredDrugs = React.useMemo(() => {
    let filtered = allDrugs;
    if (mode === 'changed') filtered = filtered.filter(d => d.price_new !== d.price_old);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(d => 
        d.name_en?.toLowerCase().includes(s) || 
        d.name_ar?.includes(s) ||
        d.drug_no?.includes(s)
      );
    }
    
    // Ensure uniqueness by drug_no
    const uniqueMap = new Map();
    for (const drug of filtered) {
        uniqueMap.set(drug.drug_no, drug);
    }
    return Array.from(uniqueMap.values());
  }, [allDrugs, mode, search]);

  const fetchNextBatch = useCallback(async () => {
    if (isFetching) return;
    setIsFetching(true);
    try {
      const results = await fetchDrugBatchFromAPI(allDrugs.length);
      if (results.length > 0) {
        setAllDrugs(prev => {
            const newDrugs = [...prev, ...results];
            // Ensure uniqueness by drug_no
            const uniqueMap = new Map();
            for (const drug of newDrugs) {
                uniqueMap.set(drug.drug_no, drug);
            }
            return Array.from(uniqueMap.values());
        });
      }
    } catch (e) {
      console.error("Failed to fetch next batch");
    } finally {
      setIsFetching(false);
    }
  }, [allDrugs.length, isFetching]);

  // Removed scroll event listener

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    scrollToTop();
  };

  const loadData = useCallback(async () => {
    if (initialLoading) return;
    setLoading(true);
    try {
      const results = await fetchDrugBatchFromAPI(0);
      setAllDrugs(results);
    } catch (e) {
      console.error("Data load failed");
    } finally {
      setLoading(false);
    }
  }, [initialLoading]);

  useEffect(() => {
    if (!initialLoading && currentView === 'home' && allDrugs.length === 0) {
      loadData();
    }
  }, [initialLoading, currentView, loadData, allDrugs.length]);

  const handleToggleFavorite = useCallback(() => {}, []);

  const renderView = () => {
    switch (currentView) {
      case 'admin': return <AdminView onBack={() => setCurrentView('home')} drugsCount={allDrugs.length} config={config} onUpdateConfig={c => setConfig({...config, ...c})} currentUser={currentUser} />;
      case 'settings': return <SettingsView user={currentUser} darkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} onClearFavorites={() => {}} onBack={() => setCurrentView('home')} isAdmin={isAdmin} onOpenAdmin={() => setCurrentView('admin')} onOpenInvoice={() => setCurrentView('invoice')} />;
      case 'invoice': return <InvoiceBuilder onBack={() => setCurrentView('home')} />;
      case 'shortages': return <ShortagesView onBack={() => setCurrentView('home')} />;
      case 'community': return <CommunityView onBack={() => setCurrentView('home')} />;
      default: return (
        <div className="pt-16 px-6 max-w-lg mx-auto w-full pb-32">
          <header className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
                <ShieldCheck size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none dark:text-white">PHARMA <span className="text-blue-600">CORE</span></h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[8px] font-black bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 uppercase tracking-widest dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">Premium v4.0</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                </div>
              </div>
            </div>
          </header>

          <div className="relative mb-8 group">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="ابحث عن دواء، شركة، أو باركود..." 
              value={searchInput} 
              onChange={(e) => setSearchInput(e.target.value)} 
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] px-8 py-6 pr-16 text-slate-800 dark:text-slate-100 text-lg font-bold outline-none focus:ring-4 ring-blue-500/10 dark:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all text-right shadow-sm" 
            />
          </div>

          <div className="mb-10">
            <TabFilter current={mode} onChange={setMode} />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2 mb-2">
               <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <LayoutGrid size={14} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">قائمة الأدوية</span>
               </div>
               <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/30">
                  {filteredDrugs.length} صنف متاح
               </div>
            </div>

            <AnimatePresence mode="popLayout">
              {loading && allDrugs.length === 0 ? (
                <div key="loading-state" className="py-24 flex flex-col items-center gap-6">
                  <div className="w-12 h-12 border-4 border-slate-100 dark:border-slate-800 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"></div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.3em]">مزامنة البيانات الحية</p>
                </div>
              ) : filteredDrugs.length === 0 ? (
                <MDiv key="no-results-state" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-24 text-center bg-slate-50 dark:bg-slate-900 rounded-[48px] border border-dashed border-slate-200 dark:border-slate-800">
                  <Package2 size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-6" />
                  <h3 className="text-lg font-black text-slate-500 dark:text-slate-400 mb-2">لم نجد ما تبحث عنه</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">حاول البحث باستخدام اسم دقيق</p>
                </MDiv>
              ) : (
                <>
                  {filteredDrugs.map((drug, idx) => (
                    <DrugCard key={drug.drug_no} drug={drug} index={idx} isFavorite={false} onToggleFavorite={handleToggleFavorite} onOpenInfo={setSelectedDrug} />
                  ))}
                  {isFetching ? (
                    <div className="py-6 flex justify-center">
                      <div className="w-8 h-8 border-4 border-slate-100 dark:border-slate-800 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="py-6 flex justify-center">
                      <button 
                        onClick={fetchNextBatch}
                        className="px-6 py-3 bg-blue-600 text-white font-black rounded-full shadow-lg shadow-blue-500/30 dark:shadow-blue-900/20 hover:bg-blue-700 transition-all active:scale-95"
                      >
                        تحميل المزيد
                      </button>
                    </div>
                  )}
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-blue-500/20 dark:selection:bg-blue-500/30 overflow-x-hidden transition-colors duration-300">
      <MDiv key={currentView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full">
        {renderView()}
      </MDiv>
      <BottomNavigation currentView={currentView} onNavigate={handleNavigate} />
    </div>
  );
};

export default App;
