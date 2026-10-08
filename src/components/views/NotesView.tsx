import React, { useState } from 'react';
import { 
  FileText, 
  Lock, 
  Save, 
  Check, 
  BookOpen, 
  ShieldCheck,
  Plus
} from 'lucide-react';
import { dbService } from '../../database/dbService';
import { Note } from '../../types/database';
import { AppSection } from '../../types/navigation';

interface NotesViewProps {
  onNavigate: (section: AppSection) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({ onNavigate }) => {
  const notes = dbService.getNotes();
  const verse = dbService.getTodaysVerse().verse;

  const initialNote = notes[0] || {
    id: 'note-1',
    user_id: 'demo-user-member',
    verse_id: verse.id,
    personal_reflection: '',
    prayer: '',
    application: '',
    important_thoughts: '',
    is_private: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const [currentNote, setCurrentNote] = useState<Note>(initialNote);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    dbService.saveNote(currentNote);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-900 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Spiritual Reflections
                </span>
                <span className="text-xs font-mono text-slate-400">• Section 21</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Personal Scripture Notes & Prayers
              </h2>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Strictly Private to Member</span>
          </div>
        </div>

        <p className="text-xs text-slate-600">
          Capture personal reflections, prayers, and life applications for each memorized verse. Stored encrypted and locally on your device.
        </p>
      </div>

      {/* Selected Verse Context */}
      <div className="bg-amber-50/70 rounded-2xl border border-amber-200 p-4 sm:p-5 flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-900 uppercase">
            Active Verse Note:
          </span>
          <h3 className="font-extrabold text-base text-slate-900 mt-0.5">
            {verse.reference} — {verse.book_name_urdu} ۴:۱۳
          </h3>
          <p className="font-urdu text-sm text-slate-800 mt-1">
            {verse.original_text}
          </p>
        </div>

        <button
          onClick={() => onNavigate('todays-verse')}
          className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-[#0B2545] hover:bg-amber-100 transition-colors flex-shrink-0"
        >
          View Verse
        </button>
      </div>

      {/* Form Fields: Reflection, Prayer, Application, Thoughts */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
        
        {/* Field 1: Personal Reflection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
            <span>Personal Spiritual Reflection</span>
            <span className="text-[11px] text-slate-400 font-normal">What is the Holy Spirit revealing?</span>
          </label>
          <textarea
            rows={3}
            value={currentNote.personal_reflection}
            onChange={(e) => setCurrentNote({ ...currentNote, personal_reflection: e.target.value })}
            placeholder="Write how this verse speaks to your heart and life in Dubai..."
            className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#0B2545] transition-colors"
          />
        </div>

        {/* Field 2: Personal Prayer */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
            <span>Personal Prayer (شخصی دعا)</span>
            <span className="text-[11px] text-slate-400 font-normal">Urdu or English prayer</span>
          </label>
          <textarea
            rows={3}
            value={currentNote.prayer}
            onChange={(e) => setCurrentNote({ ...currentNote, prayer: e.target.value })}
            placeholder="Write your heartfelt prayer to Jesus Christ based on this Scripture..."
            className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#0B2545] transition-colors font-urdu text-right"
          />
        </div>

        {/* Field 3: Practical Application */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
            <span>Practical Life Application</span>
            <span className="text-[11px] text-slate-400 font-normal">How will you live this Word today?</span>
          </label>
          <textarea
            rows={2}
            value={currentNote.application}
            onChange={(e) => setCurrentNote({ ...currentNote, application: e.target.value })}
            placeholder="Specific actionable obedience: in your workplace, family, or church..."
            className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#0B2545] transition-colors"
          />
        </div>

        {/* Field 4: Important Thoughts */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
            <span>Important Insights & Greek/Urdu Word Study</span>
            <span className="text-[11px] text-slate-400 font-normal">Definitions, sermon notes</span>
          </label>
          <input
            type="text"
            value={currentNote.important_thoughts}
            onChange={(e) => setCurrentNote({ ...currentNote, important_thoughts: e.target.value })}
            placeholder="e.g. Urdu word 'taqat' signifies supernatural Christ-enabling..."
            className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#0B2545] transition-colors"
          />
        </div>

        {/* Save Bar */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted local database storage</span>
          </div>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#133E87] text-white text-xs font-bold shadow-xs transition-all"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4 text-amber-400" />}
            <span>{savedSuccess ? 'Saved Locally!' : 'Save Reflection'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
