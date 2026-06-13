import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, ClipboardList, Bell, Trophy, Target, Globe, Camera, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const HOW = [
  { Icon: Search,       title:'Discover events near you',  desc:'Search by college, city, category, or date. Filter by entry type or prize pool.' },
  { Icon: ClipboardList,title:'Register in one tap',        desc:'Every event links directly to the official registration form. No middlemen.' },
  { Icon: Bell,         title:'Never miss a deadline',      desc:'Get smart reminders before registration closes. Track all your events in one place.' },
  { Icon: Trophy,       title:'Earn points, climb rankings', desc:'Every event you attend earns FestNest points. See how you rank nationally and within your college.' },
];

const TEAM = [
  { av:'AV', color:'#818CF8', name:'Aditya Verma',  role:'Co-founder & CEO',         college:"IIT Delhi '23" },
  { av:'SK', color:'#34D399', name:'Shruti Kapoor', role:'Co-founder & CTO',          college:"BITS Pilani '23" },
  { av:'RM', color:'#F472B6', name:'Rahul Mehta',   role:'Head of Design',            college:"NID Ahmedabad '24" },
  { av:'PS', color:'#FB923C', name:'Priya Singh',   role:'Growth & Partnerships',     college:"IIM Bangalore '24" },
];

const LINKS = [
  { Icon: Globe,         label:'Website',       sub:'festnest.in',           action: null },
  { Icon: Camera,        label:'Instagram',     sub:'@festnest_india',       action: null },
  { Icon: MessageCircle, label:'Twitter / X',   sub:'@festnest',             action: null },
  { Icon: MessageCircle, label:'Help & Support',sub:'Get help, report bugs, contact us', action: 'support' },
];

const STATS = [['230+','Events Listed'],['48k+','Students Reached'],['180+','Colleges'],['₹2Cr+','Prize Money Listed']];

export default function About() {
  const { showToast } = useApp();
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
      className="bg-white min-h-screen w-full overflow-x-hidden">
      <div className="px-4 pt-5 pb-8 md:px-12 md:pt-10 md:max-w-[1000px] md:mx-auto">

        {/* Hero */}
        <div className="text-center py-10 md:py-12">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-[72px] h-[72px] bg-primary rounded-[20px] flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 14 14" fill="none" className="w-10 h-10">
              <path d="M7 2C4.24 2 2 4.24 2 7s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 2c.83 0 1.5.67 1.5 1.5S7.83 7 7 7s-1.5-.67-1.5-1.5S6.17 4 7 4zm0 7.2c-1.25 0-2.35-.63-3-1.58.02-.98 2-.98 3-.98s2.98.01 3 .98c-.65.95-1.75 1.58-3 1.58z" fill="white"/>
            </svg>
          </motion.div>
          <h1 className="font-display font-bold text-[28px] md:text-[40px] text-primary tracking-tight mb-2">FestNest</h1>
          <p className="text-[15px] text-text-3 leading-relaxed">Discover every college event across India — in one place.</p>
          <div className="inline-block mt-3 bg-green-bg text-[#16A34A] border border-green-border
                          rounded-full text-[12px] font-bold px-3.5 py-1 tracking-wide">v1.0 · Beta</div>
        </div>

        {/* Mission */}
        <div className="bg-primary-light border border-[#C7D2FE] rounded-xl p-5 mb-4">
          <div className="font-display font-bold text-[16px] text-primary mb-3 flex items-center gap-2"><Target size={16} strokeWidth={1.8} /> Our Mission</div>
          <p className="text-[14px] text-text-2 leading-relaxed">
            Students across India miss incredible events — hackathons, cultural fests, workshops, and competitions —
            because information is scattered across WhatsApp forwards, Instagram stories, and random posters.
            FestNest fixes that. We built one clean, beautiful platform where every college event lives.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {STATS.map(([n, l]) => (
            <div key={l} className="bg-surface border border-border rounded-lg p-4 text-center
                                    hover:border-primary hover:-translate-y-[1px] transition-all">
              <div className="font-display font-bold text-[26px] text-primary mb-1">{n}</div>
              <div className="text-[12px] text-text-3 font-medium">{l}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-5">
          <div className="font-display font-bold text-[16px] md:text-[18px] text-text-1 mb-4">How FestNest Works</div>
          <div className="grid md:grid-cols-2 gap-3 about-steps-grid">
            {HOW.map(({ Icon: HowIcon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-4 bg-surface border border-border rounded-lg
                                          hover:border-primary-mid hover:-translate-y-[1px] transition-all">
                <div className="w-9 h-9 bg-primary-light rounded-md flex items-center justify-center flex-shrink-0">
                  <HowIcon size={18} strokeWidth={1.8} className="text-primary" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-text-1 mb-1">{title}</div>
                  <div className="text-[13px] text-text-3 leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-5">
          <div className="font-display font-bold text-[16px] md:text-[18px] text-text-1 mb-4">The Team</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 about-team-grid">
            {TEAM.map(({ av, color, name, role, college }) => (
              <div key={name} className="bg-surface border border-border rounded-lg p-4 text-center
                                         hover:border-primary-mid hover:-translate-y-[1px] transition-all">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3
                                font-display font-bold text-[16px] text-white"
                  style={{ background: color }}>{av}</div>
                <div className="text-[14px] font-semibold text-text-1 mb-0.5">{name}</div>
                <div className="text-[12px] text-text-3 mb-0.5">{role}</div>
                <div className="text-[11px] text-text-4">{college}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden mb-4 shadow-1">
          {LINKS.map(({ Icon: LIcon, label, sub, action }) => (
            <div key={label} onClick={() => action === 'support' ? navigate('/support') : showToast(`Opening ${label}…`, 'info')}
              className="flex items-center gap-3 px-4 py-4 border-b border-border last:border-b-0
                         cursor-pointer hover:bg-primary-xlight transition-colors">
              <div className="w-[34px] h-[34px] rounded-md bg-surface-3 flex items-center justify-center flex-shrink-0">
                <LIcon size={16} strokeWidth={1.8} className="text-text-2" />
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-medium text-text-1">{label}</div>
                <div className="text-[12px] text-text-3 mt-0.5">{sub}</div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-text-4">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <div className="text-[13px] text-text-4 mb-2">FestNest v1.0 Beta · Built with ❤️ in India</div>
          <div className="flex justify-center gap-5">
            {[
              { label: 'Privacy Policy', to: '/privacy' },
              { label: 'Terms of Use',   to: '/terms'   },
              { label: 'Careers',        to: null        },
            ].map(({ label, to }) => (
              <button key={label}
                onClick={() => to ? navigate(to) : showToast(`Opening ${label}…`, 'info')}
                className="text-[12px] text-text-3 hover:text-primary transition-colors">
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
