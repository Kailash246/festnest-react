import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { trackPageView } from './utils/analytics';
import { useApp } from './context/AppContext';
import Topnav        from './components/Topnav';
import Sidebar       from './components/Sidebar';
import MobileDrawer  from './components/MobileDrawer';
import BottomNav     from './components/BottomNav';
import ToastContainer from './components/ToastContainer';
import AuthOverlay   from './components/AuthOverlay';
import ScrollToTop   from './components/ScrollToTop';
import Home          from './pages/Home';
import Explore       from './pages/Explore';
import Saved         from './pages/Saved';
import Profile       from './pages/Profile';
import Notifications from './pages/Notifications';
import MyCollege     from './pages/MyCollege';
import Leaderboard   from './pages/Leaderboard';
import HostEvent     from './pages/HostEvent';
import AboutFounder   from './pages/about/AboutFounder';
import Support        from './pages/Support';
import EventDetails   from './pages/EventDetails';
import AdminDashboard      from './pages/admin/AdminDashboard';
import OrganizerDashboard  from './pages/organizer/OrganizerDashboard';
import Landing        from './pages/landing/Landing';
import MobileLanding  from './pages/landing/MobileLanding';
import Terms          from './pages/legal/Terms';
import Privacy        from './pages/legal/Privacy';
import EditProfile    from './pages/profile/EditProfile';
import HubPage        from './pages/seo/HubPage';
import CityPage       from './pages/seo/CityPage';
import CategoryPage   from './pages/seo/CategoryPage';
import BlogHub            from './pages/blog/BlogHub';
import HowToWinHackathon  from './pages/blog/HowToWinHackathon';
import HackathonStrategy  from './pages/blog/HackathonStrategy';
import WinningPitch       from './pages/blog/WinningPitch';
import TopColleges        from './pages/blog/TopColleges';
import BestCollegeEvents  from './pages/blog/BestCollegeEvents';

const isMobile = () => window.innerWidth < 768;

// Routes that render full-bleed with no sidebar / topnav / bottom-nav chrome
const STANDALONE_ROUTES = ['/terms', '/privacy'];

export default function App() {
  const location = useLocation();

  // Fire a GA4 page_view on every client-side navigation (covers all route branches below)
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  // Landing page is only ever shown at the explicit /landing route
  const isLandingRoute = location.pathname === '/landing';

  if (isLandingRoute) {
    return isMobile() ? <MobileLanding /> : <Landing />;
  }

  if (STANDALONE_ROUTES.includes(location.pathname)) {
    return (
      <>
        <ScrollToTop />
        <Routes>
          <Route path="/terms"   element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </>
    );
  }

  return (
    <>
      <ScrollToTop />
      <AuthOverlay />

      <div className="
        relative w-full bg-white
        min-h-dvh
        md:h-dvh md:max-h-dvh md:overflow-hidden
        md:grid md:grid-cols-[260px_1fr] md:grid-rows-[64px_1fr]
        lg:grid-cols-[280px_1fr]
        xl:grid-cols-[300px_1fr]
      ">
        <header className="md:col-span-2 md:row-start-1 md:row-end-2">
          <Topnav />
        </header>

        <aside className="hidden md:flex md:col-start-1 md:row-start-2 md:row-end-3 md:min-h-0 md:overflow-hidden">
          <Sidebar />
        </aside>

        <main className="
          w-full min-w-0 pb-[72px] md:pb-0
          md:col-start-2 md:row-start-2
          md:border-l md:border-[#E4E4E0]
          min-h-[calc(100dvh-56px)] md:min-h-0
          bg-white overflow-x-hidden md:overflow-y-auto
        ">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/"     element={<Navigate to="/home" replace />} />
              <Route path="/home"          element={<Home />} />
              <Route path="/explore"       element={<Explore />} />
              <Route path="/saved"         element={<Saved />} />
              <Route path="/profile"       element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/college"       element={<MyCollege />} />
              <Route path="/leaderboard"   element={<Leaderboard />} />
              <Route path="/host"          element={<HostEvent />} />
              <Route path="/about"         element={<AboutFounder />} />
              <Route path="/support"       element={<Support />} />
              <Route path="/discover"      element={<HubPage />} />
              <Route path="/events/:city"  element={<CityPage />} />
              <Route path="/category/:category" element={<CategoryPage />} />
              <Route path="/blog"                                                    element={<BlogHub />} />
              <Route path="/blog/how-to-win-a-hackathon"                             element={<HowToWinHackathon />} />
              <Route path="/blog/hackathon-strategy-guide"                           element={<HackathonStrategy />} />
              <Route path="/blog/how-to-win-startup-pitch-competition"               element={<WinningPitch />} />
              <Route path="/blog/best-colleges-for-inter-college-competitions-india" element={<TopColleges />} />
              <Route path="/blog/best-college-events-india-2025"                     element={<BestCollegeEvents />} />
              <Route path="/event/:id"     element={<EventDetails />} />
              <Route path="/admin"         element={<AdminDashboard />} />
              <Route path="/organizer"    element={<OrganizerDashboard />} />
              <Route path="*"             element={<Navigate to="/home" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>

      <MobileDrawer />
      <BottomNav />
      <ToastContainer />
    </>
  );
}
