import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Volume2, 
  Check, 
  ArrowRight, 
  ExternalLink,
  Shield,
  Heart,
  Calendar,
  Share2
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { dbService } from '../../database/dbService';
import { AppSection } from '../../types/navigation';

interface TodaysVerseViewProps {
  onNavigate: (section: AppSection) => void;
  onStartSession: () => void;
}

export const TodaysVerseView: React.FC<TodaysVerseViewProps> = ({
  onNavigate,
  onStartSession,
}) => {
  const { verse, metadata } = dbService.getTodaysVerse();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = `${verse.reference}\n\n${verse.original_text}\n\n"${verse.english_text}"\n\nWord Memory - The Church of Pentecost Dubai`;
    navigator.clipboard?.writeText?.(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSimulateReadAloud = () => {
    setIsPlayingAudio(true);
    // Use Web Speech API if supported in browser environment
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(verse.english_text || '');
        utterance.rate = 0.85;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setIsPlayingAudio(false), 3000);
      }
    } catch {
      setTimeout(() => setIsPlayingAudio(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 text-amber-900 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Daily Scripture Portion
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-amber-700 font-mono">
                [DEMO PREVIEW VERSE]
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {verse.reference} — {verse.book_name_urdu} ۴:۱۳
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status="LEARNING" />
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied' : 'Share Verse'}</span>
          </button>
        </div>
      </div>

      {/* Main Scripture Display Card */}
      <div className="bg-white rounded-2xl border-2 border-amber-300/80 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Urdu Sacred Text Section (WordPocket Bible Source) */}
        <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/30 rounded-2xl p-6 sm:p-8 border border-amber-200">
          <div className="flex items-center justify-between mb-4 border-b border-amber-200/60 pb-2">
            <span className="text-xs font-bold text-amber-900 tracking-wider uppercase font-sans">
              اردو بائبل کا اصل متن (WordPocket Authentic Urdu Text)
            </span>
            <span className="text-[11px] text-amber-800 font-mono">
              Unmodified Source
            </span>
          </div>

          <p className="font-urdu text-2xl sm:text-3xl md:text-4xl text-slate-900 leading-loose sm:leading-loose text-right tracking-normal py-2">
            {verse.original_text}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-amber-200/60 text-xs text-amber-900">
            <span className="font-sans font-medium text-[11px]">
              Source: <a href={verse.source_url} target="_blank" rel="noreferrer" className="underline font-semibold hover:text-amber-950 inline-flex items-center gap-0.5">{verse.source_name} <ExternalLink className="w-2.5 h-2.5" /></a>
            </span>
            <span className="font-urdu font-bold text-sm">
              {verse.book_name_urdu} ۴:۱۳
            </span>
          </div>
        </div>

        {/* English Translation Section */}
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-700">English Translation (NKJV)</span>
            <button
              onClick={handleSimulateReadAloud}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                isPlayingAudio 
                  ? 'bg-amber-500 text-slate-950' 
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-600" />
              <span>{isPlayingAudio ? 'Reading Aloud...' : 'Read Aloud Audio'}</span>
            </button>
          </div>

          <p className="text-slate-900 text-lg sm:text-xl font-serif italic leading-relaxed">
            "{verse.english_text}"
          </p>
          <p className="text-xs text-slate-500 pt-1">
            Philippians 4:13 • Epistle of Paul to the Philippians
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
          <button
            onClick={onStartSession}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0B2545] hover:bg-[#133E87] text-white font-bold text-sm shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Start 9-Step Daily Session</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('memorize')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            >
              <span>Hide Words Practice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('notes')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            >
              <span>Write Reflection</span>
            </button>
          </div>
        </div>

      </div>

      {/* Structured Verse Metadata (Section 11) - Stored separately from Bible text */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Biblical Context & Theological Meaning */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
            <Shield className="w-4 h-4 text-[#0B2545]" />
            <span>Biblical Context & Background</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {metadata.biblical_context}
          </p>
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-900 block mb-1">Doctrinal Explanation:</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {metadata.easy_explanation}
            </p>
          </div>
        </div>

        {/* Practical Application & Spiritual Prayer */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
            <Heart className="w-4 h-4 text-red-600" />
            <span>Daily Living & Dedicated Prayer</span>
          </div>
          
          <div>
            <span className="text-xs font-bold text-slate-900 block mb-1">Practical Life Application:</span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {metadata.practical_application}
            </p>
          </div>

          <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 text-amber-950">
            <span className="text-xs font-bold block mb-1">Spiritual Prayer (دعا):</span>
            <p className="font-urdu text-base text-right leading-loose text-slate-900 mb-1">
              {metadata.prayer.split('(')[0]}
            </p>
            <p className="text-xs text-slate-600 italic">
              ({metadata.prayer.split('(')[1] || ''}
            </p>
          </div>
        </div>

      </div>

      {/* Supporting Scripture References */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Cross-References & Supporting Scriptures
        </span>
        <div className="flex flex-wrap gap-2 pt-1">
          {metadata.supporting_references.map((ref) => (
            <span
              key={ref}
              className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800"
            >
              {ref}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
};
