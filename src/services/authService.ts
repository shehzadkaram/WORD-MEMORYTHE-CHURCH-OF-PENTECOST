/**
 * WORD MEMORY - The Church of Pentecost Dubai
 * Pakistani & Indian Worship Centre
 * 
 * Authentication & Role-Based Access Control (RBAC) Service
 * 
 * Implements Section 8 & 24:
 * - Roles: ADMINISTRATOR, PASTOR_LEADERSHIP, MEMBER
 * - Member privacy preservation (no exposure of personal notes/data to other members)
 * - Protected administrative functions (Bible DB and curriculum modification reserved)
 */

import { UserRoleType } from '../types/database';
import { dbService } from '../database/dbService';

export interface PermissionCheck {
  canModifyBibleDatabase: boolean;
  canCreateChurchChallenge: boolean;
  canManageChurchCurriculum: boolean;
  canAccessSystemBackup: boolean;
  canViewAllMemberAnalytics: boolean;
  canEditPersonalNotes: boolean;
  canMemorizeVerses: boolean;
  canAccessAdminDashboard: boolean;
  canAccessPastoralOversight: boolean;
  canApproveContent: boolean;
  canViewAuditLogs: boolean;
  canManageUsersAndRoles: boolean;
}

export class AuthService {
  public static getPermissions(role: UserRoleType): PermissionCheck {
    switch (role) {
      case 'ADMINISTRATOR':
        return {
          canModifyBibleDatabase: true,
          canCreateChurchChallenge: true,
          canManageChurchCurriculum: true,
          canAccessSystemBackup: true,
          canViewAllMemberAnalytics: true,
          canEditPersonalNotes: true,
          canMemorizeVerses: true,
          canAccessAdminDashboard: true,
          canAccessPastoralOversight: true,
          canApproveContent: true,
          canViewAuditLogs: true,
          canManageUsersAndRoles: true,
        };

      case 'PASTOR_LEADERSHIP':
        return {
          canModifyBibleDatabase: false, // Normal members & pastors cannot alter official source text
          canCreateChurchChallenge: true,
          canManageChurchCurriculum: true,
          canAccessSystemBackup: false,
          canViewAllMemberAnalytics: true,
          canEditPersonalNotes: true,
          canMemorizeVerses: true,
          canAccessAdminDashboard: false, // Admin dashboard is reserved for ADMINISTRATOR
          canAccessPastoralOversight: true,
          canApproveContent: true,
          canViewAuditLogs: true,
          canManageUsersAndRoles: false, // User role reassignment is reserved for ADMINISTRATOR
        };

      case 'MEMBER':
      default:
        return {
          canModifyBibleDatabase: false,
          canCreateChurchChallenge: false,
          canManageChurchCurriculum: false,
          canAccessSystemBackup: false,
          canViewAllMemberAnalytics: false,
          canEditPersonalNotes: true,
          canMemorizeVerses: true,
          canAccessAdminDashboard: false,
          canAccessPastoralOversight: false,
          canApproveContent: false,
          canViewAuditLogs: false,
          canManageUsersAndRoles: false,
        };
    }
  }

  /**
   * Evaluates whether a role is authorized to approve or reject curriculum/supporting content
   */
  public static canApproveContent(role: UserRoleType): boolean {
    return AuthService.getPermissions(role).canApproveContent;
  }

  /**
   * Evaluates whether a role is authorized to view an application section
   */
  public static canAccessSection(role: UserRoleType, section: string): boolean {
    const perms = AuthService.getPermissions(role);
    switch (section) {
      case 'admin-dashboard':
      case 'user-management':
      case 'backup-restore':
      case 'curriculum-builder':
        return perms.canAccessAdminDashboard;

      case 'pastoral-oversight':
        return perms.canAccessPastoralOversight;

      case 'content-governance':
      case 'curriculum-review':
        return perms.canApproveContent;

      case 'audit-logs':
        return perms.canViewAuditLogs;

      case 'bible-manager':
        return role === 'ADMINISTRATOR';

      default:
        return true; // General member sections (dashboard, memorize, review, quiz, etc.)
    }
  }

  public static getRoleLabel(role: UserRoleType): { title: string; urduTitle: string; badgeColor: string } {
    switch (role) {
      case 'ADMINISTRATOR':
        return {
          title: 'Administrator',
          urduTitle: 'ایڈمنسٹریٹر',
          badgeColor: 'bg-red-50 text-red-800 border-red-300',
        };
      case 'PASTOR_LEADERSHIP':
        return {
          title: 'Pastor / Leadership',
          urduTitle: 'پادری / کلیسیائی قیادت',
          badgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
        };
      case 'MEMBER':
      default:
        return {
          title: 'Church Member',
          urduTitle: 'کلیسیائی رکن',
          badgeColor: 'bg-blue-50 text-blue-900 border-blue-300',
        };
    }
  }

  public static switchRole(role: UserRoleType): void {
    dbService.setActiveRole(role);
  }
}
