// src/components/BrandMark.jsx
// Official FestNest badge from the logo kit (public/festnest-mark.png, sourced
// from festnest-logo-kit/icon/festnest-icon-256.png). The badge is square and
// carries its own gradient background, so it needs no coloured wrapper and works
// on light and dark surfaces alike (per the logo-kit README).
//
// alt defaults to "" because every in-app placement sits next to a visible
// "FestNest" text wordmark — an empty alt avoids duplicate announcements for
// screen readers. Pass an explicit alt when the mark stands alone.
export default function BrandMark({ className = 'w-8 h-8', alt = '' }) {
  return (
    <img
      src="/festnest-mark.png"
      alt={alt}
      width="256"
      height="256"
      loading="eager"
      decoding="async"
      draggable={false}
      className={`${className} object-contain select-none flex-shrink-0`}
    />
  );
}
