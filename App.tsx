
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Coins, Package2, ShieldCheck, Zap, LayoutGrid, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchDrugBatchFromAPI } from './services/api.ts';
import { Drug, TabMode, AppView, AdminConfig } from './types.ts';
import { DrugCard } from './components/DrugCard.tsx';
import { TabFilter } from './components/TabFilter.tsx';
import { BottomNavigation } from './components/Navigation.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { DrugIntelligenceModal } from './components/DrugIntelligenceModal.tsx';
import { StatsView } from './components/StatsView.tsx';
import { AdminView } from './components/AdminView.tsx';
import { InvoiceBuilder } from './components/InvoiceBuilder.tsx';
import { PharmaQuiz } from './components/PharmaQuiz.tsx';
import { getGlobalConfig, syncTelegramUser } from './services/supabase.ts';

const App: React.FC = () => {
  const MDiv = motion.div as any;
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [mode, setMode] = useState<TabMode>('all');
  const [search, setSearch] = useState<string>('');
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [points, setPoints] = useState<number>(0);
  
  const [config, setConfig] = useState<AdminConfig>({
    aiAnalysis: true, 
    marketCheck: true, 
    maintenanceMode: false,
    maintenanceMessage: "", 
    maintenanceTime: "", 
    liveSync: true,
    pointsPerVideo: 50,
    pointsPerQuiz: 20,
    strictMode: true
  });

  useEffect(() => {
    const bootstrap = async () => {
      const timer = setTimeout(() => setInitialLoading(false), 500);
      try {
        const storedPoints = localStorage.getItem('core_points');
        if (storedPoints) setPoints(parseInt(storedPoints));

        const tg = (window as any).Telegram?.WebApp;
        if (tg) {
          tg.ready();
          tg.expand();
          tg.headerColor = '#f8fafc';
          tg.backgroundColor = '#f8fafc';
          const user = tg.initDataUnsafe?.user;
          if (user) {
            syncTelegramUser(user).then(dbUser => {
              if (dbUser?.is_admin || user.id === 1541678512) setIsAdmin(true);
            }).catch(() => {});
          }
        }

        const [configRes, drugsRes] = await Promise.allSettled([
          getGlobalConfig(),
          fetchDrugBatchFromAPI(0)
        ]);

        if (configRes.status === 'fulfilled' && configRes.value) setConfig({...config, ...configRes.value});
        if (drugsRes.status === 'fulfilled' && drugsRes.value) {
          setDrugs(drugsRes.value);
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

  const loadData = useCallback(async () => {
    if (initialLoading) return;
    setLoading(true);
    try {
      const results = await fetchDrugBatchFromAPI(0);
      let filtered = results;
      if (mode === 'changed') filtered = results.filter(d => d.price_new !== d.price_old);
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(d => 
          d.name_en?.toLowerCase().includes(s) || 
          d.name_ar?.includes(s) ||
          d.drug_no?.includes(s)
        );
      }
      setDrugs(filtered);
    } catch (e) {
      console.error("Data load failed");
    } finally {
      setLoading(false);
    }
  }, [mode, search, initialLoading]);

  useEffect(() => {
    if (!initialLoading && currentView === 'home') loadData();
  }, [mode, search, initialLoading, currentView, loadData]);

  const addPoints = (p: number) => {
    const newPoints = points + p;
    setPoints(newPoints);
    localStorage.setItem('core_points', newPoints.toString());
  };

  if (initialLoading) {
    return (
      <div className="boot-screen">
        <div className="boot-loader"></div>
        <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Pharma Core Premium</div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'admin': return <AdminView onBack={() => setCurrentView('home')} drugsCount={drugs.length} config={config} onUpdateConfig={c => setConfig({...config, ...c})} currentUser={null} userPoints={points} setPoints={addPoints}/>;
      case 'settings': return <SettingsView user={null} darkMode={false} toggleDarkMode={() => {}} onClearFavorites={() => {}} onBack={() => setCurrentView('home')} isAdmin={isAdmin} onOpenAdmin={() => setCurrentView('admin')} />;
      case 'stats': return <StatsView drugs={drugs} onBack={() => setCurrentView('home')} />;
      case 'invoice': return <InvoiceBuilder onBack={() => setCurrentView('home')} />;
      case 'quiz': return <PharmaQuiz onAddPoints={addPoints} currentPoints={points} config={config} />;
      default: return (
        <div className="pt-16 px-6 max-w-lg mx-auto w-full pb-32">
          <header className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
                <ShieldCheck size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">PHARMA <span className="text-blue-600">CORE</span></h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[8px] font-black bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 uppercase tracking-widest">Premium v4.0</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                </div>
              </div>
            </div>
            <MDiv 
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentView('quiz')} 
              className="premium-card px-4 py-2.5 rounded-2xl flex items-center gap-3 cursor-pointer"
            >
              <div className="p-1.5 bg-amber-500/10 rounded-lg">
                <Coins size={16} className="text-amber-600" />
              </div>
              <span className="text-xl font-black text-slate-900">{points}</span>
            </MDiv>
          </header>

          <div className="relative mb-8 group">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="ابحث عن دواء، شركة، أو باركود..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full bg-white border border-slate-200 rounded-[28px] px-8 py-6 pr-16 text-slate-800 text-lg font-bold outline-none focus:ring-4 ring-blue-500/10 focus:border-blue-500 transition-all text-right shadow-sm" 
            />
          </div>

          <div className="mb-10">
            <TabFilter current={mode} onChange={setMode} />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2 mb-2">
               <div className="flex items-center gap-2 text-slate-400">
                  <LayoutGrid size={14} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">قائمة الأدوية</span>
               </div>
               <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  {drugs.length} صنف متاح
               </div>
            </div>

            <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="py-24 flex flex-col items-center gap-6">
                  <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">مزامنة البيانات الحية</p>
                </div>
              ) : drugs.length === 0 ? (
                <MDiv initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-24 text-center bg-slate-50 rounded-[48px] border border-dashed border-slate-200">
                  <Package2 size={48} className="mx-auto text-slate-300 mb-6" />
                  <h3 className="text-lg font-black text-slate-500 mb-2">لم نجد ما تبحث عنه</h3>
                  <p className="text-xs text-slate-400 font-bold">حاول البحث باستخدام اسم دقيق</p>
                </MDiv>
              ) : (
                drugs.map((drug, idx) => (
                  <DrugCard key={drug.drug_no || idx} drug={drug} index={idx} isFavorite={false} onToggleFavorite={() => {}} onOpenInfo={setSelectedDrug} />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-blue-500/20 overflow-x-hidden">
      <AnimatePresence mode="wait">
        <MDiv key={currentView} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="w-full">
          {renderView()}
        </MDiv>
      </AnimatePresence>
      <BottomNavigation currentView={currentView} onNavigate={setCurrentView} />
      <AnimatePresence>
        {selectedDrug && <DrugIntelligenceModal drug={selectedDrug} onClose={() => setSelectedDrug(null)} isMarketEnabled={config.marketCheck} isAiEnabled={config.aiAnalysis} />}
      </AnimatePresence>
    </div>
  );
};

export default App;
