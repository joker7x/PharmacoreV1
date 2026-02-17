
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, CheckCircle2, XCircle, BrainCircuit, Loader2, ArrowRight, Coins, Lock, Play, Video, ChevronLeft, BookOpen, Clock, AlertTriangle } from 'lucide-react';
import { generateMedicalQuestion } from '../services/ai.ts';
import { QuizQuestion, AcademyVideo, AdminConfig } from '../types.ts';

interface PharmaQuizProps {
  onAddPoints: (points: number) => void;
  currentPoints: number;
  config: AdminConfig;
}

export const PharmaQuiz: React.FC<PharmaQuizProps> = ({ onAddPoints, currentPoints, config }) => {
  const MDiv = motion.div as any;
  const [activeTab, setActiveTab] = useState<'lessons' | 'quiz'>('lessons');
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Simulated Academy Videos
  const [videos, setVideos] = useState<AcademyVideo[]>([
    { id: '1', title: 'أساسيات الصرف الدوائي', description: 'تعلم القواعد الذهبية لصرف الأدوية للمرضى.', duration: '12:45', points: config.pointsPerVideo, isCompleted: false, url: '#' },
    { id: '2', title: 'التفاعلات الدوائية الخطرة', description: 'أهم 10 تداخلات دوائية يجب الحذر منها في الصيدلية.', duration: '18:20', points: config.pointsPerVideo, isCompleted: false, url: '#' },
    { id: '3', title: 'إدارة المخزون الذكية', description: 'كيفية تقليل الفاقد وزيادة الربحية في صيدليتك.', duration: '09:15', points: config.pointsPerVideo, isCompleted: false, url: '#' },
  ]);

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
    if (activeTab === 'quiz' && !question) loadQuestion();
  }, [activeTab]);

  const handleAnswer = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    const correct = index === question?.correctAnswerIndex;
    setIsCorrect(correct);
    setShowExplanation(true);
    if (correct && question) onAddPoints(question.points);
  };

  const completeVideo = (id: string) => {
    setVideos(prev => prev.map(v => {
      if (v.id === id && !v.isCompleted) {
        onAddPoints(v.points);
        return { ...v, isCompleted: true };
      }
      return v;
    }));
  };

  return (
    <div className="pt-8 px-6 pb-20 max-w-lg mx-auto w-full">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
            <Trophy size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">أكاديمية كور</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ارتقِ بمستواك واجمع المكافآت</p>
          </div>
        </div>
        <div className="premium-card px-4 py-2 rounded-2xl flex items-center gap-2 border border-slate-100">
           <Coins size={16} className="text-amber-500" />
           <span className="text-lg font-black text-slate-900">{currentPoints}</span>
        </div>
      </header>

      <div className="flex bg-slate-100 rounded-2xl p-1 mb-8">
        <button onClick={() => setActiveTab('lessons')} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'lessons' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>
          <Video size={16} /> الدروس المصورة
        </button>
        <button onClick={() => setActiveTab('quiz')} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'quiz' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>
          <BrainCircuit size={16} /> التحدي الذكي
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'lessons' ? (
          <MDiv key="lessons" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            {videos.map((vid) => (
              <div key={vid.id} className="premium-card p-5 rounded-[32px] group">
                <div className="aspect-video bg-slate-100 rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center">
                  <Play size={40} className="text-blue-600 opacity-20 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-1">
                    <Clock size={10} /> {vid.duration}
                  </div>
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-black text-slate-900 mb-1">{vid.title}</h3>
                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed mb-4">{vid.description}</p>
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-50 px-3 py-1 rounded-full text-[10px] font-black text-amber-600 flex items-center gap-1 border border-amber-100">
                        <Coins size={10} /> +{vid.points} نقطة
                      </div>
                      {vid.isCompleted && <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12} /> مكتمل</span>}
                    </div>
                  </div>
                  <button onClick={() => completeVideo(vid.id)} className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all ${vid.isCompleted ? 'bg-slate-50 text-slate-300' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'}`}>
                    {vid.isCompleted ? 'تمت المشاهدة' : 'مشاهدة الآن'}
                  </button>
                </div>
              </div>
            ))}
          </MDiv>
        ) : (
          <MDiv key="quiz" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {loading ? (
              <div className="py-20 flex flex-col items-center">
                 <BrainCircuit className="text-blue-600 animate-bounce mb-6" size={64} />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">توليد تحدي جديد...</p>
              </div>
            ) : (
              <div className="premium-card p-8 rounded-[40px] border border-slate-100 shadow-xl">
                 <div className="flex items-center gap-2 mb-6">
                   <span className="px-3 py-1 rounded-full bg-blue-50 text-[10px] font-black text-blue-600 border border-blue-100 uppercase tracking-widest">Medical Intelligence</span>
                   <span className="px-3 py-1 rounded-full bg-amber-50 text-[10px] font-black text-amber-600 border border-amber-100">+{question?.points} نقطة</span>
                 </div>
                 <h2 className="text-lg font-black text-slate-900 leading-relaxed mb-8">{question?.question}</h2>
                 <div className="grid gap-3">
                    {question?.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={selectedOption !== null}
                        className={`w-full p-5 rounded-2xl border text-right transition-all duration-300 flex items-center justify-between ${
                          selectedOption === idx 
                            ? (isCorrect ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-rose-50 border-rose-500 text-rose-700') 
                            : 'bg-slate-50 border-slate-100 text-slate-700 hover:border-blue-300'
                        }`}
                      >
                        <span className="font-bold">{option}</span>
                        {selectedOption === idx && (isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />)}
                      </button>
                    ))}
                 </div>
                 <AnimatePresence>
                   {showExplanation && (
                     <MDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-4">
                        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center gap-2 mb-2 text-[10px] font-black text-blue-600 uppercase tracking-widest"><BookOpen size={14} /> التفسير العلمي</div>
                          <p className="text-[13px] font-medium text-slate-600 leading-relaxed">{question?.explanation}</p>
                        </div>
                        <button onClick={loadQuestion} className="w-full py-5 bg-blue-600 text-white rounded-[22px] font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                          التحدي التالي <ArrowRight size={18} />
                        </button>
                     </MDiv>
                   )}
                 </AnimatePresence>
              </div>
            )}
          </MDiv>
        )}
      </AnimatePresence>

      <div className="mt-12 bg-blue-600 p-8 rounded-[40px] text-white relative overflow-hidden shadow-2xl shadow-blue-500/30">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 blur-3xl -ml-16 -mt-16" />
        <div className="relative z-10 flex items-center justify-between">
           <div>
              <h3 className="font-black text-lg mb-1">صيدلية المستقبل</h3>
              <p className="text-blue-100/70 text-[10px] font-bold">استبدل نقاطك بأدوات ذكية متطورة</p>
           </div>
           <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white/50 border border-white/20">
              <Lock size={20} />
           </div>
        </div>
      </div>
    </div>
  );
};
