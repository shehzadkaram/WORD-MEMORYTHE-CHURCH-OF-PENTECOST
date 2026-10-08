import React, { useState } from 'react';
import { 
  UserCog, 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  UserX, 
  UserCheck, 
  KeyRound,
  Info
} from 'lucide-react';
import { dbService } from '../../database/dbService';
import { User, UserRoleType } from '../../types/database';
import { AuthService } from '../../services/authService';

interface UserManagementViewProps {
  activeRole: UserRoleType;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ activeRole }) => {
  const [users, setUsers] = useState<User[]>(() => dbService.getAllUsers());
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isAdmin = activeRole === 'ADMINISTRATOR';

  const refreshUsers = () => {
    setUsers(dbService.getAllUsers());
  };

  const handleRoleChange = (userId: string, newRole: UserRoleType) => {
    if (!isAdmin) {
      setNotification({ type: 'error', message: 'Unauthorized: Only Administrators can modify user roles.' });
      return;
    }

    const result = dbService.updateUserRole(userId, newRole);
    if (result.success) {
      setNotification({ type: 'success', message: `Updated role for user to ${newRole}. Action recorded in audit trail.` });
      refreshUsers();
    } else {
      setNotification({ type: 'error', message: result.error || 'Failed to update user role.' });
    }
  };

  const handleToggleStatus = (user: User) => {
    if (!isAdmin) {
      setNotification({ type: 'error', message: 'Unauthorized: Only Administrators can toggle account status.' });
      return;
    }

    const result = dbService.toggleUserStatus(user.id);
    if (result.success) {
      setNotification({ 
        type: 'success', 
        message: `Toggled user ${user.display_name} status to ${user.is_active ? 'DEACTIVATED' : 'ACTIVE'}. Action recorded in audit trail.` 
      });
      refreshUsers();
    } else {
      setNotification({ type: 'error', message: result.error || 'Failed to toggle account status.' });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#1A365D] to-[#2A4365] rounded-xl p-6 text-white shadow-md border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                Church Access Governance
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                RBAC Security Layer
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <UserCog className="w-6 h-6 text-amber-400" />
              User & Role Access Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Role-Based Access Control • Member Privacy Guard • Immutable Role Assignment Audit Trail
            </p>
          </div>
        </div>
      </div>

      {/* Role Permission Matrix Notice */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <KeyRound className="w-4 h-4 text-purple-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Role Permission & Access Control Matrix (Prompt Section 2 & 10)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">CHURCH MEMBER</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">MEMBER</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Personal Scripture memorization, 9-step daily flow, Spaced Repetition queue, isolated private notes, church challenges.
            </p>
            <div className="text-[10px] text-rose-700 font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3" /> Blocked from Admin & Governance
            </div>
          </div>

          <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950">PASTOR / LEADERSHIP</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">PASTOR_LEADERSHIP</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Full member capabilities + Pastoral Oversight (aggregate discipleship metrics), AI Content Governance (approval/rejection), Curriculum Review interface.
            </p>
            <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Discipleship Shepherding
            </div>
          </div>

          <div className="p-3 rounded-lg border border-purple-200 bg-purple-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-950">ADMINISTRATOR</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900">ADMINISTRATOR</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Complete church governance + User & Role assignment, SQLite Backup/Restore, Bible Database canonical management, System audit logs.
            </p>
            <div className="text-[10px] text-purple-700 font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Full System Administration
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-3.5 rounded-lg text-xs font-semibold flex items-center justify-between shadow-2xs ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-rose-50 text-rose-900 border border-rose-300'}`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Registered Church Accounts ({users.length} Users)
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">
            Password hashes sanitized & excluded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Display Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned Role</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const role = dbService.getUserRole(user.id);
                return (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{user.username}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{user.id}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {user.display_name}
                    </td>
                    <td className="px-4 py-3">
                      {user.is_active ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                          <UserCheck className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1 w-fit">
                          <UserX className="w-3 h-3" /> Deactivated
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin ? (
                        <select
                          value={role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as UserRoleType)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold bg-white text-slate-800"
                        >
                          <option value="MEMBER">MEMBER</option>
                          <option value="PASTOR_LEADERSHIP">PASTOR_LEADERSHIP</option>
                          <option value="ADMINISTRATOR">ADMINISTRATOR</option>
                        </select>
                      ) : (
                        <span className="font-semibold text-slate-700">{role}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isAdmin ? (
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${user.is_active ? 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Admin Only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
