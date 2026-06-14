// src/pages/profile/EditProfile.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Camera, User, GraduationCap, Building2, MapPin, Mail, Phone,
  BookOpen, Code2, Music, Wrench, Trophy, Mic2, Volleyball,
  Globe, Sparkles, Check, X, Save,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { users as usersApi } from '../../services/api';

/* ── Inline SVGs for social icons not in lucide-react v1.17 ── */
const IconLinkedin  = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
const IconInstagram = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>;
const IconGithub    = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>;

/* ════════════════════════════════════════════
   Reusable form primitives
════════════════════════════════════════════ */
const Label = ({ children, required, hint }) => (
  <label className="block mb-1.5">
    <span className="text-[13px] font-semibold text-text-1">
      {children}{required && <span className="text-red ml-0.5">*</span>}
    </span>
    {hint && <span className="block text-[11.5px] text-text-3 mt-0.5">{hint}</span>}
  </label>
);

const Input = ({ label, hint, error, required, icon: Icon, ...props }) => (
  <div className="mb-4">
    {label && <Label required={required} hint={hint}>{label}</Label>}
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon className="w-4 h-4 text-text-3" />
        </div>
      )}
      <input
        {...props}
        className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-[14px] text-text-1
                    placeholder:text-text-4 outline-none transition-colors
                    ${Icon ? 'pl-9' : ''}
                    ${error ? 'border-red focus:border-red focus:ring-2 focus:ring-red/15'
                            : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/15'}`}
      />
    </div>
    {error && <p className="text-[12px] text-red font-medium mt-1">{error}</p>}
  </div>
);

const Textarea = ({ label, hint, error, required, maxLength, value, ...props }) => (
  <div className="mb-4">
    {label && (
      <div className="flex items-center justify-between mb-1.5">
        <Label required={required} hint={hint}>{label}</Label>
        {maxLength && <span className="text-[11px] text-text-3">{(value || '').length}/{maxLength}</span>}
      </div>
    )}
    <textarea
      {...props}
      value={value}
      maxLength={maxLength}
      rows={props.rows || 3}
      className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-[14px] text-text-1
                  placeholder:text-text-4 outline-none transition-colors resize-none
                  ${error ? 'border-red focus:border-red focus:ring-2 focus:ring-red/15'
                          : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/15'}`}
    />
    {error && <p className="text-[12px] text-red font-medium mt-1">{error}</p>}
  </div>
);

const Select = ({ label, hint, error, required, children, ...props }) => (
  <div className="mb-4">
    {label && <Label required={required} hint={hint}>{label}</Label>}
    <select
      {...props}
      className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-[14px] text-text-1
                  outline-none transition-colors appearance-none cursor-pointer
                  bg-no-repeat bg-[right_0.75rem_center]
                  ${error ? 'border-red' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/15'}`}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A8A85' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")" }}>
      {children}
    </select>
    {error && <p className="text-[12px] text-red font-medium mt-1">{error}</p>}
  </div>
);

const SectionCard = ({ icon: Icon, title, subtitle, children }) => (
  <div className="bg-white border border-border rounded-xl p-5 md:p-6 mb-4">
    <div className="flex items-start gap-3 mb-5">
      <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="font-display font-bold text-[16px] text-text-1 leading-tight">{title}</h2>
        {subtitle && <p className="text-[12.5px] text-text-3 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const ChipGroup = ({ label, options, selected, onChange, hint }) => (
  <div className="mb-4">
    <Label hint={hint}>{label}</Label>
    <div className="flex flex-wrap gap-2 mt-1">
      {options.map(opt => {
        const isOn = selected.includes(opt.value);
        const Icon = opt.icon;
        return (
          <button key={opt.value} type="button"
            onClick={() => onChange(isOn ? selected.filter(s => s !== opt.value) : [...selected, opt.value])}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[12.5px] font-medium transition-all
              ${isOn
                ? 'bg-primary border-primary text-white shadow-sm'
                : 'bg-white border-border text-text-2 hover:border-primary-mid hover:text-text-1'}`}>
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  </div>
);

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Postgrad', 'Faculty'];
const INTEREST_OPTIONS = [
  { value: 'Hackathon',     label: 'Hackathons',   icon: Code2 },
  { value: 'Cultural Fest', label: 'Cultural',     icon: Music },
  { value: 'Workshop',      label: 'Workshops',    icon: Wrench },
  { value: 'Competition',   label: 'Competitions', icon: Trophy },
  { value: 'Tech Talk',     label: 'Tech Talks',   icon: Mic2 },
  { value: 'Sports',        label: 'Sports',       icon: Volleyball },
];

/* ════════════════════════════════════════════
   AVATAR uploader
════════════════════════════════════════════ */
function AvatarUpload({ value, name, onPick, onClear, uploading }) {
  const fileRef = useRef(null);
  const initial = (name?.[0] || 'U').toUpperCase();
  return (
    <div className="flex items-center gap-4 md:gap-5">
      <div className="relative">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary to-[#7C3AED]
                        flex items-center justify-center text-white font-display font-bold text-[30px] md:text-[36px]
                        ring-4 ring-white shadow-[0_4px_16px_rgba(79,70,229,0.18)]">
          {value
            ? <img src={value} alt="" className="w-full h-full object-cover" />
            : <span>{initial}</span>}
        </div>
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/45 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-text-1 mb-0.5">Profile photo</p>
        <p className="text-[11.5px] text-text-3 mb-2.5 leading-snug">JPG or PNG · square works best · max 2 MB</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 bg-primary text-white text-[12.5px] font-semibold px-3.5 py-2 rounded-md hover:bg-primary-dark transition-colors">
            <Camera className="w-3.5 h-3.5"/>
            {value ? 'Change' : 'Upload'}
          </button>
          {value && (
            <button type="button" onClick={onClear}
              className="inline-flex items-center gap-1.5 bg-white border border-border text-text-2 text-[12.5px] font-semibold px-3.5 py-2 rounded-md hover:border-red hover:text-red transition-colors">
              <X className="w-3.5 h-3.5"/>
              Remove
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ''; }}/>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════ */
export default function EditProfile() {
  const navigate = useNavigate();
  const { isLoggedIn, requireAuth, currentUser, showToast, refreshUser } = useApp();

  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dirty, setDirty]         = useState(false);
  const [errors, setErrors]       = useState({});

  const [form, setForm] = useState({
    name: '', email: '', phone: '', avatar: '', bio: '',
    college: '', branch: '', year: '', city: '',
    interests: [],
    organization: '', designation: '', website: '',
    linkedin: '', instagram: '', github: '',
  });

  const role = currentUser?.role === 'organizer' ? 'organizer' : 'student';

  useEffect(() => {
    if (!isLoggedIn) { requireAuth(); return; }
    usersApi.me()
      .then(({ data }) => {
        const u = data.user || {};
        setForm({
          name:         u.name         || '',
          email:        u.email        || '',
          phone:        u.phone        || '',
          avatar:       u.avatar?.url  || u.avatar || '',
          bio:          u.bio          || '',
          college:      u.college      || '',
          branch:       u.branch       || u.department || '',
          year:         u.year         || '',
          city:         u.city         || '',
          interests:    Array.isArray(u.interests) ? u.interests : [],
          organization: u.organization || '',
          designation:  u.designation  || '',
          website:      u.website      || '',
          linkedin:     u.linkedin     || '',
          instagram:    u.instagram    || '',
          github:       u.github       || '',
        });
      })
      .catch(() => showToast('Could not load profile', 'error'))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const upd = (k, v) => { setForm(f => ({ ...f, [k]: v })); setDirty(true); setErrors(e => ({ ...e, [k]: undefined })); };

  const handleAvatar = async (file) => {
    if (file.size > 2 * 1024 * 1024) { showToast('Image must be under 2 MB', 'error'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const { data } = await usersApi.uploadAvatar(fd);
      const url = data.avatar?.url || data.url;
      if (url) { setForm(f => ({ ...f, avatar: url })); setDirty(true); showToast('Photo updated', 'success'); }
    } catch (e) {
      showToast(e.message || 'Could not upload photo', 'error');
    } finally { setUploading(false); }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (form.phone && !/^[+\d][\d\s-]{6,15}$/.test(form.phone)) e.phone = 'Looks invalid';
    if (form.website && !/^https?:\/\/.+/.test(form.website)) e.website = 'Must start with https://';
    if (role === 'student'   && !form.college.trim())      e.college      = 'Required';
    if (role === 'organizer' && !form.organization.trim()) e.organization = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) {
      showToast('Please fix the highlighted fields', 'error');
      document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.email;
      delete payload.avatar;
      await usersApi.updateMe(payload);
      showToast('Profile saved', 'success');
      setDirty(false);
      await refreshUser?.();
    } catch (e) {
      showToast(e.message || 'Could not save changes', 'error');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="max-w-[820px] mx-auto px-4 py-6 md:py-10 space-y-4">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-44 rounded-xl"/>)}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="bg-[#F8F8F6] min-h-screen pb-[100px] md:pb-12">

      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
        <div className="max-w-[820px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-3">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-[14px] font-medium text-text-2 hover:text-text-1 -ml-1 px-1 py-1 rounded">
            <ArrowLeft className="w-4 h-4"/>
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="font-display font-bold text-[15px] md:text-[17px] text-text-1 flex-1 text-center truncate">
            Edit Profile
          </h1>
          <button onClick={save} disabled={!dirty || saving}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-semibold transition-all
              ${!dirty || saving
                ? 'bg-surface-3 text-text-4 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-dark'}`}>
            {saving
              ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"/> Saving</>
              : <><Save className="w-3.5 h-3.5"/> Save</>}
          </button>
        </div>
      </div>

      {/* Role banner */}
      <div className="max-w-[820px] mx-auto px-4 md:px-6 pt-5 pb-2">
        <div className={`flex items-center gap-3 p-3.5 rounded-xl border
          ${role === 'organizer' ? 'bg-amber-bg border-amber-border' : 'bg-primary-light border-[#C7D2FE]'}`}>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
            ${role === 'organizer' ? 'bg-amber text-white' : 'bg-primary text-white'}`}>
            {role === 'organizer'
              ? <Building2 className="w-4 h-4"/>
              : <GraduationCap className="w-4 h-4"/>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-3">Account type</p>
            <p className="font-display font-bold text-[14px] text-text-1">
              {role === 'organizer' ? 'Event Organizer' : 'Student'}
            </p>
          </div>
          <Sparkles className="w-4 h-4 text-text-3"/>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-[820px] mx-auto px-4 md:px-6 mt-3">

        <SectionCard icon={User} title="Your photo" subtitle="A clear photo helps people recognise you.">
          <AvatarUpload value={form.avatar} name={form.name}
            onPick={handleAvatar} uploading={uploading}
            onClear={() => { setForm(f => ({ ...f, avatar: '' })); setDirty(true); }}/>
        </SectionCard>

        <SectionCard icon={User} title="Basic info" subtitle="The essentials about you.">
          <div data-error={!!errors.name}>
            <Input label="Full name" required value={form.name}
              onChange={e => upd('name', e.target.value)} error={errors.name}
              placeholder="e.g. Kailash Kumar"/>
          </div>
          <Input label="Email" hint="Email can't be changed — contact support if needed."
            value={form.email} disabled icon={Mail}/>
          <Input label="Phone" hint="Optional · not shown publicly."
            value={form.phone} onChange={e => upd('phone', e.target.value)}
            error={errors.phone} icon={Phone}
            placeholder="+91 98765 43210"/>
          <Textarea label="Bio" hint="Up to 160 characters." maxLength={160}
            value={form.bio} onChange={e => upd('bio', e.target.value)}
            placeholder={role === 'organizer'
              ? 'Tell students what your club or college is about…'
              : 'A few words about you — what you do, what excites you…'}/>
        </SectionCard>

        {role === 'student' && (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <SectionCard icon={GraduationCap} title="Academic details"
                subtitle="Helps us personalise events for your college and course.">
                <div data-error={!!errors.college}>
                  <Input label="College / University" required value={form.college}
                    onChange={e => upd('college', e.target.value)} error={errors.college}
                    icon={BookOpen}
                    placeholder="e.g. Alliance University"/>
                </div>
                <div className="grid sm:grid-cols-2 gap-x-4">
                  <Input label="Course / Branch" value={form.branch}
                    onChange={e => upd('branch', e.target.value)}
                    placeholder="e.g. B.Tech CSE"/>
                  <Select label="Year" value={form.year} onChange={e => upd('year', e.target.value)}>
                    <option value="">Select year</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </Select>
                </div>
                <Input label="City" value={form.city}
                  onChange={e => upd('city', e.target.value)}
                  icon={MapPin}
                  placeholder="e.g. Bengaluru"/>
              </SectionCard>

              <SectionCard icon={Sparkles} title="Your interests"
                subtitle="Pick what you'd love to attend — we'll surface events that match.">
                <ChipGroup
                  label=""
                  hint="Tap to toggle. Pick at least one."
                  options={INTEREST_OPTIONS}
                  selected={form.interests}
                  onChange={v => upd('interests', v)}/>
              </SectionCard>
            </motion.div>
          </AnimatePresence>
        )}

        {role === 'organizer' && (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <SectionCard icon={Building2} title="Organization details"
                subtitle="Information that appears with the events you host.">
                <div data-error={!!errors.organization}>
                  <Input label="Organization / College" required value={form.organization}
                    onChange={e => upd('organization', e.target.value)} error={errors.organization}
                    icon={Building2}
                    placeholder="e.g. IIT Bombay · Techfest"/>
                </div>
                <div className="grid sm:grid-cols-2 gap-x-4">
                  <Input label="Your designation" value={form.designation}
                    onChange={e => upd('designation', e.target.value)}
                    placeholder="e.g. Events Head"/>
                  <Input label="Department" value={form.branch}
                    onChange={e => upd('branch', e.target.value)}
                    placeholder="e.g. Student Council"/>
                </div>
                <Input label="City" value={form.city}
                  onChange={e => upd('city', e.target.value)}
                  icon={MapPin}
                  placeholder="e.g. Bengaluru"/>
                <Input label="Official website" hint="Optional · must include https://"
                  value={form.website} onChange={e => upd('website', e.target.value)}
                  error={errors.website} icon={Globe}
                  placeholder="https://yourcollege.edu.in"/>
              </SectionCard>
            </motion.div>
          </AnimatePresence>
        )}

        <SectionCard icon={IconLinkedin} title="Social links"
          subtitle="Optional — only what you want to share publicly.">
          <Input label="LinkedIn" value={form.linkedin}
            onChange={e => upd('linkedin', e.target.value)}
            icon={IconLinkedin}
            placeholder="linkedin.com/in/your-handle"/>
          <Input label="Instagram" value={form.instagram}
            onChange={e => upd('instagram', e.target.value)}
            icon={IconInstagram}
            placeholder="@your.handle"/>
          {role === 'student' && (
            <Input label="GitHub" value={form.github}
              onChange={e => upd('github', e.target.value)}
              icon={IconGithub}
              placeholder="github.com/your-handle"/>
          )}
        </SectionCard>

        <div className="hidden md:flex items-center justify-between bg-white border border-border rounded-xl p-4 mt-4">
          <p className="text-[13px] text-text-3">
            {dirty ? 'You have unsaved changes.' : 'All changes saved.'}
          </p>
          <button onClick={save} disabled={!dirty || saving}
            className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md text-[14px] font-semibold transition-all
              ${!dirty || saving
                ? 'bg-surface-3 text-text-4 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-dark'}`}>
            {saving
              ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"/> Saving</>
              : <><Check className="w-4 h-4"/> Save changes</>}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {dirty && (
          <motion.div
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-border px-4 py-3
                       shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
            <button onClick={save} disabled={saving}
              className="w-full bg-primary text-white font-display font-bold text-[15px] py-3 rounded-lg
                         hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
              {saving
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Saving…</>
                : <><Save className="w-4 h-4"/> Save changes</>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
