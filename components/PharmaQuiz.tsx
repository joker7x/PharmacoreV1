
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, CheckCircle2, XCircle, BrainCircuit, Loader2, ArrowRight, Coins, Lock } from 'lucide-react';
import { generateMedicalQuestion } from '../services/ai.ts';
import { QuizQuestion } from '../types.ts';

interface PharmaQuizProps {
  onAddPoints: (points: number) => void;
  currentPoints: number;
}

export const PharmaQuiz: React.FC<PharmaQuizProps> = ({ onAddPoints, currentPoints }) => {
  // Use any to bypass TypeScript errors for motion props
  const MDiv = motion.div as any;
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const loadQuestion = async () => {
    setLoading(true);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowExplanation(false);
    const q = await generateMedicalQuestion();
    setQuestion(q);
    setLoading(false);
  };

  useEffect(() => {
    loadQuestion();
  }, []);

  const handleAnswer = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    const correct = index === question?.correctAnswerIndex;
    setIsCorrect(correct);
    setShowExplanation(true);
    if (correct && question) {
      onAddPoints(question.points);
    }
  };

  return (
    <div className="pt-8 px-2 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
            <Trophy size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black dark:text-white">أكاديمية كور</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">اختبر معلوماتك واجمع النقاط</p>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 px-4 py-2 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-2 shadow-sm">
           <Coins size={18} className="text-amber-500" />
           <span className="text-lg font-black dark:text-white">{currentPoints}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <MDiv key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 flex flex-col items-center">
             <div className="relative mb-6">
                <BrainCircuit className="text-blue-600 animate-pulse" size={64} />
                <Loader2 className="absolute -bottom-2 -right-2 animate-spin text-blue-400" size={24} />
             </div>
             <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">ذكاء Core يجهز سؤالك...</p>
          </MDiv>
        ) : (
          <MDiv key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl" />
               <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-4">
                   <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-[10px] font-black text-blue-600 border border-blue-100 dark:border-blue-500/20">سؤال علمي</span>
                   <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-[10px] font-black text-amber-600 border border-amber-100 dark:border-amber-500/20">+{question?.points} نقطة</span>
                 </div>
                 <h2 className="text-lg font-black text-slate-900 dark:text-white leading-relaxed mb-8">{question?.question}</h2>
                 
                 <div className="grid gap-3">
                    {question?.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={selectedOption !== null}
                        className={`w-full p-5 rounded-2xl border text-right transition-all duration-300 relative overflow-hidden flex items-center justify-between ${
                          selectedOption === idx 
                            ? (isCorrect ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-rose-50 border-rose-500 text-rose-700') 
                            : 'bg-slate-50 dark:bg-zinc-800/50 border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                        }`}
                      >
                        <span className="font-bold relative z-10">{option}</span>
                        {selectedOption === idx && (
                          <MDiv initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative z-10">
                             {isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                          </MDiv>
                        )}
                      </button>
                    ))}
                 </div>
               </div>
            </div>

            <AnimatePresence>
              {showExplanation && (
                <MDiv initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                  <div className={`p-6 rounded-[32px] border ${isCorrect ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' : 'bg-blue-50/50 border-blue-100 text-blue-800'} dark:bg-zinc-900/50 dark:border-white/5`}>
                     <div className="flex items-center gap-2 mb-2 font-black text-xs uppercase tracking-widest">
                       <Sparkles size={16} /> التوضيح العلمي
                     </div>
                     <p className="text-sm font-medium leading-relaxed dark:text-slate-300">{question?.explanation}</p>
                  </div>
                  <button onClick={loadQuestion} className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-sm shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all">
                    السؤال التالي <ArrowRight size={18} />
                  </button>
                </MDiv>
              )}
            </AnimatePresence>
          </MDiv>
        )}
      </AnimatePresence>

      <div className="mt-12 bg-zinc-900/60 p-8 rounded-[40px] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 blur-3xl -ml-16 -mt-16" />
        <div className="relative z-10 flex items-center justify-between">
           <div>
              <h3 className="text-white font-black text-lg mb-1">المتجر (قريباً)</h3>
              <p className="text-zinc-500 text-xs font-bold">استبدل نقاطك بهدايا ومميزات حصرية</p>
           </div>
           <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-600">
              <Lock size={20} />
           </div>
        </div>
      </div>
    </div>
  );
};
