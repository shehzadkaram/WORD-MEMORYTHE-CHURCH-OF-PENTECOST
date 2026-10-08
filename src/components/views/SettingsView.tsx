import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Globe, 
  Type, 
  Award, 
  Save, 
  Check, 
  Monitor, 
  ShieldCheck,
  Building
} from 'lucide-react';
import { dbService } from '../../database/dbService';
import { AppSection } from '../../types/navigation';
import { UserRoleType } from '../../types/database';

interface SettingsViewProps {
  onNavigate: (section: AppSection) => void;
  activeRole: UserRoleType;
  onRoleChange: (role: UserRoleType) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onNavigate,
  activeRole,
  onRoleChange,
}) => {
  const [settings, setSettings] = useState(() => dbService.getSettings());
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    dbService.updateSettings(settings);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 text-slate-800 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Preferences & Configuration
                </span>
                <span className="text-xs font-mono text-slate-400">• Section 22</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Application & Member Settings
              </h2>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B2545] hover:bg-[#133E87] text-white text-xs font-bold shadow-xs transition-all"
          >
            {savedNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5 text-amber-400" />}
            <span>{savedNotice ? 'Saved!' : 'Save Preferences'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Configure language preferences, Scripture font sizes, daily memory quotas, and active church profile.
        </p>
      </div>

      {/* Church Congregation Profile Info */}
      <div className="bg-[#081B33] text-white rounded-2xl p-5 border border-slate-800 space-y-3 shadow-md">
        <div className="flex items-center gap-2.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <Building className="w-4 h-4" />
          <span>Official Church Profile</span>
        </div>
        <div>
          <h3 className="text-base font-extrabold text-white">THE CHURCH OF PENTECOST, DUBAI</h3>
          <p className="text-xs text-amber-400 font-semibold">PAKISTANI & INDIAN WORSHIP CENTRE</p>
          <p className="text-xs text-slate-400 pt-1">
            Official Bible Verse Memorization & Spiritual Growth Platform
          </p>
        </div>
      </div>

      {/* Preferences Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
        
        {/* Language Preference */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-600" />
            <span>Primary Language Display</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'both', label: 'Bilingual (اردو + English)' },
              { id: 'ur', label: 'Urdu Primary (اردو)' },
              { id: 'en', label: 'English Primary' },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSettings({ ...settings, language: lang.id as any })}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  (settings.language || 'both') === lang.id
                    ? 'bg-[#0B2545] text-amber-300 border-[#0B2545] font-bold shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Type className="w-4 h-4 text-amber-600" />
            <span>Urdu Scripture Typography Size</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'normal', label: 'Normal (Standard)' },
              { id: 'large', label: 'Large (بڑا)' },
              { id: 'extra_large', label: 'Extra Large (بہت بڑا)' },
            ].map((size) => (
              <button
                key={size.id}
                onClick={() => setSettings({ ...settings, font_size: size.id as any })}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  (settings.font_size || 'normal') === size.id
                    ? 'bg-[#0B2545] text-amber-300 border-[#0B2545] font-bold shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* Daily Goal */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Daily Memorization Quota</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((count) => (
              <button
                key={count}
                onClick={() => setSettings({ ...settings, daily_goal_verses: count })}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  settings.daily_goal_verses === count
                    ? 'bg-[#0B2545] text-amber-300 border-[#0B2545] font-bold shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {count} {count === 1 ? 'Verse / Day (Recommended)' : 'Verses / Day'}
              </button>
            ))}
          </div>
        </div>

        {/* Role Switcher */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-600" />
            <span>Simulate User Role (Section 8 Architecture)</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'MEMBER', title: 'Church Member' },
              { id: 'PASTOR_LEADERSHIP', title: 'Pastor / Leadership' },
              { id: 'ADMINISTRATOR', title: 'System Administrator' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => onRoleChange(r.id as UserRoleType)}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  activeRole === r.id
                    ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {r.title}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Windows Desktop & Production Readiness Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Windows Desktop & Offline-First Infrastructure
              </h3>
              <p className="text-[11px] text-slate-500">
                Phase 10 Production Release • The Church of Pentecost Dubai
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-mono text-[11px] font-bold rounded-md border border-emerald-200">
            v{dbService.getAppVersion()} (Schema v{dbService.getSchemaVersion()})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="font-semibold text-slate-700 block">Local Database Storage</span>
            <code className="text-[11px] text-slate-600 font-mono block break-all">
              %APPDATA%\WordMemory\Local Storage
            </code>
            <span className="text-[10px] text-slate-400 block">
              100% offline-first • Local-First SQLite architecture
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="font-semibold text-slate-700 block">Backup & Archive Location</span>
            <code className="text-[11px] text-slate-600 font-mono block break-all">
              %USERPROFILE%\Documents\WordMemoryBackups
            </code>
            <span className="text-[10px] text-slate-400 block">
              FNV-1a checksums • Automatic pre-upgrade safety snapshots
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="font-semibold text-slate-700 block">Scripture Database</span>
            <span className="text-slate-600 block">
              66 Books • 1,189 Chapters • 30,813 Verses (WordPocket Urdu)
            </span>
            <span className="text-[10px] text-emerald-600 font-medium block">
              Zero runtime network dependency • 100% local
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="font-semibold text-slate-700 block">Uninstall Safety Policy</span>
            <span className="text-slate-600 block">
              User Data Preserved (<code className="text-[11px] font-mono">deleteAppDataOnUninstall: false</code>)
            </span>
            <span className="text-[10px] text-slate-400 block">
              Application updates and uninstalls retain member progress
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
