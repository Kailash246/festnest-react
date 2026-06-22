// src/pages/seo/HubPage.jsx
// Static discovery hub — route: /discover
// Internal-linking hub that funnels crawlers and users into the city and
// category SEO landing pages. No API call.
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, ChevronRight } from 'lucide-react';
import Seo, { SITE_URL } from '../../components/Seo';
import { SEO_CATEGORIES } from '../../data/seoCategories';

// Top metros + key college hubs. Each links to /events/{slug}.
const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad',
  'Pune', 'Kolkata', 'Jaipur', 'Chandigarh', 'Vellore',
];

const citySlug = (c) => c.toLowerCase().replace(/\s+/g, '-');

export default function HubPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
      className="bg-white min-h-screen w-full overflow-x-hidden">

      <Seo
        title="Discover College Events, Hackathons & Fests in India"
        description="Browse college events across India by city and category. Find inter-college hackathons, cultural fests, workshops, and competitions near you on FestNest."
        canonical={`${SITE_URL}/discover`}
      />

      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-2 md:px-12 md:pt-10">
        <h1 className="font-display font-bold text-[26px] md:text-[36px] text-text-1 leading-tight tracking-tight mb-3">
          Discover College Events Across India
        </h1>
        <p className="text-[14px] md:text-[15px] text-text-2 leading-relaxed max-w-[720px]">
          FestNest is your map to inter-college events across India. Browse hackathons, cultural fests,
          workshops, and competitions by city or by category — and find exactly what is happening at colleges
          near you. Pick a city or a category below to start exploring.
        </p>
      </div>

      {/* ── Browse by City ── */}
      <section className="px-4 pt-7 md:px-12">
        <h2 className="font-display font-bold text-[18px] md:text-[20px] text-text-1 tracking-snug mb-4">
          Browse by City
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {CITIES.map(city => (
            <Link key={city} to={`/events/${citySlug(city)}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-white text-[14px] font-medium text-text-2 shadow-sm hover:border-primary hover:text-primary hover:bg-[#F5F3FF] hover:-translate-y-0.5 transition-all duration-150">
              <MapPin size={15} strokeWidth={2} className="text-primary flex-shrink-0" />
              {city}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Browse by Category ── */}
      <section className="px-4 pt-9 pb-8 md:px-12">
        <h2 className="font-display font-bold text-[18px] md:text-[20px] text-text-1 tracking-snug mb-4">
          Browse by Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-[1140px]">
          {SEO_CATEGORIES.map(({ slug, label, description, Icon }) => (
            <Link key={slug} to={`/category/${slug}`}
              className="group flex items-start gap-3 p-4 rounded-lg border border-border bg-white shadow-sm hover:border-primary hover:bg-[#F5F3FF] hover:-translate-y-0.5 transition-all duration-150">
              <div className="w-11 h-11 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                <Icon size={21} strokeWidth={1.9} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 font-display font-bold text-[15px] text-text-1 group-hover:text-primary transition-colors">
                  {label}
                  <ChevronRight size={15} strokeWidth={2.5} className="text-text-3 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-[12.5px] text-text-3 leading-snug mt-1 line-clamp-2">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="h-4" />
    </motion.div>
  );
}
