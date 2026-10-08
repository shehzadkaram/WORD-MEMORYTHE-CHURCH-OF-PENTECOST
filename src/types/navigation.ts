/**
 * Navigation items and routing types for Word Memory application.
 */

export type AppSection = 
  | 'dashboard'
  | 'todays-verse'
  | 'curriculum-journey'
  | 'memorize'
  | 'review'
  | 'quiz'
  | 'bible-library'
  | 'my-verses'
  | 'progress'
  | 'notes'
  | 'reminders'
  | 'church-challenges'
  | 'settings'
  | 'backup-restore'
  | 'bible-manager'
  | 'curriculum-builder'
  | 'curriculum-review'
  | 'admin-dashboard'
  | 'pastoral-oversight'
  | 'content-governance'
  | 'audit-logs'
  | 'user-management';

export interface NavItemConfig {
  id: AppSection;
  label: string;
  urduLabel: string;
  iconName: string;
  category: 'core' | 'memorization' | 'library' | 'personal' | 'church' | 'governance' | 'system';
  badge?: string;
  isPhase1Active: boolean;
  minRole?: 'MEMBER' | 'PASTOR_LEADERSHIP' | 'ADMINISTRATOR';
}

export const NAVIGATION_ITEMS: NavItemConfig[] = [
  // Core
  {
    id: 'dashboard',
    label: 'Dashboard',
    urduLabel: 'ڈیش بورڈ',
    iconName: 'LayoutDashboard',
    category: 'core',
    isPhase1Active: true,
  },
  {
    id: 'todays-verse',
    label: "Today's Verse",
    urduLabel: 'آج کی آیت',
    iconName: 'Sparkles',
    category: 'core',
    badge: 'Daily',
    isPhase1Active: true,
  },
  
  // Memorization
  {
    id: 'curriculum-journey',
    label: '365-Day Journey',
    urduLabel: '365 روزہ سفر',
    iconName: 'CalendarDays',
    category: 'memorization',
    badge: '365 Days',
    isPhase1Active: true,
  },
  {
    id: 'memorize',
    label: 'Memorize',
    urduLabel: 'حفظ کریں',
    iconName: 'BrainCircuit',
    category: 'memorization',
    isPhase1Active: true,
  },
  {
    id: 'review',
    label: 'Review',
    urduLabel: 'دہرائیں',
    iconName: 'Repeat',
    category: 'memorization',
    badge: '1 Due',
    isPhase1Active: true,
  },
  {
    id: 'quiz',
    label: 'Quiz',
    urduLabel: 'کوئز',
    iconName: 'HelpCircle',
    category: 'memorization',
    isPhase1Active: true,
  },

  // Library & Verses
  {
    id: 'bible-library',
    label: 'Bible Library',
    urduLabel: 'بائبل لائبریری',
    iconName: 'BookOpen',
    category: 'library',
    isPhase1Active: true,
  },
  {
    id: 'my-verses',
    label: 'My Memorized Verses',
    urduLabel: 'میری یاد کردہ آیات',
    iconName: 'BookmarkCheck',
    category: 'library',
    isPhase1Active: true,
  },

  // Personal Growth & Reflections
  {
    id: 'progress',
    label: 'Progress',
    urduLabel: 'پیش رفت',
    iconName: 'TrendingUp',
    category: 'personal',
    isPhase1Active: true,
  },
  {
    id: 'notes',
    label: 'Notes',
    urduLabel: 'روحانی نوٹس',
    iconName: 'FileText',
    category: 'personal',
    isPhase1Active: true,
  },
  {
    id: 'reminders',
    label: 'Reminders',
    urduLabel: 'یاد دہانی',
    iconName: 'Bell',
    category: 'personal',
    isPhase1Active: true,
  },

  // Church Community
  {
    id: 'church-challenges',
    label: 'Church Challenges',
    urduLabel: 'کلیسیائی چیلنجز',
    iconName: 'Award',
    category: 'church',
    badge: 'Challenge',
    isPhase1Active: true,
  },
  {
    id: 'curriculum-review',
    label: 'Pastor Review',
    urduLabel: 'نگرانی و منظوری',
    iconName: 'CheckSquare',
    category: 'governance',
    badge: 'Leadership',
    isPhase1Active: true,
    minRole: 'PASTOR_LEADERSHIP',
  },
  {
    id: 'pastoral-oversight',
    label: 'Pastoral Oversight',
    urduLabel: 'پاسٹرل نگرانی و نمو',
    iconName: 'Users',
    category: 'governance',
    badge: 'Pastoral',
    isPhase1Active: true,
    minRole: 'PASTOR_LEADERSHIP',
  },
  {
    id: 'content-governance',
    label: 'Content Governance',
    urduLabel: 'مواد کی حکمرانی',
    iconName: 'ShieldCheck',
    category: 'governance',
    badge: 'Governance',
    isPhase1Active: true,
    minRole: 'PASTOR_LEADERSHIP',
  },
  {
    id: 'admin-dashboard',
    label: 'Admin Console',
    urduLabel: 'ایڈمن کنسول',
    iconName: 'ShieldAlert',
    category: 'system',
    badge: 'Admin',
    isPhase1Active: true,
    minRole: 'ADMINISTRATOR',
  },
  {
    id: 'audit-logs',
    label: 'Audit Trail',
    urduLabel: 'آڈٹ لاگز',
    iconName: 'ClipboardList',
    category: 'system',
    badge: 'Audit',
    isPhase1Active: true,
    minRole: 'PASTOR_LEADERSHIP',
  },
  {
    id: 'user-management',
    label: 'User & Role Access',
    urduLabel: 'صارف و کردار انتظام',
    iconName: 'UserCog',
    category: 'system',
    badge: 'Admin',
    isPhase1Active: true,
    minRole: 'ADMINISTRATOR',
  },

  // System & Management
  {
    id: 'curriculum-builder',
    label: 'Curriculum Engine',
    urduLabel: 'نصاب ساز و معائنہ',
    iconName: 'Layers',
    category: 'system',
    badge: 'Phase 3',
    isPhase1Active: true,
    minRole: 'ADMINISTRATOR',
  },
  {
    id: 'bible-manager',
    label: 'Bible Import & Database',
    urduLabel: 'بائبل امپورٹ و ڈیٹابیس',
    iconName: 'Database',
    category: 'system',
    badge: 'Phase 2',
    isPhase1Active: true,
    minRole: 'ADMINISTRATOR',
  },
  {
    id: 'settings',
    label: 'Settings',
    urduLabel: 'ترتیبات',
    iconName: 'Settings',
    category: 'system',
    isPhase1Active: true,
  },
  {
    id: 'backup-restore',
    label: 'Backup & Restore',
    urduLabel: 'بیک اپ اور بحالی',
    iconName: 'FolderArchive',
    category: 'system',
    badge: 'Admin',
    isPhase1Active: true,
    minRole: 'ADMINISTRATOR',
  },
];
