import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Award, CheckCircle2, MapPin, Briefcase, GraduationCap, Sparkles, MessageSquare } from 'lucide-react';
import { CommunityUser } from '../types.ts';

interface UserProfileViewProps {
  user: CommunityUser;
  onBack: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ user, onBack }) => {
  const getLevelColor = (level: string) => {
    switch(level) {
      case 'diamond': return 'from-cyan-400 to-blue-600';
      case 'gold': return 'from-yellow-400 to-amber-600';
      case 'silver': return 'from-slate-300 to-slate-500';
      case 'bronze': return 'from-orange-400 to-orange-600';
      default: return 'from-slate-400 to-slate-500';
    }
  };

  return (
    <div className="pt-14 px-4 pb-32 min-h-screen bg-slate-50 dark:bg-slate-950" dir="rtl">
      <header className="flex items-center justify-between mb-8 pt-4 px-2">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-lg font-black text-slate-900 dark:text-white">الملف الشخصي</h1>
        <div className="w-10" />
      </header>

      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 mb-6 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${getLevelColor(user.level)} p-[3px] mb-4`}>
          <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center overflow-hidden">
            <span className="text-3xl font-black text-slate-400">{user.name?.charAt(0) || '?'}</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">{user.name}</h2>
          {user.isVerified && <CheckCircle2 size={18} className="text-blue-500" />}
        </div>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4">{user.title || 'صيدلي'}</p>
        
        <div className="flex items-center justify-center gap-6 text-slate-600 dark:text-slate-300 text-sm font-bold">
          <div className="flex items-center gap-1.5"><MapPin size={16} /> {user.location || 'غير محدد'}</div>
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400"><Award size={16} /> {user.points} نقطة</div>
        </div>
      </div>

      {/* Bio */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 mb-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">نبذة</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{user.bio || 'لا توجد نبذة متاحة.'}</p>
      </div>

      {/* Experience & Education */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Briefcase size={18} /> الخبرة</h3>
          {user.experience && user.experience.length > 0 ? (
            <div className="space-y-4">
              {user.experience.map(exp => (
                <div key={exp.id}>
                  <div className="font-black text-sm text-slate-900 dark:text-white">{exp.title}</div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{exp.company} • {exp.duration}</div>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-slate-400">لا توجد خبرة مضافة.</p>}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2"><GraduationCap size={18} /> التعليم</h3>
          {user.education && user.education.length > 0 ? (
            <div className="space-y-4">
              {user.education.map(edu => (
                <div key={edu.id}>
                  <div className="font-black text-sm text-slate-900 dark:text-white">{edu.degree}</div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{edu.institution} • {edu.year}</div>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-slate-400">لا يوجد تعليم مضاف.</p>}
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 mt-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Sparkles size={18} /> المهارات</h3>
        <div className="flex flex-wrap gap-2">
          {user.skills && user.skills.length > 0 ? user.skills.map(skill => (
            <span key={skill} className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-black">{skill}</span>
          )) : <p className="text-xs text-slate-400">لا توجد مهارات مضافة.</p>}
        </div>
      </div>

      {/* Contact Button */}
      <button className="w-full mt-6 py-4 rounded-[28px] bg-blue-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
        <MessageSquare size={18} /> تواصل مع الصيدلي
      </button>
    </div>
  );
};
