import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PRIORITY_CATEGORIES } from '../data/categories';

const SidebarBtn = ({ href, icon, label, badge, badgeStyle, onClick, isActive }) => {
  const navigate = useNavigate();
  const handleClick = () => { if (onClick) onClick(); else navigate(href); };

  return (
    <button
      onClick={handleClick}
      aria-current={isActive ? 'page' : undefined}
      className={`flex items-center gap-3 w-full text-left px-[14px] py-[10px] rounded-md
                  text-[14px] font-medium transition-all duration-fast group
                  ${isActive
                    ? 'bg-primary-light text-primary sidebar-active-accent'
                    : 'text-text-2 hover:bg-surface-2 hover:text-text-1 hover:translate-x-[2px]'}`}
    >
      <span className={`flex-shrink-0 transition-colors duration-fast
                        ${isActive ? 'text-primary' : 'text-text-3 group-hover:text-text-2'}`}>
        {icon}
      </span>
      {label}
      {badge !== undefined && (
        <span className={`ml-auto text-[11px] font-bold px-[7px] py-[2px] rounded-full
                          ${badgeStyle || 'bg-primary-light text-primary'}`}>
          {badge}
        </span>
      )}
    </button>
  );
};

const Label = ({ children }) => (
  <div className="text-[10px] font-bold tracking-wider text-text-4 uppercase
                  px-[14px] pt-4 pb-[6px] mt-2">
    {children}
  </div>
);
const Divider = () => <div className="h-px bg-border mx-2 my-3" />;

// SVG icons
const HomeIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const ExploreIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
const DiscoverIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const SavedIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>;
const ProfileIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const BellIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const CollegeIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
const HostIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
const InfoIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>;
const HelpIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="10"/></svg>;
const CodeIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
const MusicIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
const WrenchIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
const TrophyIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
const CalIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const HeartIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;

export default function Sidebar() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const { savedCount, requireAuth, showToast, isAdmin, isOrganizer, isSuperAdmin, unreadNotifCount } = useApp();
  const path = location.pathname;

  // Auth-gated navigation
  const goProtected = (href) => {
    if (!requireAuth()) return;
    navigate(href);
  };

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto
                    no-scrollbar bg-surface border-r border-border
                    px-3 py-5 gap-[2px]">

      {/* Main nav */}
      <SidebarBtn href="/home"     icon={<HomeIcon />}    label="Home"    isActive={path === '/home'} />
      <SidebarBtn href="/explore" icon={<ExploreIcon />} label="Explore" isActive={path === '/explore'} />
      <SidebarBtn href="/discover" icon={<DiscoverIcon />} label="Discover" isActive={path === '/discover'} />

      {/* Protected: Saved & Profile */}
      <SidebarBtn
        onClick={() => goProtected('/saved')}
        icon={<SavedIcon />} label="Saved"
        badge={savedCount > 0 ? savedCount : undefined}
        isActive={path === '/saved'}
      />
      <SidebarBtn
        onClick={() => goProtected('/profile')}
        icon={<ProfileIcon />} label="Profile"
        isActive={path === '/profile'}
      />

      {/* Organizer-only section — shown immediately after Profile */}
      {(isOrganizer || isSuperAdmin) && (
        <>
          <Divider />
          <Label>Organizer</Label>
          <SidebarBtn
            href="/organizer"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>}
            label="Organizer Dashboard"
            isActive={path === '/organizer'}
          />
          <SidebarBtn href="/host" icon={<HostIcon />} label="Host an Event" isActive={path === '/host'} />
        </>
      )}

      <Divider />
      <Label>Browse by Type</Label>

      {PRIORITY_CATEGORIES.map(({ value, label, Icon: CatIcon }) => (
        <SidebarBtn key={value}
          onClick={() => navigate(`/explore?cat=${encodeURIComponent(value)}`)}
          icon={<CatIcon className="w-[17px] h-[17px]" strokeWidth={2} />}
          label={label} />
      ))}

      <Divider />
      <Label>My Activity</Label>

      <SidebarBtn onClick={() => goProtected('/profile')} icon={<CalIcon />}   label="Registered Events" badge={3} />
      <SidebarBtn onClick={() => goProtected('/saved')}   icon={<HeartIcon />} label="Saved Events" />

      <Divider />
      <Label>More</Label>

      <SidebarBtn href="/notifications" icon={<BellIcon />}    label="Notifications"
        badge={unreadNotifCount > 0 ? unreadNotifCount : undefined}
        badgeStyle="bg-red-bg text-red" isActive={path === '/notifications'} />
      <SidebarBtn href="/college"       icon={<CollegeIcon />} label="My College" isActive={path === '/college'} />

      {/* ── Leaderboard hidden for now — do NOT remove, restore when ready ──
      <SidebarBtn href="/leaderboard" icon={<RankIcon />} label="Leaderboard" isActive={path === '/leaderboard'} />
      */}

      <Divider />
      <Label>FestNest</Label>

      <SidebarBtn href="/about"   icon={<InfoIcon />} label="About FestNest" isActive={path === '/about'} />
      <SidebarBtn href="/support" icon={<HelpIcon />} label="Help & Support"  isActive={path === '/support'} />

      <div className="px-[14px] pt-4 pb-1 mt-1">
        <p className="text-[11px] text-text-4 leading-snug">
          Built by{' '}
          <button
            onClick={() => navigate('/about')}
            className="text-primary hover:underline font-medium"
          >
            Kailash Kumar B
          </button>
        </p>
      </div>

      {isAdmin && (
        <>
          <Divider />
          <Label>Admin</Label>
          <SidebarBtn
            href="/admin"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
            label="Admin Dashboard"
            isActive={path === '/admin'}
            badgeStyle="bg-amber-bg text-amber border border-amber-border"
          />
        </>
      )}
    </div>
  );
}
