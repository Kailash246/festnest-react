// src/pages/ca/components/CAApplicationForm.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { ca } from '../../../services/api';
import { useApp } from '../../../context/AppContext';

export default function CAApplicationForm({ existingCA }) {
  const { currentUser, showToast } = useApp();

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState('');

  const [form, setForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    college: currentUser?.college || '',
    course: '',
    year: currentUser?.year || '',
    city: currentUser?.city || '',
    instagram: currentUser?.instagram || '',
    why: '',
    referral: '',
  });

  useEffect(() => {
    if (currentUser) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || currentUser.name || '',
        email: prev.email || currentUser.email || '',
        phone: prev.phone || currentUser.phone || '',
        college: prev.college || currentUser.college || '',
        city: prev.city || currentUser.city || '',
        year: prev.year || currentUser.year || '',
        instagram: prev.instagram || currentUser.instagram || '',
      }));
    }
  }, [currentUser]);

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (submitError) setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const res = await ca.apply(form);
      setSubmitted(true);
      setSubmitSuccessMsg(
        res.message || "Application received! We'll review your application within 5–7 business days."
      );
      showToast?.('Application submitted successfully!', 'success');
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit application. Please check your details and try again.');
      showToast?.(err.message || 'Application failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="apply" className="py-16 bg-white border-b border-border">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">

        {/* Header */}
        <div className="text-center">
          <span className="text-xs uppercase font-mono font-bold tracking-wider text-primary">
            Join The Cohort
          </span>
          <h2 className="font-heading text-3xl font-bold text-slate-900 mt-1">
            Apply to become a CA
          </h2>
          <p className="font-sans text-sm text-text-2 mt-2">
            Takes under five minutes. Our campus screening team will review your application.
          </p>
        </div>

        {/* State A: Already Approved CA */}
        {existingCA?.status === 'approved' ? (
          <div className="mt-8 rounded-2xl bg-indigo-50/80 border border-indigo-200 p-6 shadow-sm">
            <div className="flex items-start gap-3.5">
              <CheckCircle2 size={24} className="mt-0.5 text-primary shrink-0" />
              <div>
                <h3 className="font-heading font-bold text-indigo-950 text-base sm:text-lg">
                  You are an active Campus Ambassador!
                </h3>
                <p className="font-sans mt-1 text-xs sm:text-sm text-indigo-800 leading-relaxed">
                  You already hold official credentials ({existingCA.caId}). Access your live digital badge, referral links, and real-time performance tracking in your portal.
                </p>
                <div className="mt-4">
                  <Link
                    to="/ca/portal"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-primary-dark shadow-sm transition"
                  >
                    <span>Open CA Portal</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : existingCA?.status === 'applied' || existingCA?.status === 'screening' ? (
          /* State B: Application Under Review */
          <div className="mt-8 rounded-2xl bg-amber-50/80 border border-amber-200 p-6 shadow-sm">
            <div className="flex items-start gap-3.5">
              <Sparkles size={24} className="mt-0.5 text-amber-600 shrink-0" />
              <div>
                <h3 className="font-heading font-bold text-amber-950 text-base sm:text-lg">
                  Your application is under review
                </h3>
                <p className="font-sans mt-1 text-xs sm:text-sm text-amber-800 leading-relaxed">
                  We received your application for {existingCA.college || 'your college'}. Our campus screening team is currently reviewing your profile.
                </p>
                <div className="mt-4">
                  <Link
                    to="/ca/dashboard"
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-amber-700 shadow-sm transition"
                  >
                    <span>Check Application Status</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : submitted ? (
          /* State C: Successfully Submitted in this session */
          <div className="mt-8 rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-emerald-900 shadow-sm">
            <div className="flex items-start gap-3.5">
              <CheckCircle2 size={24} className="mt-0.5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-heading font-bold text-base sm:text-lg">
                  Application received successfully!
                </h4>
                <p className="font-sans mt-1 text-xs sm:text-sm text-emerald-700 leading-relaxed">
                  {submitSuccessMsg || "We'll email you about next steps and screening within 5–7 business days."}
                </p>
                <div className="mt-5 flex gap-3">
                  <Link
                    to="/home"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition"
                  >
                    Return to Home
                  </Link>
                  <Link
                    to="/ca/dashboard"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition"
                  >
                    Track Status
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* State D: New Application Form */
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {submitError && (
              <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 text-xs sm:text-sm">
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
                <div>
                  <span className="font-bold">Unable to submit: </span>
                  {submitError}
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="font-sans text-xs font-semibold text-slate-700">Full name *</label>
                <input
                  required
                  value={form.name}
                  onChange={update('name')}
                  placeholder="e.g. Aditi Sharma"
                  className="mt-1 w-full rounded-xl border border-border px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
                />
              </div>

              <div>
                <label className="font-sans text-xs font-semibold text-slate-700">Email address *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="aditi@college.edu"
                  className="mt-1 w-full rounded-xl border border-border px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
                />
              </div>

              <div>
                <label className="font-sans text-xs font-semibold text-slate-700">Phone (10 digits) *</label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="9876543210"
                  className="mt-1 w-full rounded-xl border border-border px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
                />
              </div>

              <div>
                <label className="font-sans text-xs font-semibold text-slate-700">City *</label>
                <input
                  required
                  value={form.city}
                  onChange={update('city')}
                  placeholder="e.g. Bangalore, Pune, Delhi"
                  className="mt-1 w-full rounded-xl border border-border px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
                />
              </div>

              <div>
                <label className="font-sans text-xs font-semibold text-slate-700">College name *</label>
                <input
                  required
                  value={form.college}
                  onChange={update('college')}
                  placeholder="e.g. RV College of Engineering"
                  className="mt-1 w-full rounded-xl border border-border px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
                />
              </div>

              <div>
                <label className="font-sans text-xs font-semibold text-slate-700">Course &amp; year *</label>
                <input
                  required
                  value={form.course}
                  onChange={update('course')}
                  placeholder="e.g. B.Tech CSE, 2nd year"
                  className="mt-1 w-full rounded-xl border border-border px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
                />
              </div>

              <div>
                <label className="font-sans text-xs font-semibold text-slate-700">Instagram / LinkedIn (optional)</label>
                <input
                  value={form.instagram}
                  onChange={update('instagram')}
                  placeholder="@handle or linkedin.com/in/..."
                  className="mt-1 w-full rounded-xl border border-border px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
                />
              </div>

              <div>
                <label className="font-sans text-xs font-semibold text-slate-700">Referral code (optional)</label>
                <input
                  value={form.referral}
                  onChange={update('referral')}
                  placeholder="e.g. FN-BLR-001"
                  className="mt-1 w-full rounded-xl border border-border px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary uppercase transition"
                />
              </div>
            </div>

            <div>
              <label className="font-sans text-xs font-semibold text-slate-700">
                Why do you want to be a FestNest CA? * <span className="text-text-4 font-normal">(min 20 chars)</span>
              </label>
              <textarea
                required
                rows={4}
                value={form.why}
                onChange={update('why')}
                placeholder="Tell us about student clubs you're part of, your network on campus, and why you want to lead event discovery for your college..."
                className="mt-1 w-full rounded-xl border border-border px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60 shadow-indigo transition active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Submitting application...</span>
                </>
              ) : (
                <>
                  <span>Submit Application</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </section>
  );
}

