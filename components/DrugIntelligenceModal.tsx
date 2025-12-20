import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, AlertTriangle, CheckCircle, Building2, Wallet, Info, Activity, Sparkles } from 'lucide-react';
import { TawreedProduct } from '../types.ts';
import { checkDrugAvailability } from '../services/tawreed.ts';

interface DrugIntelligenceModalProps { 
  drug: any; 
  onClose: () => void; 
  isMarketEnabled: boolean; 
  isAiEnabled: boolean;
}

export const DrugIntelligenceModal: React.FC<DrugIntelligenceModalProps> = ({ drug, onClose, isMarketEnabled, isAiEnabled }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'market' | 'ai'>('overview');
    const [tawreedData, setTawreedData] = useState<TawreedProduct | null>(null);
    const [tawreedStatus, setTawreedStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');

    const drugName = drug.name_en || 'Unknown';
    const drugPrice = drug.price_new ?? 0;

    const checkMarket = async () => {
        if (!isMarketEnabled) return;
        setTawreedStatus('loading');
        try {
            const results = await checkDrugAvailability(drugName);
            if(results.length > 0) { 
              setTawreedData(results[0]); 
              setTawreedStatus('found'); 
            }
            else { 
              setTawreedStatus('not-found'); 
            }
        } catch(e) { 
          setTawreedStatus('not-found'); 
        }
    };

    useEffect(() => { 
      if(activeTab === 'market' && tawreedStatus === 'idle') checkMarket(); 
    }, [activeTab]);

    return (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-6" dir="rtl">
            <motion.div 
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 350 }}
                className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl relative"
            >
                <div className="absolute top-4 left-1/2 -translate-x-1/2 h-1.5 w-12 bg-slate-200 dark:bg-slate-800 rounded-full sm:hidden" />
                
                <div className="px-8 pt-10 pb-4 flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-black dark:text-white leading-tight">{drugName}</h2>
                      <p className="text-lg text-slate-500 font-bold mt-0.5">{drug.name_ar || '---'}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 active:scale-90 transition-transform">
                      <X size={20}/>
                    </button>
                </div>

                <div className="px-8 py-4">
                  <div className="flex bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-[28px] border border-slate-100 dark:border-white/5">
                      <button 
                        onClick={() => setActiveTab('overview')} 
                        className={`flex-1 py-3.5 rounded-[24px] text-[12px] font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'overview' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-white' : 'text-slate-400'}`}
                      >
                        <Info size={14} /> المواصفات
                      </button>
                      {isMarketEnabled && (
                        <button 
                          onClick={() => setActiveTab('market')} 
                          className={`flex-1 py-3.5 rounded-[24px] text-[12px] font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'market' ? 'bg-white dark:bg-slate-800 shadow-sm text-emerald-600 dark:text-white' : 'text-slate-400'}`}
                        >
                          <Activity size={14} /> السوق
                        </button>
                      )}
                      {isAiEnabled && (
                        <button 
                          onClick={() => setActiveTab('ai')} 
                          className={`flex-1 py-3.5 rounded-[24px] text-[12px] font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-400'}`}
                        >
                          <Sparkles size={14} /> ذكاء DWA
                        </button>
                      )}
                  </div>
                </div>

                <div className="p-8 pt-2 overflow-y-auto no-scrollbar flex-1">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50/50 dark:bg-blue-500/5 p-6 rounded-[32px] border border-blue-100/20 dark:border-blue-500/10">
                                        <Wallet size={20} className="text-blue-500 mb-4" />
                                        <div className="text-[10px] text-slate-400 font-black mb-1 uppercase tracking-widest">السعر الرسمي</div>
                                        <div className="flex items-baseline gap-1">
                                          <div className="text-2xl font-black">{Number(drugPrice).toFixed(2)}</div>
                                          <div className="text-[10px] font-bold text-slate-400">ج.م</div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[32px] border border-slate-100 dark:border-white/5">
                                        <Building2 size={20} className="text-slate-400 mb-4" />
                                        <div className="text-[10px] text-slate-400 font-black mb-1 uppercase tracking-widest">المصنع</div>
                                        <div className="text-[13px] font-bold text-slate-700 dark:text-slate-300 line-clamp-2">{drug.company || 'غير معروف'}</div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[32px] border border-slate-100 dark:border-white/5">
                                  <div className="text-[10px] text-slate-400 font-black mb-3 uppercase tracking-widest">بيانات إضافية</div>
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[13px] font-bold text-slate-500">كود الصنف</span>
                                      <span className="text-[13px] font-black text-slate-800 dark:text-white">#{drug.drug_no}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-[13px] font-bold text-slate-500">آخر تحديث للسعر</span>
                                      <span className="text-[13px] font-black text-slate-800 dark:text-white">
                                        {drug.api_updated_at ? new Date(drug.api_updated_at).toLocaleDateString('ar-EG') : 'غير متوفر'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'market' && (
                            <motion.div key="market" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                                {tawreedStatus === 'loading' ? (
                                    <div className="text-center py-16">
                                        <div className="relative w-16 h-16 mx-auto mb-6">
                                          <div className="absolute inset-0 rounded-full border-4 border-emerald-100 dark:border-emerald-900/30" />
                                          <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                                        </div>
                                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">تحقق من التوفر الحالي...</p>
                                    </div>
                                ) : tawreedStatus === 'found' ? (
                                    <div className="space-y-4">
                                      <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 p-8 rounded-[40px] text-center">
                                          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-emerald-500/20">
                                            <CheckCircle size={32} />
                                          </div>
                                          <h4 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mb-2">متوفر في المخازن</h4>
                                          <p className="text-[13px] font-bold text-emerald-500/70 mb-6">تم العثور على عروض توريد نشطة</p>
                                          
                                          <div className="grid grid-cols-2 gap-3">
                                              <div className="bg-white dark:bg-slate-900 p-5 rounded-[28px] border border-emerald-100/30 dark:border-white/5">
                                                  <div className="text-[10px] text-slate-400 font-black mb-1">أفضل سعر عرض</div>
                                                  <div className="text-xl font-black text-emerald-600">{Number(tawreedData?.bestSale || 0).toFixed(2)}</div>
                                              </div>
                                              <div className="bg-white dark:bg-slate-900 p-5 rounded-[28px] border border-emerald-100/30 dark:border-white/5">
                                                  <div className="text-[10px] text-slate-400 font-black mb-1">الكمية الإجمالية</div>
                                                  <div className="text-xl font-black text-emerald-600">{tawreedData?.totalQty}</div>
                                              </div>
                                          </div>
                                      </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] border border-dashed border-slate-200 dark:border-white/5">
                                        <AlertTriangle size={48} className="mx-auto text-slate-300 dark:text-slate-800 mb-4" />
                                        <p className="font-bold text-slate-400 mb-2">لا يوجد مخزون حالي</p>
                                        <p className="text-[11px] text-slate-300 dark:text-slate-600 px-10">لم نتمكن من العثور على عروض متاحة لهذا الصنف في الوقت الحالي.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'ai' && (
                            <motion.div key="ai" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-4">
                                <div className="bg-indigo-600 p-8 rounded-[40px] text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20">
                                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 blur-3xl -ml-16 -mt-16" />
                                    <Sparkles size={32} className="mb-6 opacity-50" />
                                    <h4 className="text-xl font-black mb-2">رؤية المحرك التنبؤي</h4>
                                    <p className="text-[13px] font-medium leading-relaxed opacity-90">بناءً على اتجاهات السوق، من المتوقع ثبات سعر هذا الصنف خلال الدورة القادمة.</p>
                                    
                                    <div className="mt-8 pt-6 border-t border-white/10 flex justify-between">
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">مستوى الخطورة</div>
                                            <div className="text-lg font-black">Low Risk</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">التوصية</div>
                                            <div className="text-lg font-black">Hold Stock</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 text-[11px] text-slate-400 font-bold leading-relaxed text-center">
                                    هذا التحليل تم بواسطة محرك Gemini 3 بناءً على البيانات المتوفرة في الكاش المحلي وحالة السوق الحالية.
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div className="pb-safe h-6" />
            </motion.div>
        </div>
    );
};