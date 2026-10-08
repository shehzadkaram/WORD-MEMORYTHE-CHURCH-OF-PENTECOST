import React from 'react';
import { Menu, Sparkles, Database, UserCheck, Bell } from 'lucide-react';
import { ChurchLogo } from './ChurchLogo';
import { AppSection } from '../../types/navigation';
import { UserRoleType } from '../../types/database';
import { AuthService } from '../../services/authService';

interface HeaderBarProps {
  currentSection: AppSection;
  onOpenMobileMenu: () => void;
  onStartSession: () => void;
  onOpenSchema: () => void;
  activeRole: UserRoleType;
}

const SECTION_TITLES: Record<AppSection, { title: string; urdu: string }> = {
  'dashboard': { title: 'Bible Memory Journey', urdu: 'بائبل میموری سفر' },
  'todays-verse': { title: "Today's Sacred Verse", urdu: 'آج کی مقدس آیت' },
  'memorize': { title: '9-Step Daily Memorization Flow', urdu: 'نو مراحل پر مشتمل حفظ' },
  'review': { title: 'Spaced Repetition Review Queue', urdu: 'دہرائی کا شیڈول' },
  'quiz': { title: 'Scripture Retention Quiz Engine', urdu: 'حفظ اور فہم کا امتحان' },
  'bible-library': { title: 'WordPocket Urdu & English Bible Library', urdu: 'بائبل لائبریری' },
  'my-verses': { title: 'My Memorized Verses', urdu: 'میری یاد کردہ آیات' },
  'progress': { title: 'Spiritual Growth & Progress', urdu: 'روحانی ترقی اور سنگِ میل' },
  'notes': { title: 'Private Spiritual Reflections & Notes', urdu: 'ذاتی نوٹس اور دعائیں' },
  'reminders': { title: 'Local-First Daily Reminders', urdu: 'یاد دہانی کا نظام' },
  'church-challenges': { title: 'Church-Wide Scripture Challenges', urdu: 'کلیسیائی چیلنجز' },
  'settings': { title: 'Application & Member Settings', urdu: 'ترتیبات' },
  'backup-restore': { title: 'Local SQLite Backup & Restore', urdu: 'بیک اپ اور بحالی' },
  'bible-manager': { title: 'WordPocket Urdu Bible Database Manager', urdu: 'بائبل امپورٹ و ڈیٹابیس' },
  'curriculum-journey': { title: '365-Day Church Memory Journey', urdu: '365 روزہ کلیسیائی بائبل میموری سفر' },
  'curriculum-builder': { title: 'Curriculum Builder & Validation Engine', urdu: 'نصاب ساز و 18 نکاتی معائنہ' },
  'curriculum-review': { title: 'Pastor & Leadership Theological Review', urdu: 'کلیسیائی قیادت کی نگرانی و منظوری' },
  'admin-dashboard': { title: 'Administration Dashboard & System Health', urdu: 'ایڈمنسٹریشن ڈیش بورڈ و نظام کی صحت' },
  'pastoral-oversight': { title: 'Pastoral Oversight & Spiritual Growth', urdu: 'پاسٹرل نگرانی اور روحانی نمو' },
  'content-governance': { title: 'AI Supporting Content Governance', urdu: 'معاون مواد کی کلیسیائی حکمرانی' },
  'audit-logs': { title: 'Governance Audit Trail & Event Logs', urdu: 'کلیسیائی آڈٹ ٹریل و لاگز' },
  'user-management': { title: 'User & Role Access Management', urdu: 'صارفین اور اختیارات کا انتظام' },
};

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentSection,
  onOpenMobileMenu,
  onStartSession,
  onOpenSchema,
  activeRole,
}) => {
  const currentInfo = SECTION_TITLES[currentSection] || { title: 'Word Memory', urdu: 'ورڈ میموری' };
  const roleMeta = AuthService.getRoleLabel(activeRole);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu + Church Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <ChurchLogo size="sm" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-tight text-[#0B2545] uppercase">
                  THE CHURCH OF PENTECOST, DUBAI
                </span>
                <span className="hidden md:inline text-slate-300">|</span>
                <span className="hidden md:inline text-[11px] font-semibold text-amber-600">
                  PAKISTANI & INDIAN WORSHIP CENTRE
                </span>
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-none">
                  {currentInfo.title}
                </h1>
                <span className="hidden sm:inline font-urdu text-xs text-amber-700">
                  {currentInfo.urdu}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Actions & Role Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Role Indicator */}
          <div className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleMeta.badgeColor}`}>
            <UserCheck className="w-3.5 h-3.5" />
            <span>{roleMeta.title}</span>
          </div>

          {/* Schema Inspector Button */}
          <button
            onClick={onOpenSchema}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:text-[#0B2545] hover:bg-slate-50 text-xs font-medium transition-colors"
            title="Inspect 20-table SQLite Schema"
          >
            <Database className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline">Schema</span>
          </button>

          {/* Primary Quick Start Button */}
          <button
            onClick={onStartSession}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B2545] hover:bg-[#133E87] text-white text-xs font-bold shadow-xs hover:shadow transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Daily Session</span>
          </button>
        </div>
      </div>
    </header>
  );
};
