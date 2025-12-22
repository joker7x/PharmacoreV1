import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, Printer, Calculator, Edit3, Package, FileText, Scan, X, CheckCircle2, ChevronRight, Share2, Loader2, Copy, Check, Download, ArrowLeft } from 'lucide-react';
import { Drug, InvoiceItem } from '../types';
import { searchDrugs, lookupByBarcode, saveInvoice, createSecureShareLink } from '../services/supabase.ts';
import { Html5Qrcode } from 'html5-qrcode';

interface InvoiceBuilderProps {
  onBack: () => void;
  sharedInvoice?: {
    id: string;
    content: {
      items: InvoiceItem[];
      pharmacyName: string;
      total: number;
    };
  } | null;
}

export const InvoiceBuilder: React.FC<InvoiceBuilderProps> = ({ onBack, sharedInvoice }) => {
  const [items, setItems] = useState<InvoiceItem[]>(sharedInvoice?.content.items || []);
  const [pharmacyName, setPharmacyName] = useState(sharedInvoice?.content.pharmacyName || 'صيدلية Pharma Core');
  const [isFinalized, setIsFinalized] = useState(!!sharedInvoice);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Drug[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isScanning) {
      const initCamera = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          const container = document.getElementById('reader');
          if (!container) return;
          const html5QrCode = new Html5Qrcode("reader");
          html5QrCodeRef.current = html5QrCode;
          await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            async (decodedText) => {
              setIsScanning(false);
              if (html5QrCodeRef.current) await html5QrCodeRef.current.stop();
              setIsSearching(true);
              const drug = await lookupByBarcode(decodedText);
              if (drug) addItem(drug);
              else alert(`لم يتم العثور على باركود: ${decodedText}`);
              setIsSearching(false);
            },
            () => {}
          );
        } catch (err) { setIsScanning(false); }
      };
      initCamera();
    }
    return () => { if (html5QrCodeRef.current?.isScanning) html5QrCodeRef.current.stop(); };
  }, [isScanning]);

  const handleSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const results = await searchDrugs(q);
      setSearchResults(results);
    } catch (e) {} finally { setIsSearching(false); }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { handleSearch(searchQuery); }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, handleSearch]);

  const addItem = (drug: Drug) => {
    const packPrice = Number(drug.price_new || 0);
    const packSize = Number(drug.pack_size || 1);
    const unitPrice = packPrice / packSize;
    const id = `db-${drug.drug_no}-${Date.now()}`;
    const newItem: InvoiceItem = {
      id, drug_no: drug.drug_no, name: drug.name_en, name_ar: drug.name_ar,
      unitPrice, quantity: 1, packPrice, packSize
    };
    setItems([...items, newItem]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));

  const updateQuantity = (id: string, delta: number) => {
    setItems(items.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  const handlePrint = () => { 
    if (items.length === 0) return;
    window.print(); 
  };

  const handleShare = async () => {
    if (items.length === 0) return;
    setIsSaving(true);
    try {
      const invoiceId = await saveInvoice({ items, pharmacyName, total: totalAmount, date: new Date().toISOString() });
      if (!invoiceId) throw new Error("Saving failed");

      const telegramLink = await createSecureShareLink(invoiceId);
      if (!telegramLink) throw new Error("Link generation failed");

      if (navigator.share) {
        await navigator.share({
          title: `فاتورة ${pharmacyName}`,
          text: `عرض الفاتورة التقديرية (صالحة لمدة ساعة):`,
          url: telegramLink
        });
      } else {
        await navigator.clipboard.writeText(telegramLink);
        alert("تم نسخ رابط المشاركة للحافظة!");
      }
    } catch (err) {
      alert("عذراً، حدث خطأ أثناء محاولة المشاركة.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#09090b] pt-14 pb-48 px-4 sm:px-6 rtl overflow-x-hidden ${isFinalized ? 'finalized-mode' : ''}`} dir="rtl">
      <AnimatePresence>
        {isScanning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6">
            <div className="w-full max-sm bg-zinc-900 border border-white/10 rounded-[48px] overflow-hidden p-8 relative">
              <button onClick={() => setIsScanning(false)} className="absolute top-6 left-6 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white active:scale-90"><X size={24} /></button>
              <div className="text-center mb-8"><div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-500"><Scan size={32} /></div><h3 className="text-white text-xl font-black">قارئ الباركود</h3></div>
              <div id="reader" className="w-full aspect-square rounded-[32px] overflow-hidden bg-black border border-white/5 shadow-2xl"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(isFinalized || sharedInvoice) && (
          <motion.div initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }} className="fixed top-0 left-0 right-0 z-[200] bg-white/90 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex items-center justify-between print:hidden shadow-lg">
            <div className="flex items-center gap-4">
              <button onClick={() => sharedInvoice ? onBack() : setIsFinalized(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-90">
                <ArrowLeft size={20} />
              </button>
              <div><h4 className="text-sm font-black text-slate-900">مراجعة الفاتورة</h4></div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleShare} disabled={isSaving} className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center active:scale-90 border border-emerald-100 disabled:opacity-50">
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
              </button>
              <button onClick={handlePrint} className="px-6 h-11 rounded-full bg-blue-600 text-white text-sm font-black flex items-center gap-2 shadow-lg active:scale-95">
                <Printer size={18} /> طباعة PDF
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isFinalized && !sharedInvoice && (
        <div className="max-w-4xl mx-auto print:hidden">
          <div className="flex items-center justify-between mb-8 pt-4">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="w-11 h-11 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-white/10 active:scale-90">
                <ChevronRight size={24} />
              </button>
              <div><h1 className="text-2xl font-black text-slate-900 dark:text-white">منشئ الفواتير</h1></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsScanning(true)} className="w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-xl flex items-center justify-center active:scale-95">
                <Scan size={24} />
              </button>
            </div>
          </div>
          <div className="mb-6 bg-white dark:bg-zinc-900 p-5 rounded-[32px] border border-slate-200 dark:border-white/10 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400"><Package size={24} /></div>
            <div className="flex-1">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block text-right">اسم المؤسسة الصيدلانية</label>
              <input type="text" value={pharmacyName} onChange={e => setPharmacyName(e.target.value)} className="w-full bg-transparent font-black text-lg text-slate-800 dark:text-white outline-none text-right" />
            </div>
          </div>
          <div className="mb-8 relative">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="ابحث عن دواء بالاسم..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-[28px] py-5 pr-14 pl-6 text-[16px] font-bold shadow-sm outline-none text-right" />
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute z-[110] left-0 right-0 mt-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-[32px] shadow-2xl overflow-hidden max-h-80 overflow-y-auto no-scrollbar">
                  {searchResults.map(drug => (
                    <button key={drug.drug_no} onClick={() => addItem(drug)} className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 border-b border-slate-100 text-right">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="text-[15px] font-black text-slate-900 truncate">{drug.name_en}</div>
                        <div className="text-[12px] font-bold text-slate-400 truncate">{drug.name_ar}</div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><Plus size={20} /></div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <div id="print-area" className={`max-w-4xl mx-auto ${isFinalized || sharedInvoice ? 'mt-20' : ''}`}>
        <div className="bg-white dark:bg-zinc-900 print:bg-white print:text-black rounded-[48px] print:rounded-none p-8 sm:p-20 shadow-2xl print:shadow-none border border-slate-100 dark:border-white/10 invoice-document transition-all duration-500">
          <div className="flex flex-col items-center mb-16 text-center border-b-4 border-slate-900 print:border-black pb-12">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mb-8 print:hidden shadow-2xl"><FileText size={40} /></div>
            <h1 className="text-4xl font-black text-slate-900 mb-2" dir="rtl">{pharmacyName}</h1>
            <div className="text-[12px] font-black text-blue-600 uppercase tracking-[0.4em]">Official Pricing Document</div>
            <div className="flex justify-between w-full text-[11px] font-black text-slate-400 mt-10">
              <div className="text-right flex flex-col items-start gap-1">
                <span dir="rtl">تاريخ الإصدار: {currentTime.toLocaleDateString('ar-EG')}</span>
                <span dir="rtl">رقم المرجع: {sharedInvoice ? sharedInvoice.id : `INV-${Date.now().toString().slice(-6)}`}</span>
              </div>
              <div className="text-left flex flex-col items-end gap-1"><span>نظام Pharma Core</span><span>نسخة رقم: 3.1.2</span></div>
            </div>
          </div>
          <div className="min-h-[450px] mb-12 overflow-x-auto print:overflow-visible">
            <table className="w-full border-collapse" dir="rtl">
              <thead><tr className="border-b-2 border-slate-900 text-[12px] font-black uppercase text-slate-900"><th className="pb-5 text-right pr-4">الصنف / Medication Name</th><th className="pb-5 text-center px-4">الكمية</th><th className="pb-5 text-center px-4">السعر</th><th className="pb-5 text-left pl-4">الإجمالي</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr><td colSpan={4} className="py-20 text-center text-slate-300 font-black uppercase tracking-widest">No Items Added Yet</td></tr>
                ) : items.map(item => (
                  <tr key={item.id} className="group transition-colors hover:bg-slate-50/50">
                    <td className="py-8 pr-4">
                      <div className="text-[16px] font-black text-slate-900 leading-tight mb-1" dir="rtl">{item.name}</div>
                      {item.name_ar && <div className="text-[13px] font-bold text-slate-400" dir="rtl">{item.name_ar}</div>}
                      {!isFinalized && !sharedInvoice && (
                        <button onClick={() => removeItem(item.id)} className="print:hidden text-rose-500 text-[10px] font-black mt-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={14} /> مسح الصنف
                        </button>
                      )}
                    </td>
                    <td className="py-8 text-center px-4">
                      <div className="flex items-center justify-center gap-4 print:hidden">
                        {!isFinalized && !sharedInvoice ? (
                          <>
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 active:scale-90">-</button>
                            <span className="text-[16px] font-black min-w-[20px]">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 active:scale-90">+</button>
                          </>
                        ) : (
                          <span className="text-[16px] font-black">{item.quantity}</span>
                        )}
                      </div>
                      <span className="hidden print:inline text-[16px] font-black">{item.quantity}</span>
                    </td>
                    <td className="py-8 text-center px-4 text-[15px] font-bold text-slate-500">{item.unitPrice.toFixed(2)}</td>
                    <td className="py-8 text-left pl-4 text-[18px] font-black text-slate-900">{(item.unitPrice * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pt-12 border-t-2 border-slate-900">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-24 gap-12">
              <div className="bg-slate-50 p-10 rounded-[48px] border border-slate-100 min-w-[300px] shadow-sm">
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Grand Total (Tax Included)</div>
                <div className="flex items-baseline gap-2"><span className="text-6xl font-black text-slate-900 tracking-tighter">{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span><span className="text-[16px] font-black text-blue-600">EGP</span></div>
                <div className="mt-6 text-[10px] font-black text-slate-400 pt-4 border-t border-slate-200/60 w-full text-right uppercase tracking-[0.2em]">Total quantity of {items.reduce((s,i)=>s+i.quantity, 0)} units</div>
              </div>
              <div className="px-6 text-right">
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Official Verification</div>
                <div className="w-56 h-36 border-4 border-dotted border-slate-200 rounded-[40px] flex items-center justify-center bg-slate-50/20"><div className="text-[10px] font-black text-slate-200 uppercase rotate-[-12deg] tracking-tighter">Stamp & Sign Here</div></div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-16" dir="rtl">
              <div className="flex-1 border-b-2 border-slate-900 pb-5"><span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2" dir="rtl">Prepared By / توقيع الصيدلي</span></div>
              <div className="flex-1 text-left flex flex-col justify-end text-[10px] font-bold text-slate-400 uppercase leading-loose tracking-widest opacity-50">System Reference: PC-X312-EGP<br/>Pharma Core Security Protocol Active<br/>Live Cloud Database Sync</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 15mm; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { background: white !important; color: black !important; width: 100%; margin: 0; padding: 0; visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
          .invoice-document { box-shadow: none !important; border: none !important; padding: 0 !important; width: 100% !important; max-width: none !important; }
          h1, h2, h3, div, span, td, th { direction: rtl !important; unicode-bidi: bidi-override !important; text-align: right !important; }
          th { text-align: center !important; }
          td:first-child, th:first-child { text-align: right !important; }
          td:last-child, th:last-child { text-align: left !important; }
        }
      `}</style>

      {!isFinalized && !sharedInvoice && items.length > 0 && (
         <div className="fixed bottom-32 left-0 right-0 z-[100] px-8 print:hidden">
            <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="max-w-md mx-auto bg-blue-600 rounded-[32px] p-6 shadow-2xl shadow-blue-500/40 text-white flex items-center justify-between">
               <div><div className="text-[10px] font-black text-blue-100 uppercase tracking-widest opacity-70">إجمالي الفاتورة</div><div className="text-2xl font-black">{totalAmount.toFixed(2)} <span className="text-sm font-medium">ج.م</span></div></div>
               <button onClick={() => setIsFinalized(true)} className="px-8 py-3 bg-white text-blue-600 rounded-2xl font-black text-sm active:scale-90 transition-all">معاينة الفاتورة</button>
            </motion.div>
         </div>
      )}
    </div>
  );
};