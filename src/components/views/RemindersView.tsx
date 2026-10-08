import React, { useState } from 'react';
import { 
  Bell, 
  Clock, 
  Check, 
  AlertCircle, 
  ShieldCheck,
  Volume2,
  Calendar
} from 'lucide-react';
import { dbService } from '../../database/dbService';
import { AppSection } from '../../types/navigation';

interface RemindersViewProps {
  onNavigate: (section: AppSection) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({ onNavigate }) => {
  const [reminders, setReminders] = useState(() => dbService.getReminders());
  const [testNotice, setTestNotice] = useState<string | null>(null);

  const toggleReminder = (id: string, currentEnabled: boolean) => {
    dbService.updateReminder(id, { enabled: !currentEnabled });
    setReminders(prev => prev.map(r => r.id === id ? { ...r, enabled: !currentEnabled } : r));
  };

  const updateTime = (id: string, time: string) => {
    dbService.updateReminder(id, { time_of_day: time });
    setReminders(prev => prev.map(r => r.id === id ? { ...r, time_of_day: time } : r));
  };

  const handleTestNotification = () => {
    setTestNotice('Word Memory Alert: "I can do all things through Christ who strengthens me." (Philippians 4:13)');
    // If browser Notification API is available and granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Word Memory - Daily Scripture Reminder', {
        body: 'Philippians 4:13 — Time for today\'s Bible memorization session!',
        icon: '/cop-logo.png',
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    setTimeout(() => setTestNotice(null), 5000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-900 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Notification System
                </span>
                <span className="text-xs font-mono text-slate-400">• Section 16</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Daily Scripture & Review Reminders
              </h2>
            </div>
          </div>

          <button
            onClick={handleTestNotification}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Test Reminder Alert</span>
          </button>
        </div>

        {/* Local-First Notice (Section 16 Mandate) */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          <span>
            Local-First Architecture: Reminders trigger via Windows desktop tray alerts / local schedules with zero dependence on paid third-party push services.
          </span>
        </div>
      </div>

      {testNotice && (
        <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-xl text-amber-950 text-xs font-semibold shadow-xs flex items-center gap-2 animate-in fade-in">
          <Bell className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{testNotice}</span>
        </div>
      )}

      {/* Reminder Controls */}
      <div className="space-y-4">
        {reminders.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  {r.reminder_type === 'DAILY_VERSE' ? "Daily Scripture Verse Alarm" : "Due Spaced Review Reminder"}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  r.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  {r.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {r.reminder_type === 'DAILY_VERSE'
                  ? 'Prompts member to complete the 9-step daily memory session'
                  : 'Alerts when previously learned verses reach their spaced review interval'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="time"
                  value={r.time_of_day}
                  onChange={(e) => updateTime(r.id, e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>

              <button
                onClick={() => toggleReminder(r.id, r.enabled)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  r.enabled
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                {r.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Missed Day Handling & Snooze Architecture */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
          Habit Resiliency & Missed-Day Grace
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 block mb-0.5">Snooze Window:</span>
            <span>Allows 15 or 30 minute postponement during church service or work commitments.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 block mb-0.5">Graceful Streak Recovery:</span>
            <span>Missed days queue the verse for evening catch-up without losing previous memory scores.</span>
          </div>
        </div>
      </div>

    </div>
  );
};
