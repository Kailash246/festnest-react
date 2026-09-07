// src/pages/admin/tabs/CollegesTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Search, Plus, MapPin, Trash2, Edit2,
  X, AlertCircle, CheckCircle2
} from 'lucide-react';
import { college as collegeApi, admin } from '../../../services/api';
import ConfirmDialog from '../components/ConfirmDialog';

export default function CollegesTab({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [deleteConfirmCollege, setDeleteConfirmCollege] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: '',
    logoEmoji: '🎓',
  });
  const [saving, setSaving] = useState(false);

  const loadColleges = useCallback(() => {
    setLoading(true);
    collegeApi.list(search.trim() || undefined)
      .then(r => setItems(r.data.colleges || []))
      .catch(e => showToast?.(e.message || 'Failed to fetch colleges', 'error'))
      .finally(() => setLoading(false));
  }, [search, showToast]);

  useEffect(() => {
    const t = setTimeout(loadColleges, 250);
    return () => clearTimeout(t);
  }, [loadColleges]);

  const handleOpenAdd = () => {
    setEditingCollege(null);
    setFormData({ name: '', city: '', state: '', logoEmoji: '🎓' });
    setModalOpen(true);
  };

  const handleOpenEdit = (col) => {
    setEditingCollege(col);
    setFormData({
      name: col.name || '',
      city: col.city || '',
      state: col.state || '',
      logoEmoji: col.logoEmoji || '🎓',
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
        showToast?.('College updated successfully', 'success');
      } else {
        await admin.addCollege(formData);
        showToast?.('College added successfully', 'success');
      }
      setModalOpen(false);
      loadColleges();
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
      loadColleges();
    } catch (err) {
      showToast?.(err.message || 'Failed to delete college', 'error');
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <ConfirmDialog
        isOpen={!!deleteConfirmCollege}
        title="Remove College?"
        message={`Are you sure you want to remove "${deleteConfirmCollege?.name}" from the FestNest college directory?`}
        confirmText="Remove College"
        confirmVariant="danger"
        onConfirm={handleDeleteCollege}
        onCancel={() => setDeleteConfirmCollege(null)}
      />

      {/* Control bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search college directory..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
          />
        </div>

        {/* Add College button */}
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add College</span>
        </button>
      </div>

      {/* Colleges List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-neutral-200/80">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-medium text-neutral-500">Loading colleges...</p>
        </div>
      ) : items.length === 0 ? (
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
      )}

      {/* Add / Edit College Modal */}
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
                  {editingCollege ? 'Edit College' : 'Add New College'}
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
                    College Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Indian Institute of Technology Madras"
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
                      placeholder="Chennai"
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
                      placeholder="Tamil Nadu"
                      className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Emoji / Logo Icon
                  </label>
                  <input
                    type="text"
                    value={formData.logoEmoji}
                    onChange={e => setFormData(f => ({ ...f, logoEmoji: e.target.value }))}
                    placeholder="🎓"
                    className="w-20 px-3 py-2 text-xs text-center bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                  />
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
                    {saving ? 'Saving...' : editingCollege ? 'Update College' : 'Add College'}
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

