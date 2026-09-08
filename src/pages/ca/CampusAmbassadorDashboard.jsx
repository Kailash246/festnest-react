// src/pages/ca/CampusAmbassadorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Trophy, Rocket, Megaphone, GraduationCap, QrCode, IdCard,
  ChevronDown, CheckCircle2, MapPin, Star, Handshake, Sparkles,
  Copy, Check, Share2, ExternalLink, ArrowLeft, ArrowRight,
  Clock, AlertCircle, RefreshCw, ShieldCheck, Download, Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ca } from '../../services/api';

const GlobalStyle = () => (
  <style>{`
    @import url('https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=satoshi@400,500,700,900&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&display=swap');
    .fn-display { font-family: 'Clash Display', sans-serif; }
    .fn-body { font-family: 'Satoshi', sans-serif; }
    .fn-mono { font-family: 'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace; }
    @keyframes fn-sheen {
      0% { transform: translateX(-160%) translateY(-160%) rotate(20deg); }
      100% { transform: translateX(160%) translateY(160%) rotate(20deg); }
    }
    .fn-sheen { animation: fn-sheen 4.5s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) { .fn-sheen { animation: none; } }
  `}</style>
);

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
      ctx.font = 'bold 24px "Clash Display", sans-serif';
      ctx.fillText('FestNest', 36, 50);

      // Header Badge (Official Ambassador)
      const badgeText = 'OFFICIAL AMBASSADOR';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
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
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.fillText('AMBASSADOR ID', 36, 216);

        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 19px "JetBrains Mono", monospace';
        ctx.fillText(profile.caId || 'FN-CA-PENDING', 36, 242);

        // Valid Thru
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.fillText('VALID THRU', 36, 274);

        ctx.fillStyle = '#475569';
        ctx.font = 'bold 13px "JetBrains Mono", monospace';
        ctx.fillText(profile.validThru || '09 / 2028', 36, 296);

        // Referral Code
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.fillText('REFERRAL CODE', 220, 216);

        ctx.fillStyle = '#4f46e5';
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.fillText(profile.referralCode || '—', 220, 242);

        // Campus Region
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.fillText('CAMPUS REGION', 220, 274);

        ctx.fillStyle = '#475569';
        ctx.font = 'bold 13px "JetBrains Mono", monospace';
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
      <div className="relative overflow-hidden rounded-2xl bg-white p-5 sm:p-6">
        <div className="pointer-events-none absolute -inset-10 opacity-30">
          <div className="fn-sheen h-40 w-16 bg-white blur-md" />
        </div>

        <div className="flex items-center justify-between">
          <span className="fn-display text-base font-bold tracking-tight text-indigo-600">FestNest</span>
          <span className="rounded-full bg-fuchsia-50 border border-fuchsia-100 px-2.5 py-0.5 text-[10px] font-bold text-fuchsia-600 fn-mono">
            OFFICIAL AMBASSADOR
          </span>
        </div>

        <div className="mt-5 flex gap-4 items-center">
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-500 font-bold text-lg fn-display">
            {profile.name
              ? profile.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : 'CA'}
          </div>
          {profile.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt={profile.name}
              className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-xl object-cover border border-indigo-100 shadow-sm"
            />
          ) : (
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-500 font-bold text-lg fn-display">
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
            <span className="fn-display text-lg sm:text-xl font-bold text-slate-900 leading-tight truncate">
              {profile.name}
            </span>
            <span className="fn-body text-xs sm:text-sm text-slate-500 truncate mt-0.5">
              {profile.college}, {profile.city}
            </span>
            <span className={`mt-2 inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold fn-mono ${tierColor}`}>
              {profile.tier?.toUpperCase()} TIER
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-end justify-between border-t border-slate-100 pt-4">
          <div>
            <div className="fn-mono text-[9px] font-semibold tracking-wider text-slate-400">AMBASSADOR ID</div>
            <div className="fn-mono text-sm sm:text-base font-bold text-slate-800 tracking-tight">
              {profile.caId || 'FN-CA-PENDING'}
            </div>
            <div className="fn-mono mt-2 text-[9px] font-semibold tracking-wider text-slate-400">VALID THRU</div>
            <div className="fn-mono text-xs font-medium text-slate-600">{profile.validThru || '09 / 2028'}</div>
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
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);

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

  const fetchProfile = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await ca.me();
      setProfile(res.data?.profile || null);
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
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const handleCopyReferral = () => {
    if (!profile?.referralCode) return;
    const url = profile.referralUrl || `https://festnest.in?ref=${profile.referralCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    showToast?.('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2200);
  };

  const handleShare = () => {
    if (!profile?.referralCode) return;
    const shareData = {
      title: `${profile.name} - FestNest Campus Ambassador`,
      text: `Join FestNest to discover verified college fests, hackathons, and competitions! Use code ${profile.referralCode}`,
      url: profile.referralUrl || `https://festnest.in?ref=${profile.referralCode}`,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      handleCopyReferral();
    }
  };

  // State 1: Unauthenticated
  if (!isLoggedIn) {
    return (
      <div className="fn-body min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <GlobalStyle />
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-4">
            <IdCard size={24} />
          </div>
          <h2 className="fn-display text-2xl font-bold text-slate-900">Campus Ambassador Portal</h2>
          <p className="fn-body mt-2 text-sm text-slate-600">
            Please log in with your FestNest account to access your ambassador credentials, live referral link, and platform impact stats.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => requireAuth()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
            >
              Log In to Portal
            </button>
            <Link
              to="/ca"
              className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition"
            >
              Learn About CA Program
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Loading
  if (loading) {
    return (
      <div className="fn-body min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <GlobalStyle />
        <div className="text-center">
          <div className="inline-block animate-spin text-indigo-600 mb-3">
            <RefreshCw size={28} />
          </div>
          <p className="fn-body text-sm text-slate-500 font-medium">Verifying ambassador credentials...</p>
        </div>
      </div>
    );
  }

  // State 3: Logged In, Not Applied
  if (!profile) {
    return (
      <div className="fn-body min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <GlobalStyle />
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-fuchsia-50 text-fuchsia-600 mx-auto flex items-center justify-center mb-4">
            <Sparkles size={24} />
          </div>
          <h2 className="fn-display text-2xl font-bold text-slate-900">Become an Ambassador</h2>
          <p className="fn-body mt-2 text-sm text-slate-600">
            You haven't applied for the FestNest Campus Ambassador program yet. Represent your college, onboard clubs, and receive official digital credentials.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              to="/ca#apply"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
            >
              Apply to become a CA
            </Link>
            <Link
              to="/home"
              className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition"
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
      <div className="fn-body min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <GlobalStyle />
        <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-lg">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <span className="fn-display text-xl font-bold text-indigo-600">FestNest</span>
              <h2 className="fn-display text-2xl font-bold text-slate-900 mt-1">Application Status</h2>
            </div>
            <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700 fn-mono uppercase">
              {profile.status}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={16} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="fn-body font-semibold text-slate-900 text-sm">Application Submitted</h4>
                <p className="fn-body text-xs text-slate-500 mt-0.5">
                  Applied for {profile.college}, {profile.city}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                <Clock size={16} />
              </div>
              <div>
                <h4 className="fn-body font-semibold text-slate-900 text-sm">Campus Screening &amp; Review</h4>
                <p className="fn-body text-xs text-slate-500 mt-0.5">
                  Our team reviews each applicant's campus involvement. You will receive an update via email.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 opacity-50">
              <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                <IdCard size={16} />
              </div>
              <div>
                <h4 className="fn-body font-semibold text-slate-900 text-sm">Credential &amp; ID Card Issuance</h4>
                <p className="fn-body text-xs text-slate-500 mt-0.5">
                  Upon approval, your official CA ID (e.g. FN-CA-BLR-014) and referral link unlock here.
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
      <div className="fn-body min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <GlobalStyle />
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <h2 className="fn-display text-2xl font-bold text-slate-900">Application Update</h2>
          <p className="fn-body mt-2 text-sm text-slate-600">
            Thank you for your interest in representing {profile.college}. We were unable to move forward with your application for the current cohort.
          </p>
          {profile.rejectionReason && (
            <p className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-500 italic">
              "{profile.rejectionReason}"
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3">
            <Link
              to="/home"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
            >
              Explore Events on FestNest
            </Link>
            <Link
              to="/support"
              className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State 6: APPROVED - Live Ambassador Portal
  const stats = profile.stats || {
    organizersOnboarded: 0,
    eventsSourced: 0,
    referralSignups: 0,
    tier: profile.tier || 'Bronze',
  };

  // Tier thresholds: Bronze (0-2), Silver (3-7), Gold (8-14), City Lead (15+)
  // Tier thresholds: Bronze (0–2), Silver (3–7), Gold (8–15), City Lead (16+)
  const currentOrganizers = stats.organizersOnboarded;
  let nextTierName = 'Silver';
  let nextThreshold = 3;
  let currentBase = 0;

  if (currentOrganizers >= 15) {
  if (currentOrganizers >= 16) {
    nextTierName = 'Maximum Tier (City Lead)';
    nextThreshold = 15;
    currentBase = 15;
    nextThreshold = 16;
    currentBase = 16;
  } else if (currentOrganizers >= 8) {
    nextTierName = 'City Lead';
    nextThreshold = 15;
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
    currentOrganizers >= 15
    currentOrganizers >= 16
      ? 100
      : Math.min(100, Math.round(((currentOrganizers - currentBase) / (nextThreshold - currentBase)) * 100));

  return (
    <div className="fn-body min-h-screen bg-slate-50 text-slate-900 pb-16">
      <GlobalStyle />

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              to="/home"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
            >
              <ArrowLeft size={15} />
              <span>FestNest</span>
            </Link>
            <span className="text-slate-300">|</span>
            <span className="fn-display text-lg font-bold text-slate-900 tracking-tight">
              Ambassador Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchProfile(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Sync Stats</span>
            </button>
            <Link
              to="/ca"
              className="hidden sm:inline-flex text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5"
            >
              Program Overview
            </Link>
          </div>
        </div>
      </header>

      {/* Content Container */}
      <main className="mx-auto max-w-6xl px-6 pt-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="fn-display text-2xl sm:text-3xl font-bold text-slate-900">
                Welcome, {profile.name}
              </h1>
              <ShieldCheck size={22} className="text-indigo-600" />
            </div>
            <p className="fn-body text-sm text-slate-500 mt-1">
              Official Ambassador for <span className="font-semibold text-slate-700">{profile.college}</span> · ID:{' '}
              <span className="font-mono font-bold text-indigo-600">{profile.caId}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700 fn-mono">
              <Award size={14} />
              {profile.tier?.toUpperCase()} AMBASSADOR
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: ID Card & Credentials (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="fn-display text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
                <span>Official Digital Credential</span>
                <span className="text-xs font-normal text-slate-400">Verified</span>
              </h3>

              <div className="flex justify-center py-2">
                <LiveIDCard profile={profile} tilt={true} />
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  onClick={handleDownloadCard}
                  disabled={downloading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition disabled:opacity-60"
                >
                  <Download size={15} className={downloading ? 'animate-bounce' : ''} />
                  <span>{downloading ? 'Generating PNG Card...' : 'Download ID Card (PNG)'}</span>
                </button>

                <button
                  onClick={handleCopyReferral}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  <span>{copied ? 'Referral Link Copied!' : 'Copy Referral Link'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Share2 size={15} />
                  <span>Share Ambassador Badge</span>
                </button>
              </div>
            </div>

            {/* Quick Community & Resources */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="fn-display text-base font-bold text-slate-900">Ambassador Toolkit</h3>

              <div className="space-y-2.5 text-xs">
                <a
                  href="#share"
                  onClick={(e) => { e.preventDefault(); handleCopyReferral(); }}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition text-slate-700"
                >
                  <div className="flex items-center gap-2.5">
                    <Rocket size={16} className="text-indigo-600" />
                    <span className="font-semibold">Campus Referral Link</span>
                  </div>
                  <ExternalLink size={14} className="text-slate-400" />
                </a>

                <Link
                  to="/explore"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition text-slate-700"
                >
                  <div className="flex items-center gap-2.5">
                    <GraduationCap size={16} className="text-fuchsia-600" />
                    <span className="font-semibold">Explore Campus Events</span>
                  </div>
                  <ExternalLink size={14} className="text-slate-400" />
                </Link>

                <Link
                  to="/support"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition text-slate-700"
                >
                  <div className="flex items-center gap-2.5">
                    <Handshake size={16} className="text-teal-600" />
                    <span className="font-semibold">Contact CA Program Lead</span>
                  </div>
                  <ExternalLink size={14} className="text-slate-400" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Platform Impact & Referral Tracking (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Impact Metrics Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <Trophy size={18} />
                </div>
                <div className="fn-mono text-2xl sm:text-3xl font-bold text-slate-900">
                  {stats.organizersOnboarded}
                </div>
                <div className="fn-body text-xs font-medium text-slate-500 mt-1 leading-tight">
                  Organizers Onboarded
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center mb-3">
                  <Rocket size={18} />
                </div>
                <div className="fn-mono text-2xl sm:text-3xl font-bold text-slate-900">
                  {stats.eventsSourced}
                </div>
                <div className="fn-body text-xs font-medium text-slate-500 mt-1 leading-tight">
                  Events Sourced
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                  <Users size={18} />
                </div>
                <div className="fn-mono text-2xl sm:text-3xl font-bold text-slate-900">
                  {stats.referralSignups}
                </div>
                <div className="fn-body text-xs font-medium text-slate-500 mt-1 leading-tight">
                  Student Signups
                </div>
              </div>
            </div>

            {/* Tier Progress Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="fn-mono text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Current Tier
                  </span>
                  <h3 className="fn-display text-xl font-bold text-slate-900 mt-0.5">
                    {profile.tier} Ambassador
                  </h3>
                </div>
                <div className="text-right">
                  <span className="fn-mono text-xs font-semibold text-indigo-600">
                    Next: {nextTierName}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentOrganizers >= 15
                    {currentOrganizers >= 16
                      ? 'Top tier achieved!'
                      : `${nextThreshold - currentOrganizers} more organizers needed`}
                      : `${nextThreshold - currentOrganizers} more organizer${nextThreshold - currentOrganizers === 1 ? '' : 's'} needed`}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 fn-mono">
                <span>Bronze (0)</span>
                <span>Silver (3)</span>
                <span>Gold (8)</span>
                <span>City Lead (15+)</span>
                <span>City Lead (16+)</span>
              </div>
            </div>

            {/* Referral Hub Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="fn-display text-base font-bold text-slate-900 flex items-center gap-2">
                <Megaphone size={18} className="text-indigo-600" />
                <span>Your Campus Referral Hub</span>
              </h3>
              <p className="fn-body text-xs text-slate-600 mt-1 leading-relaxed">
                When student organizers sign up or host events using your code, FestNest automatically attributes verified impact to your ambassador profile.
              </p>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono text-slate-800 select-all overflow-x-auto">
                  {profile.referralUrl || `https://festnest.in?ref=${profile.referralCode}`}
                </div>
                <button
                  onClick={handleCopyReferral}
                  className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-sm"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <Sparkles size={14} className="text-indigo-600" />
                  <span>How tier progression works</span>
                </div>
                <p className="text-indigo-700 leading-relaxed">
                  Every unique student club or fest organizer who registers with your link counts towards your next tier. When their events go live on FestNest, your <span className="font-semibold">Events Sourced</span> metric increases automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

