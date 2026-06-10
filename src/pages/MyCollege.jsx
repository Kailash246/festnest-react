import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

export default function MyCollege() {
  const { showToast } = useApp();

  const clubs = [
    { em:'💻', name:'CSEC',           members:'Computer Science · 420 members' },
    { em:'🤖', name:'Roboclub',        members:'Robotics · 186 members' },
    { em:'🌍', name:'Enactus NSIT',    members:'Social Impact · 95 members' },
    { em:'🎭', name:'Drama Club',      members:'Cultural · 78 members' },
    { em:'📸', name:'Shutter Society', members:'Photography · 112 members' },
    { em:'🚀', name:'E-Cell NSIT',     members:'Entrepreneurship · 203 members' },
  ];

  const toppers = [
    { rank:'1', av:'PR', color:'#818CF8', name:'Priya Rawat',   sub:'3rd Year · ECE · 9 events', pts:'1,840', rankClass:'text-[#D97706]' },
    { rank:'2', av:'RS', color:'#34D399', name:'Rohan Sharma',  sub:'4th Year · IT · 7 events',  pts:'1,620', rankClass:'text-[#6B7280]' },
    { rank:'3', av:'AK', color:'#4F46E5', name:'Arjun Kumar',   sub:'3rd Year · CS · 7 events',  pts:'1,580', rankClass:'text-[#B45309]', isMe:true },
    { rank:'4', av:'AM', color:'#F472B6', name:'Anjali Mehta',  sub:'2nd Year · CS · 6 events',  pts:'1,290', rankClass:'text-text-3' },
    { rank:'5', av:'VG', color:'#FB923C', name:'Vikram Gupta',  sub:'1st Year · ME · 5 events',  pts:'1,050', rankClass:'text-text-3' },
  ];

  const upcoming = [
    { em:'💻', bg:'bg1', name:'ByteHack 3.0',       sub:'Hackathon · 10 Jun 2025 · Free' },
    { em:'🔬', bg:'bg3', name:'Technova Science Fest', sub:'Tech Fest · 15–16 Jun 2025 · Free' },
    { em:'💃', bg:'bg5', name:'NSITian Dance-Off',   sub:'Cultural · 20 Jun 2025 · ₹100' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
      className="bg-white min-h-screen w-full overflow-x-hidden">
      {/* Page title */}
      <div className="px-4 pt-5 pb-0 md:px-12 md:pt-10">
        <h2 className="font-display font-bold text-[20px] md:text-[26px] text-text-1 tracking-tight mb-1">My College</h2>
        <p className="text-[14px] text-text-3 mb-4">NSIT Delhi — your campus hub</p>
      </div>

      {/* Hero banner */}
      <div className="mx-4 md:mx-12 mb-5 rounded-xl overflow-hidden relative bg1 md:max-w-[1140px] md:mx-auto">
        <div className="w-full flex items-center justify-center text-[60px]" style={{paddingTop:'36%'}}>
          <div className="absolute inset-0 flex items-center justify-center text-[60px]">🏛️</div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/55" />
          <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
            <div className="font-display font-bold text-[18px] text-white tracking-tight mb-1">
              Netaji Subhas Institute of Technology
            </div>
            <div className="flex items-center gap-1 text-[13px] text-white/75">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Dwarka, New Delhi · Est. 1983
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-4 md:px-12 mb-5 md:max-w-[1140px] md:mx-auto">
        {[['24','Events this year'],['840','Students on FestNest'],['#12','Delhi ranking']].map(([n,l])=>(
          <div key={l} className="bg-surface border border-border rounded-lg p-3.5 text-center
                                  hover:border-primary hover:-translate-y-[1px] transition-all">
            <div className="font-display font-bold text-[20px] md:text-[24px] text-primary mb-0.5">{n}</div>
            <div className="text-[11px] text-text-3 font-medium">{l}</div>
          </div>
        ))}
      </div>

      {/* Upcoming events */}
      <div className="px-4 md:px-12 mb-5 md:max-w-[1140px] md:mx-auto">
        <div className="font-display font-bold text-[15px] md:text-[17px] text-text-1 mb-3">Upcoming from NSIT</div>
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          {upcoming.map(({ em, bg, name, sub }) => (
            <div key={name} onClick={() => showToast(`Opening ${name}…`, 'info')}
              className="flex items-center gap-3 px-4 py-4 border-b border-border last:border-b-0
                         cursor-pointer hover:bg-primary-xlight transition-colors">
              <div className={`w-[42px] h-[42px] rounded-md flex items-center justify-center text-[20px] ${bg}`}>{em}</div>
              <div className="flex-1">
                <div className="text-[14px] font-semibold text-text-1 mb-0.5">{name}</div>
                <div className="text-[12px] text-text-3">{sub}</div>
              </div>
              <span className="text-[10px] font-bold bg-blue-bg text-blue border border-[#BFDBFE]
                               px-[9px] py-[3px] rounded-full uppercase tracking-wide">Your College</span>
            </div>
          ))}
        </div>
      </div>

      {/* Clubs */}
      <div className="px-4 md:px-12 mb-5 md:max-w-[1140px] md:mx-auto">
        <div className="font-display font-bold text-[15px] md:text-[17px] text-text-1 mb-3">Active Clubs & Societies</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {clubs.map(({ em, name, members }) => (
            <div key={name} onClick={() => showToast(`Viewing ${name} profile…`, 'info')}
              className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3
                         cursor-pointer hover:border-primary hover:-translate-y-[1px] transition-all">
              <div className="text-[22px] flex-shrink-0">{em}</div>
              <div>
                <div className="text-[13px] font-semibold text-text-1 leading-snug">{name}</div>
                <div className="text-[11px] text-text-3">{members}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top students */}
      <div className="px-4 md:px-12 pb-8 md:max-w-[1140px] md:mx-auto">
        <div className="font-display font-bold text-[15px] md:text-[17px] text-text-1 mb-3">Top Students This Month</div>
        <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-1">
          {toppers.map(({ rank, av, color, name, sub, pts, rankClass, isMe }) => (
            <div key={name}
              className={`flex items-center gap-3 px-4 py-4 border-b border-border last:border-b-0
                          hover:bg-primary-xlight transition-colors cursor-pointer
                          ${isMe ? 'bg-primary-xlight' : ''}`}>
              <div className={`font-display font-bold text-[14px] w-6 text-center flex-shrink-0 ${rankClass}`}>{rank}</div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-[13px] text-white flex-shrink-0"
                style={{ background: color }}>{av}</div>
              <div className="flex-1">
                <div className="text-[14px] font-semibold text-text-1 mb-0.5 flex items-center gap-1">
                  {name}
                  {isMe && <span className="text-[10px] font-bold text-primary bg-primary-light border border-[#C7D2FE] px-[7px] py-[1px] rounded-full">You</span>}
                </div>
                <div className="text-[12px] text-text-3">{sub}</div>
              </div>
              <div className="font-display font-bold text-[15px] text-primary">{pts}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
