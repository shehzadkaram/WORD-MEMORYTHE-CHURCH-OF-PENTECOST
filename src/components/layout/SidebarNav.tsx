import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  BrainCircuit, 
  Repeat, 
  HelpCircle, 
  BookOpen, 
  BookmarkCheck, 
  TrendingUp, 
  FileText, 
  Bell, 
  Award, 
  Settings, 
  Database,
  FolderArchive,
  ChevronRight,
  Church,
  CalendarDays,
  CheckSquare,
  Layers,
  ShieldAlert,
  Users,
  ShieldCheck,
  ClipboardList,
  UserCog
} from 'lucide-react';
import { AppSection, NAVIGATION_ITEMS } from '../../types/navigation';
import { ChurchLogo } from './ChurchLogo';
import { UserRoleType } from '../../types/database';
import { AuthService } from '../../services/authService';

interface SidebarNavProps {
  currentSection: AppSection;
  onSelectSection: (section: AppSection) => void;
  activeRole: UserRoleType;
  onRoleChange: (role: UserRoleType) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  BrainCircuit: <BrainCircuit className="w-4 h-4" />,
  Repeat: <Repeat className="w-4 h-4" />,
  HelpCircle: <HelpCircle className="w-4 h-4" />,
  BookOpen: <BookOpen className="w-4 h-4" />,
  BookmarkCheck: <BookmarkCheck className="w-4 h-4" />,
  TrendingUp: <TrendingUp className="w-4 h-4" />,
  FileText: <FileText className="w-4 h-4" />,
  Bell: <Bell className="w-4 h-4" />,
  Award: <Award className="w-4 h-4" />,
  Settings: <Settings className="w-4 h-4" />,
  Database: <Database className="w-4 h-4" />,
  FolderArchive: <FolderArchive className="w-4 h-4" />,
  CalendarDays: <CalendarDays className="w-4 h-4" />,
  CheckSquare: <CheckSquare className="w-4 h-4" />,
  Layers: <Layers className="w-4 h-4" />,
  ShieldAlert: <ShieldAlert className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  ShieldCheck: <ShieldCheck className="w-4 h-4" />,
  ClipboardList: <ClipboardList className="w-4 h-4" />,
  UserCog: <UserCog className="w-4 h-4" />,
};

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentSection,
  onSelectSection,
  activeRole,
  onRoleChange,
  isOpenMobile,
  onCloseMobile,
}) => {
  const roleLabel = AuthService.getRoleLabel(activeRole);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-[#0B2545] text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 bg-[#081B33]">
          <div className="flex items-center gap-3">
            <ChurchLogo size="md" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-black tracking-wider text-amber-400 uppercase truncate">
                WORD MEMORY
              </span>
              <span className="text-[11px] font-bold text-white truncate">
                THE CHURCH OF PENTECOST
              </span>
              <span className="text-[10px] text-slate-300 font-medium truncate">
                Dubai • Pakistani & Indian Worship
              </span>
            </div>
          </div>
        </div>

        {/* Tagline Ribbon */}
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-[10px] text-amber-300 font-medium text-center tracking-wide">
          “Read • Understand • Memorize • Review • Live”
        </div>

        {/* Navigation Links (13 Sections) */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 py-1">
            Navigation Menu
          </div>

          {NAVIGATION_ITEMS.filter((item) => {
            if (!item.minRole) return true;
            if (item.minRole === 'ADMINISTRATOR') return activeRole === 'ADMINISTRATOR';
            if (item.minRole === 'PASTOR_LEADERSHIP') return activeRole === 'PASTOR_LEADERSHIP' || activeRole === 'ADMINISTRATOR';
            return true;
          }).map((item) => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSection(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={`${isActive ? 'text-slate-950' : 'text-amber-400 group-hover:text-amber-300'}`}>
                    {ICON_MAP[item.iconName] || <Church className="w-4 h-4" />}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-slate-950 text-amber-400'
                          : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-950" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Role Switcher for Phase 1 Testing */}
        <div className="p-3 border-t border-slate-800 bg-[#081B33]">
          <div className="flex items-center justify-between mb-1.5 text-[10px] text-slate-400">
            <span className="uppercase tracking-wider font-semibold">Active Role Preview</span>
            <span className="text-[9px] text-amber-400 font-mono">RBAC</span>
          </div>

          <div className="grid grid-cols-3 gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-700/60">
            {(['MEMBER', 'PASTOR_LEADERSHIP', 'ADMINISTRATOR'] as UserRoleType[]).map((r) => {
              const active = activeRole === r;
              const shortLabel = r === 'ADMINISTRATOR' ? 'Admin' : r === 'PASTOR_LEADERSHIP' ? 'Pastor' : 'Member';
              return (
                <button
                  key={r}
                  onClick={() => onRoleChange(r)}
                  className={`py-1 text-[10px] font-semibold rounded transition-colors ${
                    active
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={`Simulate ${r} view`}
                >
                  {shortLabel}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] px-1">
            <span className="text-slate-300 truncate">
              {roleLabel.title}
            </span>
            <span className="text-[10px] font-urdu text-amber-400">
              {roleLabel.urduTitle}
            </span>
          </div>
        </div>

      </aside>
    </>
  );
};
