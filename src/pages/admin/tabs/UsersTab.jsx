// src/pages/admin/tabs/UsersTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Search, Shield, Ban, CheckCircle2, ChevronRight,
  GraduationCap, Award, Calendar, MoreHorizontal, AlertCircle
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { admin } from '../../../services/api';
import ConfirmDialog from '../components/ConfirmDialog';

const ROLE_FILTERS = [
  { label: 'All Users', value: '' },
  { label: 'Students', value: 'user' },
  { label: 'Organizers', value: 'organizer' },
  { label: 'Admins', value: 'admin' },
];

const ROLE_CONFIG = {
  user: { label: 'Student', color: 'bg-neutral-100 text-neutral-700 border-neutral-200' },
  organizer: { label: 'Organizer', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  admin: { label: 'Admin', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  superadmin: { label: 'Super Admin', color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export default function UsersTab({ showToast, onSelectUser }) {
  const { currentUser } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionId, setActionId] = useState('');
  const [confirmBanUser, setConfirmBanUser] = useState(null);

  const loadUsers = useCallback(() => {
    setLoading(true);
    const params = { limit: 100 };
    if (search.trim()) params.search = search.trim();
    if (roleFilter) params.role = roleFilter;

    admin.listUsers(params)
      .then(r => setItems(r.data.users || []))
      .catch(e => showToast?.(e.message || 'Failed to fetch users', 'error'))
      .finally(() => setLoading(false));
  }, [search, roleFilter, showToast]);

  useEffect(() => {
    const t = setTimeout(loadUsers, 250);
    return () => clearTimeout(t);
  }, [loadUsers]);

  const handleToggleBan = async () => {
    if (!confirmBanUser) return;
    const u = confirmBanUser;
    setActionId(u._id);
    setConfirmBanUser(null);
    try {
      await admin.toggleBan(u._id);
      showToast?.(u.isBanned ? `User "${u.name}" unbanned` : `User "${u.name}" banned`, u.isBanned ? 'success' : 'info');
      loadUsers();
    } catch (e) {
      showToast?.(e.message || 'Ban toggle failed', 'error');
    } finally {
      setActionId('');
    }
  };

  return (
    <div className="space-y-4">
      <ConfirmDialog
        isOpen={!!confirmBanUser}
        title={confirmBanUser?.isBanned ? "Unban User?" : "Ban User Account?"}
        message={
          confirmBanUser?.isBanned
            ? `Allow "${confirmBanUser?.name}" to sign in and register for FestNest events again?`
            : `Are you sure you want to ban "${confirmBanUser?.name}"? They will be immediately blocked from signing in or submitting events.`
        }
        confirmText={confirmBanUser?.isBanned ? "Unban Account" : "Confirm Ban"}
        confirmVariant={confirmBanUser?.isBanned ? "primary" : "danger"}
        onConfirm={handleToggleBan}
        onCancel={() => setConfirmBanUser(null)}
      />

      {/* Control bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Role pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {ROLE_FILTERS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setRoleFilter(tab.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                roleFilter === tab.value
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name or email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-neutral-200/80">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-medium text-neutral-500">Loading user directory...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200/80 shadow-sm">
          <Users className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-neutral-800">No users found</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Try searching for a different name, email, or role.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <table className="w-full min-w-[720px] text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200/80 bg-neutral-50/60 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">College / Organization</th>
                  <th className="py-3 px-4 text-center">Points</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {items.map(u => {
                  const roleConf = ROLE_CONFIG[u.role] || ROLE_CONFIG.user;
                  const isActing = actionId === u._id;

                  return (
                    <tr
                      key={u._id}
                      onClick={() => onSelectUser?.(u._id)}
                      className={`hover:bg-neutral-50/80 transition-colors cursor-pointer group ${
                        u.isBanned ? 'opacity-60 bg-rose-50/20' : ''
                      }`}
                    >
                      {/* User identity */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                            {u.avatar?.initials || u.name?.slice(0, 2).toUpperCase() || 'FN'}
                          </div>
                          <div className="min-w-0 max-w-[200px]">
                            <span className="font-bold text-neutral-900 block truncate group-hover:text-indigo-600 transition-colors">
                              {u.name}
                            </span>
                            <span className="text-[11px] text-neutral-400 block truncate font-mono">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleConf.color}`}>
                          {roleConf.label}
                        </span>
                      </td>

                      {/* College / Organization */}
                      <td className="py-3 px-4">
                        <span className="text-neutral-700 block truncate max-w-[180px]">
                          {u.organization || u.college || '—'}
                        </span>
                        {u.designation && (
                          <span className="text-[10px] text-neutral-400 block truncate">
                            {u.designation}
                          </span>
                        )}
                      </td>

                      {/* Points */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-neutral-800 tabular-nums">
                          {u.points ?? 0}
                        </span>
                        <span className="text-[10px] text-neutral-400 ml-1">pts</span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-neutral-500 text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }) : '—'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {u.isBanned ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Banned
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {u.role !== 'superadmin' && (
                            <button
                              type="button"
                              onClick={() => setConfirmBanUser(u)}
                              disabled={isActing}
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                                u.isBanned
                                  ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                                  : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                              }`}
                            >
                              {u.isBanned ? 'Unban' : 'Ban'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onSelectUser?.(u._id)}
                            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

