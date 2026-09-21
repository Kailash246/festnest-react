// src/pages/ca/components/CAIdentityCard.jsx
import React, { useState } from 'react';
import { Download, Share2, IdCard, ShieldCheck } from 'lucide-react';

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

function QRMark({ size = 64 }) {
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

export function exportCardAsPNG(profile) {
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
      grad.addColorStop(1, '#8456b6');

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

      ctx.fillStyle = '#eef2ff';
      roundRect(badgeX, badgeY, badgeW, badgeH, 12);
      ctx.fill();
      ctx.strokeStyle = '#c7d2fe';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#4f46e5';
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
          ctx.font = 'bold 26px "DM Sans", sans-serif';
          ctx.textAlign = 'center';
          const initials = profile.name
            ? profile.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
            : 'CA';
          ctx.fillText(initials, avatarX + avatarSize / 2, avatarY + avatarSize / 2 + 9);
          ctx.textAlign = 'left';
        }

        // Name & College
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 22px "DM Sans", sans-serif';
        const displayName = profile.name || 'Campus Ambassador';
        ctx.fillText(displayName, 126, 110);

        ctx.fillStyle = '#64748b';
        ctx.font = '13px "Geist Sans", sans-serif';
        const sub = `${profile.college || 'College'}, ${profile.city || 'India'}`;
        ctx.fillText(sub.length > 40 ? sub.slice(0, 38) + '…' : sub, 126, 132);

        // Verified Status Pill
        const statusBadge = 'VERIFIED CA';
        ctx.font = 'bold 10px "Geist Mono", monospace';
        const statusMetrics = ctx.measureText(statusBadge);
        const statusW = statusMetrics.width + 16;
        const statusH = 22;
        const statusX = 126;
        const statusY = 142;

        ctx.fillStyle = '#ecfdf5';
        roundRect(statusX, statusY, statusW, statusH, 11);
        ctx.fill();
        ctx.strokeStyle = '#a7f3d0';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#047857';
        ctx.fillText(statusBadge, statusX + 8, statusY + 15);

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

export default function CAIdentityCard({ profile, onShare }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!profile) return;
    setDownloading(true);
    try {
      await exportCardAsPNG(profile);
    } catch (err) {
      console.error('Failed to export card PNG', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-sm flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4">
        <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
          <IdCard size={18} className="text-primary" />
          <span>Official Ambassador ID</span>
        </h3>
        <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
          VERIFIED CREDENTIAL
        </span>
      </div>

      {/* Live Digital ID Card */}
      <div className="relative w-full max-w-sm rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-[#8456B6] p-[1.5px] shadow-lg">
        <div className="relative overflow-hidden rounded-2xl bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="font-heading text-base font-bold tracking-tight text-primary">FestNest</span>
            <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary font-mono">
              OFFICIAL AMBASSADOR
            </span>
          </div>

          <div className="mt-4 flex gap-3.5 items-center">
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile.name}
                className="h-14 w-14 shrink-0 rounded-xl object-cover border border-border shadow-sm"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-primary font-bold text-lg font-heading">
                {profile.name
                  ? profile.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
                  : 'CA'}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-heading text-base sm:text-lg font-bold text-slate-900 truncate">
                {profile.name}
              </span>
              <span className="font-sans text-xs text-text-3 truncate mt-0.5">
                {profile.college}, {profile.city}
              </span>
              <span className="mt-1.5 inline-flex w-fit items-center rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold font-mono text-emerald-700">
                ACTIVE AMBASSADOR
              </span>
            </div>
          </div>

          <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-3.5">
            <div>
              <div className="font-mono text-[9px] font-semibold tracking-wider text-text-4">AMBASSADOR ID</div>
              <div className="font-mono text-sm font-bold text-slate-900">
                {profile.caId || 'FN-CA-PENDING'}
              </div>
              <div className="font-mono mt-1.5 text-[9px] font-semibold tracking-wider text-text-4">VALID THRU</div>
              <div className="font-mono text-xs font-medium text-slate-600">{profile.validThru || '09 / 2028'}</div>
            </div>
            <QRMark size={60} />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 w-full grid grid-cols-2 gap-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-white hover:bg-primary-dark transition shadow-sm disabled:opacity-50 active:scale-[0.98]"
        >
          <Download size={14} />
          <span>{downloading ? 'Downloading...' : 'Download (PNG)'}</span>
        </button>

        <button
          onClick={onShare}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 py-2.5 text-xs font-semibold text-text-2 hover:bg-surface-2 transition active:scale-[0.98]"
        >
          <Share2 size={14} />
          <span>Share Badge</span>
        </button>
      </div>
    </div>
  );
}

