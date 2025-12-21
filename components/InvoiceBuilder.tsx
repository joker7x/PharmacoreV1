
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, Printer, Calculator, Edit3, Package, FileText, Scan, X, CheckCircle2, ChevronRight, Share2, Loader2, Copy, Check, Download } from 'lucide-react';
import { Drug, InvoiceItem } from '../types';
import { searchDrugs, lookupByBarcode, saveInvoice } from '../services/supabase.ts';
import { Html5QrcodeScanner } from 'html5-qrcode';

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
  const [isCopied, setIsCopied] = useState(false);
  
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPrice, setManualPrice] = useState('');

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isScanning) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scannerRef.current.render(
        async (decodedText) => {
          setIsScanning(false);
          scannerRef.current?.clear();
          
          setIsSearching(true);
          const drug = await lookupByBarcode(decodedText);
          if (drug) {
            addItem(drug);
          } else {
            alert(`لم يتم العثور على صنف بالباركود: ${decodedText}`);
          }
          setIsSearching(false);
        },
        () => {}
      );
    } else {
      scannerRef.current?.clear();
    }

    return () => {
      scannerRef.current?.clear();
    };
  }, [isScanning]);

  const handleSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchDrugs(q);
      setSearchResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, handleSearch]);

  const addItem = (drug: Drug) => {
    const packPrice = Number(drug.price_new || 0);
    const packSize = Number(drug.pack_size || 1);
    const unitPrice = packPrice / packSize;
    
    const id = `db-${drug.drug_no}-${Date.now()}`;
    const newItem: InvoiceItem = {
      id,
      drug_no: drug.drug_no,
      name: drug.name_en,
      name_ar: drug.name_ar,
      unitPrice: unitPrice,
      quantity: 1, 
      packPrice: packPrice,
      packSize: packSize
    };
    
    setItems([...items, newItem]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(items.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  const handlePrint = () => {
    if (items.length === 0) return;
    setIsFinalized(true);
    // ننتظر قليلاً للتأكد من تحديث الواجهة قبل طلب الطباعة لضمان التقاط التصميم الجديد
    setTimeout(() => {
      window.print();
    }, 700);
  };

  const handleShare = async () => {
    if (items.length === 0) return;
    
    setIsSaving(true);
    const invoiceData = {
      items,
      pharmacyName,
      total: totalAmount,
      date: new Date().toISOString()
    };

    const invoiceId = await saveInvoice(invoiceData);
    setIsSaving(false);

    if (!invoiceId) {
      alert("فشل في حفظ الفاتورة السحابية، يرجى المحاولة لاحقاً");
      return;
    }

    const botLink = `https://t.me/i23Bot?start=inv_${invoiceId}`;
    const itemsSummary = items.map(i => `• ${i.name}: ${i.quantity} x ${i.unitPrice.toFixed(2)}`).join('\n');
    const shareText = `📄 فاتورة تقديرية - ${pharmacyName}\n\n${itemsSummary}\n\n💰 الإجمالي: ${totalAmount.toFixed(2)} ج.م\n\n✨ تم الإنشاء عبر Pharma Core\n🔗 اضغط هنا لعرض الفاتورة كاملة داخل التطبيق:\n${botLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `فاتورة من ${pharmacyName}`,
          text: shareText,
          url: botLink
        });
      } catch (err) {
        console.error("Share failed:", err);
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      alert("فشل في نسخ البيانات");
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#09090b] pt-14 pb-48 px-4 sm:px-6 rtl overflow-x-hidden ${isFinalized ? 'finalized-view' : ''}`} dir="rtl">
      
      {/* Scanning Modal */}
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6"
          >
            <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[40px] overflow-hidden p-6 relative">
              <button 
                onClick={() => setIsScanning(false)}
                className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white"
              >
                <X size={20} />
              </button>
              <div className="text-center mb-6">
                <Scan size={32} className="mx-auto text-blue-500 mb-2" />
                <h3 className="text-white font-black">امسح الباركود</h3>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Scanning in progress...</p>
              </div>
              <div id="reader" className="w-full rounded-2xl overflow-hidden"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Header (Hidden on Print & Finalized) */}
      <div className={`max-w-4xl mx-auto print:hidden ${isFinalized ? 'hidden' : ''}`}>
        <div className="flex items-center justify-between mb-8 pt-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-white/10 active:scale-90 transition-transform">
              <ChevronRight size={20} />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">منشئ الفواتير</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">A4 Mobile Friendly Creator</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsScanning(true)}
              className="w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg active:scale-95 transition-transform flex items-center justify-center"
            >
              <Scan size={20} />
            </button>
            <button 
              onClick={() => { setManualName(''); setManualPrice(''); setShowManualForm(!showManualForm); }}
              className="w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-indigo-500 active:scale-95 transition-transform"
            >
              <Edit3 size={20} />
            </button>
          </div>
        </div>

        {/* Manual Input Form */}
        <AnimatePresence>
          {showManualForm && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-[32px] border border-slate-200 dark:border-white/10 shadow-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase mr-2 text-right">اسم الصنف</label>
                  <input type="text" value={manualName} onChange={e => setManualName(e.target.value)} placeholder="مثلاً: بانادول 500 مجم" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3 px-4 font-bold text-sm outline-none text-right" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase mr-2 text-right">سعر الوحدة</label>
                  <input type="number" value={manualPrice} onChange={e => setManualPrice(e.target.value)} placeholder="0.00" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3 px-4 font-bold text-sm outline-none text-right" />
                </div>
              </div>
              <button 
                onClick={() => {
                   if(!manualName || !manualPrice) return;
                   const id = `manual-${Date.now()}`;
                   const item: InvoiceItem = { id, name: manualName, unitPrice: parseFloat(manualPrice), quantity: 1, packPrice: parseFloat(manualPrice), packSize: 1 };
                   setItems([...items, item]);
                   setShowManualForm(false);
                }}
                className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl"
              >
                إضافة للفاتورة
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-6 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-slate-200 dark:border-white/10 flex items-center gap-4 shadow-sm">
           <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
             <Package size={20} />
           </div>
           <div className="flex-1">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block text-right">اسم الصيدلية</label>
              <input 
                type="text" 
                value={pharmacyName} 
                onChange={e => setPharmacyName(e.target.value)}
                className="w-full bg-transparent font-black text-slate-800 dark:text-white outline-none text-right"
              />
           </div>
        </div>

        <div className="mb-8 relative">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="ابحث عن دواء لإضافته..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-3xl py-4.5 pr-12 pl-6 text-sm font-bold shadow-sm outline-none text-right placeholder:text-slate-400"
            />
          </div>

          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-[110] left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
                {searchResults.map(drug => (
                  <button key={drug.drug_no} onClick={() => addItem(drug)} className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 border-b border-slate-100 last:border-0 text-right group">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="text-[14px] font-black text-slate-900 dark:text-white truncate">{drug.name_en}</div>
                      <div className="text-[11px] font-bold text-slate-500 truncate">{drug.name_ar}</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-active:scale-90 transition-transform mr-4">
                      <Plus size={18} />
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Action Bar - Finalized Mode */}
      <AnimatePresence>
        {isFinalized && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed top-0 left-0 right-0 z-[160] bg-white/95 backdrop-blur-md border-b border-slate-200 p-4 flex items-center justify-between px-6 print:hidden shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900">{sharedInvoice ? 'معاينة فاتورة سحابية' : 'جاهز للطباعة'}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{sharedInvoice ? `ID: ${sharedInvoice.id}` : 'A4 Professional Format'}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {!sharedInvoice && (
                <button 
                  onClick={handleShare}
                  disabled={isSaving}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCopied ? 'bg-emerald-500 text-white' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600'} active:scale-90 shadow-sm disabled:opacity-50`}
                  title="مشاركة الفاتورة"
                >
                  {isSaving ? <Loader2 size={20} className="animate-spin" /> : isCopied ? <Check size={20} /> : <Share2 size={20} />}
                </button>
              )}
              <button onClick={handlePrint} className="px-6 h-12 rounded-full bg-blue-600 text-white text-sm font-black flex items-center gap-2 shadow-xl shadow-blue-500/30">
                <Printer size={18} /> طباعة
              </button>
              <button onClick={() => sharedInvoice ? onBack() : setIsFinalized(false)} className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 active:scale-90">
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INVOICE CONTENT */}
      <div id="print-area" className={`max-w-4xl mx-auto print:max-w-none print:m-0 ${isFinalized ? 'mt-24' : ''}`}>
        <div className="bg-white dark:bg-zinc-900 print:bg-white print:text-black rounded-[40px] print:rounded-none p-8 sm:p-16 shadow-2xl print:shadow-none border border-slate-100 dark:border-white/10 invoice-document relative">
          
          <div className="flex flex-col items-center mb-12 text-center border-b-2 border-slate-900 print:border-black pb-8">
             <h1 className="text-3xl font-black text-slate-900 print:text-black mb-1 pharmacy-title-main" dir="rtl">{pharmacyName}</h1>
             <div className="text-[10px] font-black text-blue-600 print:text-black uppercase tracking-[0.3em] mb-6">Estimative Pharmacy Invoice</div>
             
             <div className="flex justify-between w-full text-[10px] font-bold text-slate-500 print:text-black mt-2">
                <div className="text-right flex flex-col items-start">
                   <span dir="rtl">التاريخ: {currentTime.toLocaleDateString('ar-EG')}</span>
                   <span dir="rtl">رقم الفاتورة: {sharedInvoice ? sharedInvoice.id : `#${Date.now().toString().slice(-6)}`}</span>
                </div>
                <div className="text-left flex flex-col items-end">
                   <span>نظام Pharma Core Cloud</span>
                   <span>Doc Ref: PC-{sharedInvoice ? sharedInvoice.id : Date.now().toString().slice(-4)}</span>
                </div>
             </div>
          </div>

          <div className="min-h-[350px] mb-8 overflow-x-auto print:overflow-visible">
            {items.length === 0 ? (
              <div className="py-20 text-center print:hidden">
                <Calculator className="mx-auto text-slate-100 dark:text-zinc-800 mb-6" size={64} />
                <p className="font-bold text-slate-300 dark:text-zinc-700 uppercase tracking-widest">الفاتورة فارغة</p>
              </div>
            ) : (
              <table className="w-full border-collapse invoice-table" dir="rtl">
                <thead>
                  <tr className="border-b-2 border-slate-900 print:border-black text-[11px] font-black uppercase text-slate-900 print:text-black">
                    <th className="pb-4 text-right pr-2">الصنف / Item Description</th>
                    <th className="pb-4 text-center">الكمية</th>
                    <th className="pb-4 text-center">السعر</th>
                    <th className="pb-4 text-left pl-2">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                  {items.map(item => (
                    <tr key={item.id} className="invoice-row group">
                      <td className="py-6 pr-2">
                        <div className="text-[14px] font-black text-slate-900 print:text-black leading-tight mb-1" dir="rtl">{item.name}</div>
                        {item.name_ar && <div className="text-[11px] font-bold text-slate-500 print:text-slate-600 arabic-text" dir="rtl">{item.name_ar}</div>}
                        {!isFinalized && !sharedInvoice && (
                          <button onClick={() => removeItem(item.id)} className="print:hidden text-rose-500 text-[10px] font-bold flex items-center gap-1 mt-2 hover:underline">
                            <Trash2 size={12} /> حذف
                          </button>
                        )}
                      </td>
                      <td className="py-6 text-center">
                        <div className="flex items-center justify-center gap-3 print:hidden">
                          {!isFinalized && !sharedInvoice ? (
                            <>
                              <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold active:scale-90">-</button>
                              <span className="text-[13px] font-black w-4">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold active:scale-90">+</button>
                            </>
                          ) : (
                            <span className="text-[14px] font-black">{item.quantity}</span>
                          )}
                        </div>
                        <span className="hidden print:inline text-[14px] font-black">{item.quantity}</span>
                      </td>
                      <td className="py-6 text-center text-[13px] font-bold text-slate-600 print:text-black">
                        {item.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-6 text-left pl-2 text-[14px] font-black text-slate-900 print:text-black">
                        {(item.unitPrice * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="pt-8 border-t-2 border-slate-900 print:border-black footer-area">
             <div className="flex flex-col sm:flex-row justify-between items-start mb-16 gap-8">
                <div className="total-display text-right flex flex-col items-start order-2 sm:order-1">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount Due</div>
                   <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-slate-900 print:text-black tracking-tighter">
                        {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-[12px] font-black text-slate-400 print:text-black">EGP</span>
                   </div>
                   <div className="mt-2 text-[9px] font-bold text-slate-400 print:text-black pt-2 border-t border-slate-100 w-full text-right uppercase tracking-widest">
                      {items.length} Items Listed
                   </div>
                </div>

                <div className="stamp-box text-right order-1 sm:order-2">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Verification Stamp</div>
                   <div className="w-44 h-28 border-2 border-dashed border-slate-200 print:border-slate-400 rounded-3xl flex items-center justify-center">
                      <span className="text-[8px] font-black text-slate-200 uppercase tracking-tighter print:hidden">Pharmacy Official Stamp Area</span>
                   </div>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-12 sm:gap-16 mb-12" dir="rtl">
                <div className="flex-1 border-b-2 border-slate-900 print:border-black pb-3 signature-line">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2" dir="rtl">Authorized Signature / توقيع المسؤول</span>
                </div>
                <div className="flex-1 text-left flex flex-col justify-end text-[8px] font-bold text-slate-500 uppercase leading-relaxed tracking-wider disclaimer">
                   * This document is an estimative guidance for reference only.<br/>
                   * Official pharmaceutical prices follow standard indices.<br/>
                   * Generated via Pharma Core Cloud System.
                </div>
             </div>

             {!isFinalized && !sharedInvoice && items.length > 0 && (
               <div className="print:hidden pb-12 space-y-4">
                  <button 
                    onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setIsFinalized(true);
                    }}
                    className="w-full py-6 rounded-[32px] bg-slate-900 text-white font-black text-lg shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-4 mt-8"
                  >
                    إتمام الفاتورة وتجهيز الطباعة <CheckCircle2 size={24} />
                  </button>
                  <button 
                    onClick={handleShare}
                    disabled={isSaving}
                    className="w-full py-4 rounded-2xl bg-emerald-50 text-emerald-600 font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all border border-emerald-100 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />} مشاركة رابط الفاتورة السحابية
                  </button>
               </div>
             )}
          </div>
        </div>
      </div>

      <style>{`
        /* 
           تحسينات الطباعة لضمان ظهور النصوص العربية بشكل صحيح (متصل وواضح) 
           وحل مشكلة الحروف غير المفهومة في ملفات PDF الناتجة عن الطباعة
        */
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm; 
          }

          html, body {
            background: #fff !important;
            color: #000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm; 
            height: auto !important;
            direction: rtl !important;
            text-align: right !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: 'Cairo', 'IBM Plex Sans Arabic', 'Arial', sans-serif !important;
          }

          /* Force Arabic Font Embedding fallback for PDF Drivers */
          * {
            font-family: 'Cairo', 'IBM Plex Sans Arabic', 'Arial', sans-serif !important;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            font-feature-settings: "kern" 1, "liga" 1;
            direction: rtl !important;
            unicode-bidi: plaintext !important;
          }

          .invoice-document {
            display: block !important;
            border: none !important;
            padding: 10mm !important; 
            margin: 0 auto !important;
            box-shadow: none !important;
            width: 100% !important;
            background: #fff !important;
            color: #000 !important;
            min-height: 297mm; 
          }

          /* إخفاء عناصر التحكم في التطبيق أثناء الطباعة */
          .print\\:hidden, 
          #root > div > div:last-child, 
          nav, 
          footer, 
          button, 
          input, 
          .lucide,
          .absolute.top-4.left-1\/2 { 
            display: none !important; 
          }

          .pharmacy-title-main {
            font-size: 28pt !important;
            font-weight: 900 !important;
            color: #000 !important;
            margin-bottom: 5mm !important;
            direction: rtl !important;
          }

          .invoice-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 10mm !important;
            direction: rtl !important;
          }

          .invoice-table th {
            border-bottom: 2pt solid #000 !important;
            padding: 3mm !important;
            font-weight: 900 !important;
            font-size: 11pt !important;
            background-color: #f9f9f9 !important;
            color: #000 !important;
            text-align: right !important;
          }

          .invoice-row td {
            border-bottom: 0.5pt solid #eee !important;
            padding: 4mm 2mm !important;
            vertical-align: middle !important;
            color: #000 !important;
            text-align: right !important;
          }

          .arabic-text {
            font-size: 10pt !important;
            font-weight: 700 !important;
            color: #444 !important;
            direction: rtl !important;
            unicode-bidi: plaintext !important;
          }

          .total-display {
            text-align: left !important;
            direction: ltr !important;
            padding: 5mm !important;
          }

          .total-display span {
             color: #000 !important;
          }

          .footer-area {
            margin-top: auto !important;
            border-top: 2pt solid #000 !important;
            padding-top: 5mm !important;
          }

          .signature-line {
            border-bottom: 1.5pt solid #000 !important;
            min-width: 60mm !important;
            text-align: right !important;
          }
          
          /* الحفاظ على الألوان في PDF */
          .text-blue-600 { color: #2563eb !important; }
          .bg-slate-900 { background-color: #000 !important; color: #fff !important; }
        }

        .finalized-view { position: relative; z-index: 10; }
        .invoice-table { table-layout: auto; width: 100%; }
        
        @media (max-width: 640px) {
           .finalized-view { padding-bottom: 50vh !important; }
        }
      `}</style>
    </div>
  );
};
