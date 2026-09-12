// src/pages/ca/CampusAmbassadorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Trophy, Rocket, Megaphone, GraduationCap, QrCode, IdCard,
  ChevronDown, CheckCircle2, MapPin, Star, Handshake, Sparkles,
  Copy, Check, Share2, ExternalLink, ArrowLeft, ArrowRight,
  Clock, AlertCircle, RefreshCw, ShieldCheck, Download, Award,
  Building, Calendar, Send, MessageCircle, FileText, ChevronRight,
  HelpCircle, BookOpen, UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ca } from '../../services/api';
import { PUBLIC_SITE_URL, getReferralUrl, sanitizeShareUrl } from '../../config/site';

const QR_ROWS = [
  [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,0,1,0,1,0,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,0,1,0,1,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0],
  [1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0],
  [0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1],
  [1,1,1,1,1,1,1,0,0,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,1,0,0,1,0,0,1,1,0],
  [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1],
  [1,0,1,1,1,0,1,0,1,0,0,1,0,1,0,1,0],
  [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,1,0],
  [1,0,0,0,0,0,1,0,1,0,0,1,0,1,0,0,1],
  [1,1,1,1,1,1,1,0,0,1,1,0,1,0,1,1,0],
];

function QRMark({ size = 68 }) {
  const cell = size / QR_ROWS.length;
  return (
    <div style={{ width: size, height: size }} className="bg-white rounded-md p-1 shrink-0">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {QR_ROWS.map((row, r) =>
          row.map((bit, c) =>
            bit ? (
              <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="#1e1b4b" />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}

function exportCardAsPNG(profile) {
  return new Promise((resolve, reject) => {
    try {
      const scale = 2; // 2x for retina crispness
      const w = 620;
      const h = 380;
      const canvas = document.createElement('canvas');
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);

      function roundRect(x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
      }

      // Outer gradient border
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#4f46e5');
      grad.addColorStop(0.5, '#6366f1');
      grad.addColorStop(1, '#c026d3');

      ctx.fillStyle = grad;
      roundRect(8, 8, w - 16, h - 16, 22);
      ctx.fill();

      // Inner card background
      ctx.fillStyle = '#ffffff';
      roundRect(10, 10, w - 20, h - 20, 20);
      ctx.fill();

      // Top header sheen
      const sheen = ctx.createLinearGradient(10, 10, w - 20, 100);
      sheen.addColorStop(0, 'rgba(238, 242, 255, 0.45)');
      sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sheen;
      roundRect(10, 10, w - 20, 100, 20);
      ctx.fill();

      // Header Brand
      ctx.fillStyle = '#4f46e5';
      ctx.font = 'bold 24px "DM Sans", sans-serif';
      ctx.fillText('FestNest', 36, 50);

      // Header Badge (Official Ambassador)
      const badgeText = 'OFFICIAL AMBASSADOR';
      ctx.font = 'bold 11px "Geist Mono", monospace';
      const badgeMetrics = ctx.measureText(badgeText);
      const badgeW = badgeMetrics.width + 20;
      const badgeH = 24;
      const badgeX = w - 36 - badgeW;
      const badgeY = 34;

      ctx.fillStyle = '#fdf4ff';
      roundRect(badgeX, badgeY, badgeW, badgeH, 12);
      ctx.fill();
      ctx.strokeStyle = '#f5d0fe';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#c026d3';
      ctx.fillText(badgeText, badgeX + 10, badgeY + 16);

      // Draw Avatar
      const avatarX = 36;
      const avatarY = 82;
      const avatarSize = 74;

      const finishDrawingContent = (img) => {
        if (img) {
          ctx.save();
          roundRect(avatarX, avatarY, avatarSize, avatarSize, 16);
          ctx.clip();
          ctx.drawImage(img, avatarX, avatarY, avatarSize, avatarSize);
          ctx.restore();
          ctx.strokeStyle = '#e0e7ff';
          ctx.lineWidth = 1.5;
          roundRect(avatarX, avatarY, avatarSize, avatarSize, 16);
          ctx.stroke();
        } else {
          ctx.fillStyle = '#eef2ff';
          roundRect(avatarX, avatarY, avatarSize, avatarSize, 16);
          ctx.fill();
          ctx.strokeStyle = '#e0e7ff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#4f46e5';
          ctx.font = 'bold 26px "Clash Display", sans-serif';
          ctx.textAlign = 'center';
          const initials = profile.name
            ? profile.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
            : 'CA';
          ctx.fillText(initials, avatarX + avatarSize / 2, avatarY + avatarSize / 2 + 9);
          ctx.textAlign = 'left';
        }

        // Name & College
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 22px "Clash Display", sans-serif';
        const displayName = profile.name || 'Campus Ambassador';
        ctx.fillText(displayName, 126, 110);

        ctx.fillStyle = '#64748b';
        ctx.font = '13px "Satoshi", sans-serif';
        const sub = `${profile.college || 'College'}, ${profile.city || 'India'}`;
        ctx.fillText(sub.length > 40 ? sub.slice(0, 38) + '…' : sub, 126, 132);

        // Tier pill
        const tier = (profile.tier || 'Bronze').toUpperCase() + ' TIER';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        const tierMetrics = ctx.measureText(tier);
        const tierW = tierMetrics.width + 16;
        const tierH = 22;
        const tierX = 126;
        const tierY = 142;

        let tierBg = '#fffbeb';
        let tierColor = '#b45309';
        let tierBorder = '#fef3c7';
        if (profile.tier === 'City Lead') {
          tierBg = '#fdf4ff';
          tierColor = '#c026d3';
          tierBorder = '#f5d0fe';
        } else if (profile.tier === 'Gold') {
          tierBg = '#fffbeb';
          tierColor = '#d97706';
          tierBorder = '#fde68a';
        } else if (profile.tier === 'Silver') {
          tierBg = '#f8fafc';
          tierColor = '#475569';
          tierBorder = '#e2e8f0';
        }

        ctx.fillStyle = tierBg;
        roundRect(tierX, tierY, tierW, tierH, 11);
        ctx.fill();
        ctx.strokeStyle = tierBorder;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = tierColor;
        ctx.fillText(tier, tierX + 8, tierY + 15);

        // Divider line
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(36, 184);
        ctx.lineTo(w - 36, 184);
        ctx.stroke();

        // Ambassador ID
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 10px "Geist Mono", monospace';
        ctx.fillText('AMBASSADOR ID', 36, 216);

        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 19px "Geist Mono", monospace';
        ctx.fillText(profile.caId || 'FN-CA-PENDING', 36, 242);

        // Valid Thru
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 10px "Geist Mono", monospace';
        ctx.fillText('VALID THRU', 36, 274);

        ctx.fillStyle = '#475569';
        ctx.font = 'bold 13px "Geist Mono", monospace';
        ctx.fillText(profile.validThru || '09 / 2028', 36, 296);

        // Referral Code
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 10px "Geist Mono", monospace';
        ctx.fillText('REFERRAL CODE', 220, 216);

        ctx.fillStyle = '#4f46e5';
        ctx.font = 'bold 16px "Geist Mono", monospace';
        ctx.fillText(profile.referralCode || '—', 220, 242);

        // Campus Region
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 10px "Geist Mono", monospace';
        ctx.fillText('CAMPUS REGION', 220, 274);

        ctx.fillStyle = '#475569';
        ctx.font = 'bold 13px "Geist Mono", monospace';
        ctx.fillText(profile.city || 'India', 220, 296);

        // QR Pattern
        const qrSize = 88;
        const qrX = w - 36 - qrSize;
        const qrY = 208;
        const cellSize = qrSize / QR_ROWS.length;

        ctx.fillStyle = '#ffffff';
        roundRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 10);
        ctx.fill();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#1e1b4b';
        for (let r = 0; r < QR_ROWS.length; r++) {
          for (let c = 0; c < QR_ROWS[r].length; c++) {
            if (QR_ROWS[r][c]) {
              ctx.fillRect(qrX + c * cellSize, qrY + r * cellSize, cellSize, cellSize);
            }
          }
        }

        // Export to Blob
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Canvas export failed'));
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `FestNest-Ambassador-${profile.caId || 'Card'}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          resolve();
        }, 'image/png');
      };

      if (profile.photoUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => finishDrawingContent(img);
        img.onerror = () => finishDrawingContent(null);
        img.src = profile.photoUrl;
      } else {
        finishDrawingContent(null);
      }
    } catch (err) {
      reject(err);
    }
  });
}

function LiveIDCard({ profile, tilt = false }) {
  const tierColor =
    profile.tier === 'City Lead'
      ? 'bg-fuchsia-50 text-fuchsia-600'
      : profile.tier === 'Gold'
      ? 'bg-amber-50 text-amber-600'
      : profile.tier === 'Silver'
      ? 'bg-slate-100 text-slate-700'
      : 'bg-amber-50 text-amber-700';

  return (
    <div
      id="festnest-ca-card"
      className={`relative w-full max-w-sm rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-fuchsia-600 p-[1.5px] shadow-xl ${
        tilt ? '-rotate-1 hover:rotate-0 transition-transform duration-300' : ''
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl bg-white p-4 sm:p-6">
        <div className="pointer-events-none absolute -inset-10 opacity-30">
          <div className="fn-sheen h-40 w-16 bg-white blur-md" />
        </div>

        <div className="flex items-center justify-between">
          <span className="font-heading text-base font-bold tracking-tight text-indigo-600">FestNest</span>
          <span className="rounded-full bg-fuchsia-50 border border-fuchsia-100 px-2.5 py-0.5 text-[10px] font-bold text-fuchsia-600 font-mono">
            OFFICIAL AMBASSADOR
          </span>
        </div>

        <div className="mt-4 sm:mt-5 flex gap-3 sm:gap-4 items-center">
          {profile.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt={profile.name}
              className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-xl object-cover border border-indigo-100 shadow-sm"
            />
          ) : (
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-500 font-bold text-lg font-heading">
              {profile.name
                ? profile.name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : 'CA'}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-heading text-lg sm:text-xl font-bold text-slate-900 leading-tight truncate">
              {profile.name}
            </span>
            <span className="font-sans text-xs sm:text-sm text-slate-500 truncate mt-0.5">
              {profile.college}, {profile.city}
            </span>
            <span className={`mt-2 inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold font-mono ${tierColor}`}>
              {profile.tier?.toUpperCase()} TIER
            </span>
          </div>
        </div>

        <div className="mt-5 sm:mt-6 flex items-end justify-between border-t border-slate-100 pt-3.5 sm:pt-4">
          <div>
            <div className="font-mono text-[9px] font-semibold tracking-wider text-slate-400">AMBASSADOR ID</div>
            <div className="font-mono text-sm sm:text-base font-bold text-slate-800 tracking-tight">
              {profile.caId || 'FN-CA-PENDING'}
            </div>
            <div className="font-mono mt-2 text-[9px] font-semibold tracking-wider text-slate-400">VALID THRU</div>
            <div className="font-mono text-xs font-medium text-slate-600">{profile.validThru || '09 / 2028'}</div>
          </div>
          <QRMark size={64} />
        </div>
      </div>
    </div>
  );
}

export default function CampusAmbassadorDashboard() {
  const navigate = useNavigate();
  const { isLoggedIn, requireAuth, showToast } = useApp();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'ledger' | 'toolkit' | 'guidelines'
  const [impactLogs, setImpactLogs] = useState([]);
  const [impactLoading, setImpactLoading] = useState(false);
  const [impactTotal, setImpactTotal] = useState(0);
  const [ledgerFilter, setLedgerFilter] = useState('all'); // 'all' | 'student' | 'organizer' | 'event'

  const handleDownloadCard = async () => {
    if (!profile) return;
    setDownloading(true);
    try {
      await exportCardAsPNG(profile);
      showToast?.('Ambassador ID Card downloaded as PNG!', 'success');
    } catch (err) {
      console.error('Failed to export card PNG', err);
      showToast?.('Failed to download card. Please try again.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const fetchImpact = async () => {
    setImpactLoading(true);
    try {
      const res = await ca.myImpact({ page: 1, limit: 100 });
      setImpactLogs(res.data?.logs || []);
      setImpactTotal(res.data?.total || 0);
    } catch (err) {
      console.error('Failed to load CA impact logs', err);
    } finally {
      setImpactLoading(false);
    }
  };

  const fetchProfile = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await ca.me();
      setProfile(res.data?.profile || null);
      fetchImpact();
      if (silent) showToast?.('Ambassador stats updated!', 'success');
    } catch (err) {
      console.error('Failed to load CA profile', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchProfile();
      fetchImpact();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Canonical share URLs (strictly uses clean site domain, never vercel.app or onrender.com)
  const generalUrl = profile?.referralCode ? getReferralUrl(profile.referralCode) : '';
  const hostUrl = profile?.referralCode ? getReferralUrl(profile.referralCode, 'host') : '';
  const exploreUrl = profile?.referralCode ? getReferralUrl(profile.referralCode, 'explore') : '';

  const copyToClipboard = (text, key, message = 'Copied to clipboard!') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast?.(message, 'success');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleShareBadge = () => {
    if (!profile) return;
    const shareData = {
      title: `${profile.name} - FestNest Campus Ambassador`,
      text: `Join FestNest to discover verified college fests, hackathons, and student competitions across India! Use ambassador code ${profile.referralCode}`,
      url: generalUrl,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      copyToClipboard(generalUrl, 'general', 'Ambassador link copied to clipboard!');
    }
  };

  const handleWhatsAppShare = (type = 'student') => {
    if (!profile?.referralCode) return;
    const text = type === 'organizer'
      ? `Hey! If you're hosting an inter-college fest, hackathon, or competition at ${profile.college || 'college'}, publish it on FestNest to reach verified students across India: ${hostUrl}`
      : `Hey everyone! Join FestNest to discover verified hackathons, fests, and workshops happening across Indian colleges: ${generalUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const linkedInTemplate = profile
    ? `Excited to announce that I have joined FestNest as an official Campus Ambassador for ${profile.college || 'my college'}! 🎓\n\nFestNest brings together verified college events — hackathons, tech fests, workshops, and competitions — onto one platform for Indian students.\n\nIf you lead a campus club or organize student events, reach out or host your event directly on FestNest: ${hostUrl}\n\n#FestNest #CampusAmbassador #CollegeFests #Hackathons #StudentLeadership`
    : '';

  // State 1: Unauthenticated
  if (!isLoggedIn) {
    return (
      <div className="font-sans min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-5 shadow-sm">
            <IdCard size={28} />
          </div>
          <h2 className="font-heading text-2xl font-bold text-slate-900">Campus Ambassador Portal</h2>
          <p className="font-sans mt-2.5 text-sm text-slate-600 leading-relaxed">
            Please log in with your FestNest account to access your ambassador credentials, live referral hub, and real-time impact tracking.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => requireAuth()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
            >
              Log In to Portal
            </button>
            <Link
              to="/campus-ambassador"
              className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition text-center"
            >
              Learn About CA Program
            </Link>
            <Link
              to="/home"
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition pt-2"
            >
              ← Back to FestNest Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Loading
  if (loading) {
    return (
      <div className="font-sans min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block animate-spin text-indigo-600 mb-3">
            <RefreshCw size={30} />
          </div>
          <p className="font-sans text-sm text-slate-600 font-medium">Loading ambassador portal...</p>
        </div>
      </div>
    );
  }

  // State 3: Logged In, Not Applied
  if (!profile) {
    return (
      <div className="font-sans min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-fuchsia-50 text-fuchsia-600 mx-auto flex items-center justify-center mb-5 shadow-sm">
            <Sparkles size={28} />
          </div>
          <h2 className="font-heading text-2xl font-bold text-slate-900">Become an Ambassador</h2>
          <p className="font-sans mt-2.5 text-sm text-slate-600 leading-relaxed">
            You haven't applied for the FestNest Campus Ambassador program yet. Represent your college, onboard campus clubs, and receive verified digital credentials.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              to="/campus-ambassador#apply"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-sm text-center"
            >
              Apply to become a CA
            </Link>
            <Link
              to="/home"
              className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State 4: Application Submitted / Screening
  if (profile.status === 'applied' || profile.status === 'screening') {
    return (
      <div className="font-sans min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-lg">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <span className="font-heading text-xl font-bold text-indigo-600">FestNest</span>
              <h2 className="font-heading text-2xl font-bold text-slate-900 mt-1">Application Status</h2>
            </div>
            <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700 font-mono uppercase">
              {profile.status}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={16} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-sans font-semibold text-slate-900 text-sm">Application Submitted</h4>
                <p className="font-sans text-xs text-slate-500 mt-0.5">
                  Applied for {profile.college}, {profile.city}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                <Clock size={16} />
              </div>
              <div>
                <h4 className="font-sans font-semibold text-slate-900 text-sm">Campus Screening &amp; Review</h4>
                <p className="font-sans text-xs text-slate-500 mt-0.5">
                  Our team reviews each applicant's campus involvement. You will receive an update via email.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 opacity-50">
              <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                <IdCard size={16} />
              </div>
              <div>
                <h4 className="font-sans font-semibold text-slate-900 text-sm">Credential &amp; ID Card Issuance</h4>
                <p className="font-sans text-xs text-slate-500 mt-0.5">
                  Upon approval, your official CA ID and referral link unlock here.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
            <Link
              to="/home"
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold text-center transition"
            >
              Back to Home
            </Link>
            <button
              onClick={() => fetchProfile(true)}
              disabled={refreshing}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State 5: Rejected
  if (profile.status === 'rejected') {
    return (
      <div className="font-sans min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-5 shadow-sm">
            <AlertCircle size={28} />
          </div>
          <h2 className="font-heading text-2xl font-bold text-slate-900">Application Update</h2>
          <p className="font-sans mt-2.5 text-sm text-slate-600 leading-relaxed">
            Thank you for your interest in representing {profile.college}. We were unable to move forward with your application for the current cohort.
          </p>
          {profile.rejectionReason && (
            <p className="mt-3 p-3.5 bg-slate-50 rounded-xl text-xs text-slate-600 italic border border-slate-200/60">
              "{profile.rejectionReason}"
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3">
            <Link
              to="/explore"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-sm text-center"
            >
              Explore Events on FestNest
            </Link>
            <Link
              to="/support"
              className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition text-center"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State 6: APPROVED - Dedicated Campus Ambassador Portal
  const stats = profile.stats || {
    organizersOnboarded: 0,
    eventsSourced: 0,
    referralSignups: 0,
    tier: profile.tier || 'Bronze',
  };

  // Tier thresholds: Bronze (0–2), Silver (3–7), Gold (8–15), City Lead (16+)
  const currentOrganizers = stats.organizersOnboarded;
  let nextTierName = 'Silver';
  let nextThreshold = 3;
  let currentBase = 0;

  if (currentOrganizers >= 16) {
    nextTierName = 'Maximum Tier (City Lead)';
    nextThreshold = 16;
    currentBase = 16;
  } else if (currentOrganizers >= 8) {
    nextTierName = 'City Lead';
    nextThreshold = 16;
    currentBase = 8;
  } else if (currentOrganizers >= 3) {
    nextTierName = 'Gold';
    nextThreshold = 8;
    currentBase = 3;
  } else {
    nextTierName = 'Silver';
    nextThreshold = 3;
    currentBase = 0;
  }

  const progressPct =
    currentOrganizers >= 16
      ? 100
      : Math.min(100, Math.round(((currentOrganizers - currentBase) / (nextThreshold - currentBase)) * 100));

  const filteredLogs = impactLogs.filter((log) => {
    if (ledgerFilter === 'all') return true;
    return log.type === ledgerFilter;
  });

  const studentCount = impactLogs.filter((l) => l.type === 'student').length;
  const organizerCount = impactLogs.filter((l) => l.type === 'organizer').length;
  const eventCount = impactLogs.filter((l) => l.type === 'event').length;

  return (
    <div className="font-sans min-h-screen bg-slate-50 text-slate-900 pb-16">

      {/* Top Header & Breadcrumb Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-2 text-xs">
            <Link to="/home" className="text-slate-500 hover:text-indigo-600 transition font-medium">
              Home
            </Link>
            <ChevronRight size={13} className="text-slate-400" />
            <Link to="/campus-ambassador" className="text-slate-500 hover:text-indigo-600 transition font-medium">
              Campus Ambassador
            </Link>
            <ChevronRight size={13} className="text-slate-400" />
            <span className="font-semibold text-slate-800">Portal</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => fetchProfile(true)}
              disabled={refreshing}
              title="Sync Ambassador Data"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin text-indigo-600' : ''} />
              <span className="hidden sm:inline">Sync Stats</span>
            </button>

            <Link
              to="/explore"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition"
            >
              Explore
            </Link>

            <Link
              to="/host"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition"
            >
              + Host Event
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Ambassador Profile Card */}
      <div className="bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.name}
                  className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-2xl object-cover border-2 border-indigo-400/30 shadow-lg"
                />
              ) : (
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-indigo-600/50 border-2 border-indigo-400/30 text-white font-bold text-2xl font-heading shadow-lg">
                  {profile.name
                    ? profile.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
                    : 'CA'}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    {profile.name}
                  </h1>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                    Active CA
                  </span>
                </div>

                <p className="font-sans text-xs sm:text-sm text-indigo-200 mt-1 flex items-center gap-1.5 flex-wrap">
                  <GraduationCap size={15} className="text-indigo-400" />
                  <span>{profile.college}</span>
                  <span className="text-indigo-400">•</span>
                  <MapPin size={13} className="text-indigo-400" />
                  <span>{profile.city}</span>
                </p>

                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1 rounded-lg text-xs font-mono">
                    <span className="text-indigo-300 font-semibold">CA-ID:</span>
                    <span className="text-white font-bold">{profile.caId || 'FN-CA-PENDING'}</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1 rounded-lg text-xs font-mono">
                    <span className="text-indigo-300 font-semibold">Code:</span>
                    <span className="text-amber-300 font-bold">{profile.referralCode}</span>
                    <button
                      onClick={() => copyToClipboard(profile.referralCode, 'code', 'Ambassador code copied!')}
                      className="ml-1 text-slate-300 hover:text-white transition"
                      title="Copy code"
                    >
                      {copiedKey === 'code' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>

                  <div className="text-xs text-indigo-300 font-sans">
                    Valid thru: <span className="text-white font-mono font-medium">{profile.validThru || '09 / 2028'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Share Actions */}
            <div className="flex items-center gap-2.5 sm:self-center">
              <button
                onClick={() => copyToClipboard(generalUrl, 'general', 'Referral link copied to clipboard!')}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-sm"
              >
                {copiedKey === 'general' ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedKey === 'general' ? 'Link Copied!' : 'Copy Referral Link'}</span>
              </button>

              <button
                onClick={handleShareBadge}
                className="inline-flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-white/15 transition"
                title="Share Ambassador Badge"
              >
                <Share2 size={14} />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="mt-8 flex items-center gap-2 overflow-x-auto max-w-full pb-1 text-xs font-semibold scrollbar-none">
            {[
              { id: 'overview', label: 'Overview & Impact', icon: <Trophy size={14} /> },
              { id: 'ledger', label: 'Activity Ledger', count: impactTotal, icon: <Award size={14} /> },
              { id: 'toolkit', label: 'Outreach Toolkit & Links', icon: <Megaphone size={14} /> },
              { id: 'guidelines', label: 'Tier Perks & Handbook', icon: <BookOpen size={14} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 whitespace-nowrap inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl transition ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-indigo-200 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={`shrink-0 inline-flex items-center justify-center min-w-[20px] ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      activeTab === tab.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-white/15 text-white'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 mt-8">

        {/* TAB 1: OVERVIEW & IMPACT */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 4 Stat Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <Trophy size={20} />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-900">
                  {stats.organizersOnboarded}
                </div>
                <div className="font-sans text-xs font-medium text-slate-500 mt-1">
                  Organizers Onboarded
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center mb-3">
                  <Rocket size={20} />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-900">
                  {stats.eventsSourced}
                </div>
                <div className="font-sans text-xs font-medium text-slate-500 mt-1">
                  Events Sourced
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                  <Users size={20} />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-900">
                  {stats.referralSignups}
                </div>
                <div className="font-sans text-xs font-medium text-slate-500 mt-1">
                  Student Signups
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                  <Award size={20} />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-900">
                  {profile.tier || 'Bronze'}
                </div>
                <div className="font-sans text-xs font-medium text-slate-500 mt-1">
                  Current Tier
                </div>
              </div>
            </div>

            {/* Tier Milestone Progress */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Tier Progression
                  </span>
                  <h3 className="font-heading text-lg font-bold text-slate-900 mt-0.5">
                    {profile.tier} Ambassador Milestone
                  </h3>
                </div>
                <div className="sm:text-right">
                  <span className="font-mono text-xs font-semibold text-indigo-600">
                    Next: {nextTierName}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentOrganizers >= 16
                      ? 'Maximum tier achieved!'
                      : `${nextThreshold - currentOrganizers} more organizer${nextThreshold - currentOrganizers === 1 ? '' : 's'} needed`}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-fuchsia-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span className={profile.tier === 'Bronze' ? 'font-bold text-indigo-600' : ''}>Bronze (0)</span>
                <span className={profile.tier === 'Silver' ? 'font-bold text-indigo-600' : ''}>Silver (3)</span>
                <span className={profile.tier === 'Gold' ? 'font-bold text-indigo-600' : ''}>Gold (8)</span>
                <span className={profile.tier === 'City Lead' ? 'font-bold text-indigo-600' : ''}>City Lead (16+)</span>
              </div>
            </div>

            {/* Split Row: Digital ID Card & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* ID Card Display */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-4">
                  <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
                    <IdCard size={18} className="text-indigo-600" />
                    <span>Official Ambassador ID</span>
                  </h3>
                  <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                    VERIFIED
                  </span>
                </div>

                <LiveIDCard profile={profile} tilt={false} />

                <div className="mt-6 w-full grid grid-cols-2 gap-3">
                  <button
                    onClick={handleDownloadCard}
                    disabled={downloading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
                  >
                    <Download size={14} />
                    <span>{downloading ? 'Downloading...' : 'Download (PNG)'}</span>
                  </button>

                  <button
                    onClick={handleShareBadge}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Share2 size={14} />
                    <span>Share Badge</span>
                  </button>
                </div>
              </div>

              {/* Quick Links & Toolkit preview */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-heading text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <Rocket size={18} className="text-indigo-600" />
                    <span>Quick Outreach Links</span>
                  </h3>
                  <p className="font-sans text-xs text-slate-500 mb-4">
                    All links are pre-configured with your ambassador code.
                  </p>

                  <div className="space-y-3">
                    {/* General Link */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900">General Discover Link</div>
                        <div className="text-[11px] font-mono text-slate-500 truncate">{generalUrl}</div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(generalUrl, 'general-preview', 'Link copied!')}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shrink-0"
                      >
                        {copiedKey === 'general-preview' ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    {/* Host Link */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900">Organizer Onboarding Link</div>
                        <div className="text-[11px] font-mono text-slate-500 truncate">{hostUrl}</div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(hostUrl, 'host-preview', 'Organizer link copied!')}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shrink-0"
                      >
                        {copiedKey === 'host-preview' ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    {/* Explore Link */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900">Student Event Discovery Link</div>
                        <div className="text-[11px] font-mono text-slate-500 truncate">{exploreUrl}</div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(exploreUrl, 'explore-preview', 'Student link copied!')}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shrink-0"
                      >
                        {copiedKey === 'explore-preview' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setActiveTab('toolkit')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                    >
                      <span>Open full Outreach Toolkit</span>
                      <ArrowRight size={13} />
                    </button>

                    <button
                      onClick={() => setActiveTab('ledger')}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
                    >
                      <span>View Activity Ledger</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Important Platform Guidelines note */}
                <div className="bg-indigo-50/60 rounded-2xl border border-indigo-100 p-5 flex items-start gap-3">
                  <Sparkles size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-indigo-950 leading-relaxed">
                    <span className="font-semibold block mb-0.5">Campus Ambassador Tip:</span>
                    Share your organizer onboarding link with cultural, sports, and tech symposium heads. When their events are approved, your tier and sourced metrics update automatically.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVITY LEDGER */}
        {activeTab === 'ledger' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Award size={20} className="text-indigo-600" />
                  <span>Ambassador Referral Ledger</span>
                </h2>
                <p className="font-sans text-xs text-slate-500 mt-1">
                  Verified record of students, organizers, and campus events attributed to code <span className="font-mono font-bold text-slate-700">{profile.referralCode}</span>.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto overflow-x-auto max-w-full scrollbar-none">
                <button
                  onClick={() => setLedgerFilter('all')}
                  className={`shrink-0 whitespace-nowrap min-h-[36px] px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5 ${
                    ledgerFilter === 'all' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>All</span>
                  <span className="shrink-0 inline-flex items-center justify-center min-w-[18px] px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/80">
                    {impactTotal}
                  </span>
                </button>
                <button
                  onClick={() => setLedgerFilter('student')}
                  className={`shrink-0 whitespace-nowrap min-h-[36px] px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5 ${
                    ledgerFilter === 'student' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Students</span>
                  <span className="shrink-0 inline-flex items-center justify-center min-w-[18px] px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/80">
                    {studentCount}
                  </span>
                </button>
                <button
                  onClick={() => setLedgerFilter('organizer')}
                  className={`shrink-0 whitespace-nowrap min-h-[36px] px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5 ${
                    ledgerFilter === 'organizer' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Organizers</span>
                  <span className="shrink-0 inline-flex items-center justify-center min-w-[18px] px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/80">
                    {organizerCount}
                  </span>
                </button>
                <button
                  onClick={() => setLedgerFilter('event')}
                  className={`shrink-0 whitespace-nowrap min-h-[36px] px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5 ${
                    ledgerFilter === 'event' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Events</span>
                  <span className="shrink-0 inline-flex items-center justify-center min-w-[18px] px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/80">
                    {eventCount}
                  </span>
                </button>
              </div>
            </div>

            {/* List or Empty State */}
            {impactLoading ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-indigo-600" />
                Updating activity ledger...
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-14 text-center border-2 border-dashed border-slate-200 rounded-2xl p-6">
                <Users size={32} className="mx-auto text-slate-300 mb-3" />
                <h3 className="font-heading text-sm font-bold text-slate-700">No activity recorded yet</h3>
                <p className="font-sans text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Share your ambassador referral link with campus clubs or students. As they sign up and host fests, your entries will appear here.
                </p>
                <button
                  onClick={() => copyToClipboard(generalUrl, 'empty-share', 'Link copied!')}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
                >
                  <Copy size={13} />
                  <span>Copy Your Referral Link</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                      <th className="pb-3 font-semibold">Entity / Label</th>
                      <th className="pb-3 font-semibold">Type</th>
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLogs.map((log, idx) => {
                      const badgeColor =
                        log.type === 'organizer'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : log.type === 'event'
                          ? 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                      return (
                        <tr key={log._id || idx} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 font-semibold text-slate-900 flex items-center gap-2">
                            {log.type === 'organizer' && <Building size={14} className="text-indigo-600 shrink-0" />}
                            {log.type === 'event' && <Calendar size={14} className="text-fuchsia-600 shrink-0" />}
                            {log.type === 'student' && <Users size={14} className="text-emerald-600 shrink-0" />}
                            <span className="truncate max-w-xs">{log.label || 'FestNest Member'}</span>
                          </td>
                          <td className="py-3">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-bold border ${badgeColor}`}>
                              {log.type}
                            </span>
                          </td>
                          <td className="py-3 text-slate-500 font-mono text-[11px]">
                            {log.createdAt ? new Date(log.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }) : '—'}
                          </td>
                          <td className="py-3 text-right">
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold font-mono text-[11px]">
                              <CheckCircle2 size={12} />
                              <span>Verified</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: OUTREACH TOOLKIT & LINKS */}
        {activeTab === 'toolkit' && (
          <div className="space-y-6">
            {/* Direct Links Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
              <div>
                <h2 className="font-heading text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Megaphone size={20} className="text-indigo-600" />
                  <span>Ambassador Referral Links</span>
                </h2>
                <p className="font-sans text-xs text-slate-500 mt-1">
                  Each link automatically carries your referral tracking code to ensure credit for your college.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {/* General Link */}
                <div className="rounded-2xl p-5 border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900">General Referral Link</span>
                      <Sparkles size={14} className="text-indigo-600" />
                    </div>
                    <p className="text-xs text-slate-500 mb-3">
                      Best for general sharing in batch groups, Instagram bios, and personal intros.
                    </p>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-600 truncate select-all mb-4">
                      {generalUrl}
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(generalUrl, 'tk-general', 'General referral link copied!')}
                    className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 rounded-xl transition"
                  >
                    {copiedKey === 'tk-general' ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedKey === 'tk-general' ? 'Copied to Clipboard!' : 'Copy Link'}</span>
                  </button>
                </div>

                {/* Organizer Link */}
                <div className="rounded-2xl p-5 border border-indigo-200 bg-indigo-50/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-indigo-950">Organizer Host Link</span>
                      <Trophy size={14} className="text-indigo-600" />
                    </div>
                    <p className="text-xs text-slate-500 mb-3">
                      Directs club leads &amp; fest convenors straight to the event publishing studio.
                    </p>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-600 truncate select-all mb-4">
                      {hostUrl}
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(hostUrl, 'tk-host', 'Host referral link copied!')}
                    className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 rounded-xl transition"
                  >
                    {copiedKey === 'tk-host' ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedKey === 'tk-host' ? 'Copied to Clipboard!' : 'Copy Link'}</span>
                  </button>
                </div>

                {/* Student Explore Link */}
                <div className="rounded-2xl p-5 border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900">Student Explore Link</span>
                      <Users size={14} className="text-fuchsia-600" />
                    </div>
                    <p className="text-xs text-slate-500 mb-3">
                      Takes students to explore verified inter-college hackathons and competitions.
                    </p>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-600 truncate select-all mb-4">
                      {exploreUrl}
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(exploreUrl, 'tk-explore', 'Explore referral link copied!')}
                    className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 rounded-xl transition"
                  >
                    {copiedKey === 'tk-explore' ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedKey === 'tk-explore' ? 'Copied to Clipboard!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Social Share & Templates */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* WhatsApp Launchers */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <MessageCircle size={18} className="text-emerald-600" />
                  <h3 className="font-heading text-base font-bold text-slate-900">WhatsApp 1-Click Share</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Launch pre-written WhatsApp messages directly to students or club organizers.
                </p>

                <div className="space-y-2.5">
                  <button
                    onClick={() => handleWhatsAppShare('student')}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-emerald-50/40 hover:bg-emerald-50 flex items-center justify-between text-xs font-semibold text-emerald-900 transition"
                  >
                    <span className="flex items-center gap-2">
                      <Send size={14} className="text-emerald-600" />
                      <span>Share with Students &amp; Classmates</span>
                    </span>
                    <ExternalLink size={13} className="text-emerald-500" />
                  </button>

                  <button
                    onClick={() => handleWhatsAppShare('organizer')}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-indigo-50/40 hover:bg-indigo-50 flex items-center justify-between text-xs font-semibold text-indigo-900 transition"
                  >
                    <span className="flex items-center gap-2">
                      <Trophy size={14} className="text-indigo-600" />
                      <span>Share with Club Leads &amp; Organizers</span>
                    </span>
                    <ExternalLink size={13} className="text-indigo-500" />
                  </button>
                </div>
              </div>

              {/* LinkedIn Announcement Template */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-blue-600" />
                    <h3 className="font-heading text-base font-bold text-slate-900">LinkedIn Post Template</h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(linkedInTemplate, 'linkedin', 'LinkedIn template copied!')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {copiedKey === 'linkedin' ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedKey === 'linkedin' ? 'Copied' : 'Copy Post'}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-sans leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">
                  {linkedInTemplate}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TIER BENEFITS & HANDBOOK */}
        {activeTab === 'guidelines' && (
          <div className="space-y-6">
            {/* Tier Perks Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
              <div>
                <h2 className="font-heading text-xl font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap size={20} className="text-indigo-600" />
                  <span>Campus Ambassador Tier Progression</span>
                </h2>
                <p className="font-sans text-xs text-slate-500 mt-1">
                  Your tier updates automatically as student organizers from your college submit events with your link.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                {[
                  {
                    tier: 'Bronze',
                    req: '0–2 Organizers',
                    perks: ['Official FestNest ID Card', 'Verified Ambassador Number', 'Starter Outreach Kit', 'Community WhatsApp Access'],
                    active: profile.tier === 'Bronze',
                    color: 'text-amber-800 bg-amber-50 border-amber-200',
                  },
                  {
                    tier: 'Silver',
                    req: '3–7 Organizers',
                    perks: ['Official FestNest Merch Drop', 'Priority Event Hosting Approval', 'Resume Recommendation Letter', 'Early Feature Beta Access'],
                    active: profile.tier === 'Silver',
                    color: 'text-slate-700 bg-slate-100 border-slate-300',
                  },
                  {
                    tier: 'Gold',
                    req: '8–15 Organizers',
                    perks: ['Cash Reward Milestone', 'Founder Direct Shoutout', 'Featured Badge on FestNest Home', 'Quarterly Leadership Calls'],
                    active: profile.tier === 'Gold',
                    color: 'text-amber-700 bg-amber-50/80 border-amber-300',
                  },
                  {
                    tier: 'City Lead',
                    req: '16+ Organizers',
                    perks: ['Lead CA Team in Your City', 'Startup Stipend & Perks', 'Direct Strategy with Founders', 'Official FestNest Recommendation'],
                    active: profile.tier === 'City Lead',
                    color: 'text-fuchsia-700 bg-fuchsia-50 border-fuchsia-300',
                  },
                ].map((t) => (
                  <div
                    key={t.tier}
                    className={`rounded-2xl p-5 border flex flex-col justify-between ${
                      t.active ? 'ring-2 ring-indigo-600 shadow-md bg-white' : 'bg-slate-50/50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full font-mono uppercase border ${t.color}`}>
                          {t.tier}
                        </span>
                        {t.active && (
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-xs text-slate-500 font-semibold mt-3">{t.req}</div>
                      <ul className="mt-4 space-y-2 text-xs text-slate-600">
                        {t.perks.map((p, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 size={13} className="text-indigo-600 mt-0.5 shrink-0" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Outreach Handbook */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen size={18} className="text-indigo-600" />
                  <span>Campus Ambassador Best Practices</span>
                </h3>
                <p className="font-sans text-xs text-slate-500 mt-1">
                  Practical guidelines to help you lead event discovery at {profile.college}.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <UserCheck size={16} className="text-indigo-600" />
                    <span>1. Connect with Campus Club Leads</span>
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Reach out to cultural secretaries, coding club convenors, and E-Cell leads. Share your Organizer Onboarding link (<code>/host?ref={profile.referralCode}</code>) so their event reaches students across colleges nationwide.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <MessageCircle size={16} className="text-indigo-600" />
                    <span>2. Share in Official WhatsApp Groups</span>
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Drop curated event highlights in batch and department groups a few days before hackathons or fests. Include your general referral link so students can discover all verified upcoming events.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <ShieldCheck size={16} className="text-indigo-600" />
                    <span>3. Verify Dates &amp; Details First</span>
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    FestNest values authenticity above all. Make sure submission links, deadlines, team sizes, and registration links are accurate before encouraging organizers to submit.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <HelpCircle size={16} className="text-indigo-600" />
                    <span>4. Need Help or Have Feedback?</span>
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    The FestNest core team is here to support your initiatives. Visit the <Link to="/support" className="text-indigo-600 hover:underline font-semibold">Support &amp; Feedback Desk</Link> anytime to request custom collaterals or ask questions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
