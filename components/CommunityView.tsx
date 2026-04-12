import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ShieldCheck, AlertTriangle, Pill, Send, MoreHorizontal, Flag, ThumbsUp, MessageCircle, Search, User, Award, CheckCircle2, Filter, X } from 'lucide-react';
import { CommunityPost, CommunityUser } from '../types.ts';

interface CommunityViewProps {
  onBack: () => void;
  onUserClick: (userId: string) => void;
}

// Mock Data
const currentUser: CommunityUser = {
  id: 'u1',
  name: 'د. أحمد محمود',
  isVerified: true,
  level: 'gold',
  points: 1250,
  role: 'pharmacist'
};

const mockPosts: CommunityPost[] = [
  {
    id: 'p1',
    author: {
      id: 'u2',
      name: 'د. سارة خالد',
      isVerified: true,
      level: 'silver',
      points: 850,
      role: 'pharmacist'
    },
    content: 'لاحظت نقص شديد في حقن الكليكسان الأيام دي، هل في حد لقى بديل متوفر في شركات التوزيع؟',
    mentionedDrugs: [{ id: 'd1', name: 'Clexane 40mg' }],
    mentionedActiveIngredients: ['Enoxaparin'],
    likes: 24,
    commentsCount: 8,
    createdAt: 'منذ ساعتين'
  },
  {
    id: 'p2',
    author: {
      id: 'u3',
      name: 'د. محمد علي',
      isVerified: false,
      level: 'bronze',
      points: 120,
      role: 'pharmacist'
    },
    content: 'تحديث بخصوص الأسعار: تم تعديل سعر كونكور 5 ملجم اليوم. يرجى مراجعة السيستم.',
    mentionedDrugs: [{ id: 'd2', name: 'Concor 5mg' }],
    mentionedActiveIngredients: ['Bisoprolol'],
    likes: 45,
    commentsCount: 12,
    createdAt: 'منذ 5 ساعات'
  },
  {
    id: 'p3',
    author: {
      id: 'u4',
      name: 'د. ياسمين طارق',
      isVerified: true,
      level: 'gold',
      points: 2100,
      role: 'pharmacist'
    },
    content: 'يا جماعة، مريض بيسأل عن بديل لكليكسان 40 عشان مش لاقيه، هل ينفع ندي له حاجة تانية نفس المادة الفعالة؟',
    mentionedDrugs: [{ id: 'd1', name: 'Clexane 40mg' }],
    mentionedActiveIngredients: ['Enoxaparin'],
    likes: 15,
    commentsCount: 22,
    createdAt: 'منذ 6 ساعات'
  }
];

export const CommunityView: React.FC<CommunityViewProps> = ({ onBack, onUserClick }) => {
  const [posts, setPosts] = useState<CommunityPost[]>(mockPosts);
  const [newPostContent, setNewPostContent] = useState('');
  const [showReportModal, setShowReportModal] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<{ type: 'drug' | 'api', id: string, name: string } | null>(null);

  const filteredPosts = useMemo(() => {
    if (!activeFilter) return posts;
    return posts.filter(post => {
      if (activeFilter.type === 'drug') {
        return post.mentionedDrugs.some(d => d.id === activeFilter.id);
      }
      if (activeFilter.type === 'api') {
        return post.mentionedActiveIngredients.includes(activeFilter.name);
      }
      return true;
    });
  }, [posts, activeFilter]);

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'diamond': return 'from-cyan-400 to-blue-600';
      case 'gold': return 'from-yellow-400 to-amber-600';
      case 'silver': return 'from-slate-300 to-slate-500';
      case 'bronze': return 'from-orange-400 to-orange-600';
      default: return 'from-slate-400 to-slate-500';
    }
  };

  const handlePost = () => {
    if (!newPostContent.trim()) return;
    
    const newPost: CommunityPost = {
      id: `p${Date.now()}`,
      author: currentUser,
      content: newPostContent,
      mentionedDrugs: [], // In a real app, we'd extract these from the content or a tagging UI
      mentionedActiveIngredients: [],
      likes: 0,
      commentsCount: 0,
      createdAt: 'الآن'
    };
    
    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  return (
    <div className="pt-14 px-4 pb-32 min-h-screen bg-slate-50 dark:bg-slate-950" dir="rtl">
      {/* Header */}
      <header className="flex items-center justify-between mb-6 pt-4 px-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[20px] bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <MessageSquare size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">مجتمع فارما</h1>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">نقاشات الصيادلة</p>
          </div>
        </div>
        
        {/* User Gamification Badge */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-right">
            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500">نقاطك</div>
            <div className="text-sm font-black text-blue-600 dark:text-blue-400 leading-none">{currentUser.points}</div>
          </div>
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getLevelColor(currentUser.level)} p-[2px]`}>
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
              <Award size={14} className="text-slate-800 dark:text-slate-200" />
            </div>
          </div>
        </div>
      </header>

      {/* Create Post */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] p-4 mb-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex gap-3 mb-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getLevelColor(currentUser.level)} p-[2px] shrink-0`}>
            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center overflow-hidden">
              <User size={20} className="text-slate-400" />
            </div>
          </div>
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="شارك معلومة، اسأل عن بديل، أو أبلغ عن نقص..."
            className="w-full bg-transparent resize-none outline-none text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 min-h-[60px]"
          />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/40">
            <Pill size={14} />
            <span>إشارة لدواء</span>
          </button>
          <button 
            onClick={handlePost}
            disabled={!newPostContent.trim()}
            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-all active:scale-95"
          >
            <Send size={18} className="mr-1" />
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        <AnimatePresence>
          {activeFilter && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
              <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
                    عرض المنشورات الخاصة بـ: <span className="font-black">{activeFilter.name}</span>
                  </span>
                </div>
                <button onClick={() => setActiveFilter(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors shadow-sm">
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {filteredPosts.map(post => (
          <div key={post.id} className="bg-white dark:bg-slate-900 rounded-[28px] p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => onUserClick(post.author.id)}>
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${getLevelColor(post.author.level)} p-[2px]`}>
                  <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center overflow-hidden">
                    <User size={20} className="text-slate-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm text-slate-900 dark:text-white">{post.author.name}</span>
                    {post.author.isVerified && <CheckCircle2 size={14} className="text-blue-500" />}
                  </div>
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500">{post.createdAt}</div>
                </div>
              </div>
              <button onClick={() => setShowReportModal(post.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <MoreHorizontal size={18} />
              </button>
            </div>

            {/* Post Content */}
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4 font-medium">
              {post.content}
            </p>

            {/* Tags */}
            {(post.mentionedDrugs.length > 0 || post.mentionedActiveIngredients.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.mentionedDrugs.map(drug => (
                  <button 
                    key={drug.id} 
                    onClick={() => setActiveFilter({ type: 'drug', id: drug.id, name: drug.name })}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[11px] font-black hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                  >
                    <Pill size={12} />
                    {drug.name}
                  </button>
                ))}
                {post.mentionedActiveIngredients.map(api => (
                  <button 
                    key={api} 
                    onClick={() => setActiveFilter({ type: 'api', id: api, name: api })}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-black hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                  >
                    <Search size={12} />
                    {api}
                  </button>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <ThumbsUp size={18} />
                <span className="text-xs font-bold">{post.likes}</span>
              </button>
              <button className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <MessageCircle size={18} />
                <span className="text-xs font-bold">{post.commentsCount}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Smart Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowReportModal(null)}
          >
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6 text-rose-600 dark:text-rose-500">
                <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                  <Flag size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">الإبلاغ عن المحتوى</h3>
              </div>
              
              <div className="space-y-2 mb-6">
                {[
                  'معلومات طبية خاطئة',
                  'تلاعب بأسعار الأدوية',
                  'محتوى غير لائق أو مسيء',
                  'إزعاج (Spam)'
                ].map(reason => (
                  <button key={reason} onClick={() => setShowReportModal(null)} className="w-full text-right p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">
                    {reason}
                  </button>
                ))}
              </div>
              
              <button onClick={() => setShowReportModal(null)} className="w-full py-4 rounded-2xl font-black text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                إلغاء
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
