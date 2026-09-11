// src/pages/organizer/tabs/ParticipantsTab.jsx
import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  FileSpreadsheet,
  Building,
} from 'lucide-react';

export default function ParticipantsTab({
  events = [],
  registrations = [],
  showToast,
}) {
  const [search, setSearch] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter events that actually have linked IDs
  const eventOptions = useMemo(() => {
    return events
      .filter(e => e.linkedEvent)
      .map(e => ({
        id: e.linkedEvent._id || e.linkedEvent.slug || e.linkedEvent,
        name: e.eventName,
      }));
  }, [events]);

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      // Event filter
      if (selectedEventId !== 'all') {
        const regEventId = reg.event?._id || reg.event;
        if (regEventId !== selectedEventId) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && reg.status !== statusFilter) {
        return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const userName = reg.user?.name?.toLowerCase() || '';
        const userEmail = reg.user?.email?.toLowerCase() || '';
        const userCollege = reg.user?.college?.toLowerCase() || '';
        const userPhone = reg.user?.phone?.toLowerCase() || '';
        const eventName = reg.event?.name?.toLowerCase() || '';

        if (
          !userName.includes(q) &&
          !userEmail.includes(q) &&
          !userCollege.includes(q) &&
          !userPhone.includes(q) &&
          !eventName.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [registrations, selectedEventId, statusFilter, search]);

  // Unique colleges count
  const collegesCount = useMemo(() => {
    const colleges = new Set(
      filteredRegistrations
        .map(r => r.user?.college)
        .filter(Boolean)
    );
    return colleges.size;
  }, [filteredRegistrations]);

  // Confirmed count
  const confirmedCount = useMemo(() => {
    return filteredRegistrations.filter(r => r.status === 'confirmed').length;
  }, [filteredRegistrations]);

  // Export to CSV generator
  const exportToCSV = () => {
    if (filteredRegistrations.length === 0) {
      showToast?.('No participants to export', 'info');
      return;
    }

    try {
      const headers = ['Event Name', 'Participant Name', 'Email', 'Phone', 'College', 'Status', 'Registered Date'];
      const rows = filteredRegistrations.map(r => [
        `"${(r.event?.name || 'Event').replace(/"/g, '""')}"`,
        `"${(r.user?.name || 'Anonymous').replace(/"/g, '""')}"`,
        `"${(r.user?.email || '').replace(/"/g, '""')}"`,
        `"${(r.user?.phone || '').replace(/"/g, '""')}"`,
        `"${(r.user?.college || 'N/A').replace(/"/g, '""')}"`,
        `"${r.status || 'confirmed'}"`,
        `"${r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN') : 'N/A'}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `festnest_participants_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast?.(`Exported ${filteredRegistrations.length} participants to CSV`, 'success');
    } catch {
      showToast?.('Failed to generate CSV export', 'error');
    }
  };

  return (
    <div className="space-y-5">
      {/* ── Summary Counters Strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-border rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
              <Users size={18} strokeWidth={2} />
            </div>
            <div>
              <div className="font-heading font-bold text-[22px] text-text-1 leading-none">
                {filteredRegistrations.length}
              </div>
              <div className="text-[12px] text-text-3 mt-1">Total Registrations</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 size={18} strokeWidth={2} />
            </div>
            <div>
              <div className="font-heading font-bold text-[22px] text-emerald-700 leading-none">
                {confirmedCount}
              </div>
              <div className="text-[12px] text-text-3 mt-1">Confirmed Attendees</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200">
              <Building size={18} strokeWidth={2} />
            </div>
            <div>
              <div className="font-heading font-bold text-[22px] text-indigo-700 leading-none">
                {collegesCount}
              </div>
              <div className="text-[12px] text-text-3 mt-1">Colleges Represented</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter & Action Bar ── */}
      <div className="bg-white border border-border rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-4 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by participant name, email, college, or phone…"
              className="w-full pl-9 pr-4 py-2 bg-surface-1 border border-border rounded-xl text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-text-4"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-text-4 hover:text-text-2 bg-surface-2 px-1.5 py-0.5 rounded"
              >
                Clear
              </button>
            )}
          </div>

          {/* Export to CSV Button */}
          <button
            onClick={exportToCSV}
            disabled={filteredRegistrations.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[12px] font-bold shadow-xs transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={14} strokeWidth={2.4} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/70 text-[12px]">
          {/* Event Filter */}
          <div className="flex items-center gap-2">
            <span className="text-text-4 font-medium">Event:</span>
            <select
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value)}
              className="px-2.5 py-1 bg-surface-1 border border-border rounded-lg text-[12px] font-medium text-text-2 outline-none focus:border-primary cursor-pointer max-w-[200px] truncate"
            >
              <option value="all">All Events ({events.length})</option>
              {eventOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-text-4 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 bg-surface-1 border border-border rounded-lg text-[12px] font-medium text-text-2 outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {(search || selectedEventId !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedEventId('all');
                setStatusFilter('all');
              }}
              className="text-[11px] text-primary hover:underline ml-auto font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Registrations Table / Empty State ── */}
      {filteredRegistrations.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-border shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3 border border-purple-100">
            <FileSpreadsheet size={22} />
          </div>
          <h3 className="font-heading font-bold text-[16px] text-text-1">No participant registrations yet</h3>
          <p className="text-[13px] text-text-3 mt-1 max-w-md mx-auto leading-relaxed">
            {search || selectedEventId !== 'all' || statusFilter !== 'all'
              ? 'No registered participants match your selected filters. Try clearing search.'
              : 'As students discover your live events on FestNest and register, their names, colleges, and contact details will appear here.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
            <table className="w-full min-w-[700px] text-left text-[12px]">
              <thead className="bg-surface-1 border-b border-border text-[11px] font-bold uppercase tracking-wider text-text-4 select-none">
                <tr>
                  <th className="py-3.5 px-4">Participant</th>
                  <th className="py-3.5 px-3">College</th>
                  <th className="py-3.5 px-3">Event</th>
                  <th className="py-3.5 px-3">Contact</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRegistrations.map((reg, idx) => {
                  const u = reg.user || {};
                  const initials =
                    u.name
                      ?.split(' ')
                      .map(w => w[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) || 'ST';

                  return (
                    <tr key={reg._id || idx} className="hover:bg-surface-1/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {u.avatar?.url ? (
                            <img
                              src={u.avatar.url}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-border flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0 border border-purple-200 font-mono">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-[13px] text-text-1 truncate">
                              {u.name || 'Anonymous Student'}
                            </div>
                            <div className="text-[11px] text-text-4 truncate flex items-center gap-1">
                              <Mail size={10} /> {u.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-text-2 font-medium max-w-[180px] truncate">
                        {u.college || '—'}
                      </td>
                      <td className="py-3 px-3 font-semibold text-primary max-w-[180px] truncate">
                        {reg.event?.name || 'Event'}
                      </td>
                      <td className="py-3 px-3 font-mono text-text-3 whitespace-nowrap">
                        {u.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone size={10} className="text-text-4" /> {u.phone}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            reg.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : reg.status === 'cancelled'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {reg.status === 'confirmed' && <CheckCircle2 size={10} />}
                          {reg.status === 'pending' && <Clock size={10} />}
                          {reg.status === 'cancelled' && <XCircle size={10} />}
                          {reg.status ? reg.status.charAt(0).toUpperCase() + reg.status.slice(1) : 'Confirmed'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-text-3 text-right whitespace-nowrap">
                        {reg.createdAt
                          ? new Date(reg.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
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

