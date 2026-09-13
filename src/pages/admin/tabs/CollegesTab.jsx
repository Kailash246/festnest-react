// src/pages/admin/tabs/CollegesTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Search, Plus, MapPin, Trash2, Edit2,
  X, AlertCircle, CheckCircle2, ShieldCheck, ShieldAlert,
  Building2, Eye, EyeOff, FileText, AlertTriangle,
} from 'lucide-react';
import { college as collegeApi, admin } from '../../../services/api';
import ConfirmDialog from '../components/ConfirmDialog';

export default function CollegesTab({ showToast }) {
  const [subTab, setSubTab] = useState('brand'); // 'brand' | 'directory'
  const [items, setItems] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [deleteConfirmCollege, setDeleteConfirmCollege] = useState(null);

  // Marketing display disable modal state
  const [disableModalCollege, setDisableModalCollege] = useState(null);
  const [disableReason, setDisableReason] = useState('');
  const [togglingBrand, setTogglingBrand] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: '',
    logoEmoji: '🎓',
    logoUrl: '',
    marketingEligible: true,
  });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    if (subTab === 'brand') {
      admin.institutions({ q: search.trim() || undefined })
        .then(r => setInstitutions(r.data?.institutions || []))
        .catch(e => showToast?.(e.message || 'Failed to fetch institutions', 'error'))
        .finally(() => setLoading(false));
    } else {
      collegeApi.list(search.trim() || undefined)
        .then(r => setItems(r.data?.colleges || []))
        .catch(e => showToast?.(e.message || 'Failed to fetch colleges', 'error'))
        .finally(() => setLoading(false));
    }
  }, [subTab, search, showToast]);

  useEffect(() => {
    const t = setTimeout(loadData, 250);
    return () => clearTimeout(t);
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditingCollege(null);
    setFormData({ name: '', city: '', state: '', logoEmoji: '🏛️', logoUrl: '', marketingEligible: true });
    setModalOpen(true);
  };

  const handleOpenEdit = (col) => {
    setEditingCollege(col);
    setFormData({
      name: col.name || '',
      city: col.city || '',
      state: col.state || '',
      logoEmoji: col.logoEmoji || '🏛️',
      logoUrl: col.logoUrl || '',
      marketingEligible: col.marketingEligible ?? true,
    });
    setModalOpen(true);
  };

  const handleSaveCollege = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.city.trim() || !formData.state.trim()) {
      showToast?.('Name, city, and state are required', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingCollege) {
        await admin.updateCollege(editingCollege._id, formData);
        showToast?.('Institution updated successfully', 'success');
      } else {
        await admin.addCollege(formData);
        showToast?.('College added successfully', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast?.(err.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCollege = async () => {
    if (!deleteConfirmCollege) return;
    try {
      await admin.deleteCollege(deleteConfirmCollege._id);
      showToast?.(`"${deleteConfirmCollege.name}" removed`, 'info');
      setDeleteConfirmCollege(null);
      loadData();
    } catch (err) {
      showToast?.(err.message || 'Failed to delete college', 'error');
    }
  };

  const handleToggleMarketingDisplay = async (inst, newStatus) => {
    if (!newStatus) {
      // Prompt for takedown reason
      setDisableModalCollege(inst);
      setDisableReason('');
      return;
    }

    // Re-enabling
    try {
      await admin.toggleInstitutionMarketingDisplay(inst._id, {
        isMarketingDisplayAllowed: true,
        marketingEligible: true,
      });
      showToast?.(`Marketing display enabled for "${inst.name}"`, 'success');
      loadData();
    } catch (err) {
      showToast?.(err.message || 'Failed to update marketing display', 'error');
    }
  };

  const confirmDisableMarketing = async (e) => {
    e.preventDefault();
    if (!disableModalCollege) return;

    setTogglingBrand(true);
    try {
      await admin.toggleInstitutionMarketingDisplay(disableModalCollege._id, {
        isMarketingDisplayAllowed: false,
        reason: disableReason.trim() || 'Branding display disabled by administrator',
      });
      showToast?.(`Marketing display disabled for "${disableModalCollege.name}"`, 'info');
      setDisableModalCollege(null);
      loadData();
    } catch (err) {
      showToast?.(err.message || 'Failed to disable marketing display', 'error');
    } finally {
      setTogglingBrand(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl">
      <ConfirmDialog
        isOpen={!!deleteConfirmCollege}
        title="Remove College?"
        message={`Are you sure you want to remove "${deleteConfirmCollege?.name}" from the FestNest directory?`}
        confirmText="Remove College"
        confirmVariant="danger"
        onConfirm={handleDeleteCollege}
        onCancel={() => setDeleteConfirmCollege(null)}
      />

      {/* View Switcher & Control Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setSubTab('brand')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                subTab === 'brand'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Institution Brand &amp; Trust Rights
            </button>
            <button
              onClick={() => setSubTab('directory')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                subTab === 'directory'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              College Directory
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Institution</span>
          </button>
        </div>

        {/* Search & Info */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={subTab === 'brand' ? 'Search institutions by name or city...' : 'Search college directory...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
            />
          </div>

          {subTab === 'brand' && (
            <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Governed by Terms 2026-09 brand usage licence (automatic on published event)</span>
            </div>
          )}
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-neutral-200/80">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-medium text-neutral-500">
            {subTab === 'brand' ? 'Loading institutions data...' : 'Loading colleges...'}
          </p>
        </div>
      ) : subTab === 'brand' ? (
        /* Brand & Trust Section Management View */
        institutions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200/80 shadow-sm">
            <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-neutral-800">No institutions found</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              {search ? 'Try adjusting your search criteria.' : 'Institutions become eligible automatically once an organizer publishes an event under Terms.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {institutions.map(inst => {
              const isLiveOnTrust = inst.isMarketingDisplayAllowed && inst.publishedEventsCount > 0 && inst.marketingEligible;

              return (
                <div
                  key={inst._id}
                  className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-4 hover:border-neutral-300 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Brand Identity */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                        {inst.logoUrl ? (
                          <img
                            src={inst.logoUrl}
                            alt=""
                            className="w-full h-full object-contain p-1"
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <span>{inst.logoEmoji || '🏛️'}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-neutral-900 truncate">{inst.name}</h4>
                          {isLiveOnTrust ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Live on Trust Section
                            </span>
                          ) : !inst.isMarketingDisplayAllowed ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                              <ShieldAlert className="w-3 h-3" />
                              Display Disabled / Takedown
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              Awaiting 2026-09 Event
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-neutral-400" />
                            {inst.city}, {inst.state}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-neutral-700">
                            {inst.publishedEventsCount} {inst.publishedEventsCount === 1 ? 'published event' : 'published events'}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded">
                            <FileText className="w-2.5 h-2.5" />
                            Terms: {inst.termsVersionAccepted || 'Legacy / None'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(inst)}
                        className="p-2 rounded-xl text-neutral-500 hover:text-indigo-600 hover:bg-neutral-100 transition text-xs font-semibold flex items-center gap-1"
                        title="Edit details / logo"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      {inst.isMarketingDisplayAllowed ? (
                        <button
                          type="button"
                          onClick={() => handleToggleMarketingDisplay(inst, false)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition text-xs font-semibold flex items-center gap-1.5"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Disable Marketing</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleMarketingDisplay(inst, true)}
                          className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Enable Marketing</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Removal / Takedown Notice Banner */}
                  {inst.removalRequested && (
                    <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-start gap-2 text-xs text-rose-700 bg-rose-50/60 p-2.5 rounded-xl">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
                      <div>
                        <span className="font-bold">Takedown Record: </span>
                        <span>{inst.removalRequestReason}</span>
                        {inst.removalRequestedAt && (
                          <span className="block text-[11px] text-rose-500 mt-0.5">
                            Recorded: {new Date(inst.removalRequestedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* College Directory View */
        items.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200/80 shadow-sm">
            <GraduationCap className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-neutral-800">No colleges found</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              {search ? 'Try adjusting your search criteria.' : 'Add your first partner college using the button above.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden divide-y divide-neutral-100">
            {items.map(col => (
              <div
                key={col._id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-50/70 transition"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-lg flex-shrink-0">
                    {col.logoEmoji || '🎓'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-neutral-900 truncate">{col.name}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{col.city}, {col.state}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(col)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-indigo-600 hover:bg-neutral-100 transition"
                    title="Edit college"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmCollege(col)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete college"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modal to Disable Marketing / Record Takedown Request */}
      <AnimatePresence>
        {disableModalCollege && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDisableModalCollege(null)}
              className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-8 z-10"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
                <h3 className="text-sm font-bold text-neutral-900">
                  Disable Brand / Promotional Display
                </h3>
                <button
                  type="button"
                  onClick={() => setDisableModalCollege(null)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={confirmDisableMarketing} className="p-6 space-y-4">
                <p className="text-xs text-neutral-600 leading-relaxed">
                  This will immediately remove <strong>{disableModalCollege.name}</strong> from the landing-page trust section and stop future marketing usage. Historical contractual audit records and published event listings will be preserved.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Legal / Takedown Notice Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={disableReason}
                    onChange={e => setDisableReason(e.target.value)}
                    placeholder="e.g. Formal takedown notice received from college registrar on 13 Sep 2026."
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setDisableModalCollege(null)}
                    className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={togglingBrand || !disableReason.trim()}
                    className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition disabled:opacity-50"
                  >
                    {togglingBrand ? 'Saving...' : 'Confirm & Disable'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Institution Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-8 z-10"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
                <h3 className="text-sm font-bold text-neutral-900">
                  {editingCollege ? 'Edit Institution' : 'Add New Institution'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCollege} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    College / Institution Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Indian Institute of Technology Bombay"
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={e => setFormData(f => ({ ...f, city: e.target.value }))}
                      placeholder="Mumbai"
                      className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={e => setFormData(f => ({ ...f, state: e.target.value }))}
                      placeholder="Maharashtra"
                      className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 items-end">
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Emoji Icon
                    </label>
                    <input
                      type="text"
                      value={formData.logoEmoji}
                      onChange={e => setFormData(f => ({ ...f, logoEmoji: e.target.value }))}
                      placeholder="🏛️"
                      className="w-full px-3 py-2 text-xs text-center bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Logo Image URL (optional)
                    </label>
                    <input
                      type="url"
                      value={formData.logoUrl}
                      onChange={e => setFormData(f => ({ ...f, logoUrl: e.target.value }))}
                      placeholder="https://.../logo.png"
                      className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingCollege ? 'Update Institution' : 'Add College'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
