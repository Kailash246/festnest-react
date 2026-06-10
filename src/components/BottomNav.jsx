import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const HOME_TAB = {
  href: '/home', label: 'Home',
  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
};

const EXPLORE_TAB = {
  href: '/explore', label: 'Explore',
  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
};

const SAVED_TAB = {
  href: '/saved', label: 'Saved', protected: true,
  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>,
};

const ORGANIZER_TAB = {
  href: '/organizer', label: 'Organizer', protected: true,
  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>,
};

const ADMIN_TAB = {
  href: '/admin', label: 'Admin', protected: true,
  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};

const HOST_TAB = {
  href: '/host', label: 'Host',
  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
};

const PROFILE_TAB = {
  href: '/profile', label: 'Profile', protected: true,
  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

export default function BottomNav() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { requireAuth, savedCount, isAdmin, isOrganizer, isSuperAdmin } = useApp();
  const path      = location.pathname;

  const middleTab = (isAdmin || isSuperAdmin) ? ADMIN_TAB
                  : isOrganizer               ? ORGANIZER_TAB
                  : SAVED_TAB;

  const tabs = [HOME_TAB, EXPLORE_TAB, middleTab, HOST_TAB, PROFILE_TAB];

  const handleTab = (href, isProtected) => {
    if (isProtected && !requireAuth()) return;
    navigate(href);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[40]
                 flex items-center bg-white border-t border-[#E4E4E0]
                 shadow-[0_-2px_12px_rgba(0,0,0,0.07)]
                 px-1 pt-1 pb-[calc(4px+env(safe-area-inset-bottom,0px))]"
      aria-label="Bottom navigation"
    >
      {tabs.map(({ href, label, icon, protected: isProtected }) => {
        const active = path === href;
        return (
          <button
            key={href}
            onClick={() => handleTab(href, isProtected)}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            className="flex-1 flex flex-col items-center gap-[3px] py-1.5 px-1
                       rounded-xl min-w-0 transition-colors duration-150
                       hover:bg-[#F1F0ED] active:bg-[#E9E9E5] relative"
          >
            <span className={`transition-all duration-150
                              ${active ? 'text-primary scale-110' : 'text-[#8A8A85]'}`}>
              {icon}
            </span>
            <span className={`text-[10px] font-semibold truncate transition-colors duration-150
                              ${active ? 'text-primary' : 'text-[#8A8A85]'}`}>
              {label}
            </span>
            {label === 'Saved' && savedCount > 0 && (
              <span className="absolute top-1 right-[calc(50%-14px)]
                               w-4 h-4 bg-primary text-white text-[9px]
                               font-bold rounded-full flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
