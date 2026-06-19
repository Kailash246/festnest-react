import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Trophy, Star, Flame, Award, CalendarDays, CheckCircle2, Users, Megaphone, PenLine } from 'lucide-react';
import { useApp } from '../context/AppContext';

const PERIODS = ['This Month', 'This Semester', 'All Time'];

const PODIUM = [
  { rank:2, initials:'RS', color:'#9CA3AF', name:'Rohan S.',  college:'IIT Bombay',      pts:'1,900', blockH:48, blockW:80,  av:52 },
  { rank:1, initials:'NK', color:'#D97706', name:'Nisha K.',  college:'IISc Bangalore',   pts:'2,340', blockH:72, blockW:96,  av:64, crown:true },
  { rank:3, initials:'AK', color:'#4F46E5', name:'Arjun K.',  college:'NSIT Delhi',       pts:'1,580', blockH:36, blockW:80,  av:42 },
];

const ROWS = [
  { rank:1,  initials:'NK', color:'#D97706', name:'Nisha Kapoor',  college:'IISc Bangalore · B.Tech CSE', pts:'2,340', badges:[Crown, Trophy, Star] },
  { rank:2,  initials:'RS', color:'#818CF8', name:'Rohan Sharma',  college:'IIT Bombay · B.Tech EE',      pts:'1,900', badges:[Flame, Award] },
  { rank:3,  initials:'AK', color:'#4F46E5', name:'Arjun Kumar',   college:'NSIT Delhi · B.Tech CS',      pts:'1,580', badges:[Flame, Award], isMe:true },
  { rank:4,  initials:'PR', color:'#34D399', name:'Priya Rawat',   college:'NSIT Delhi · B.Tech ECE',     pts:'1,840', badges:[Star] },
  { rank:5,  initials:'AM', color:'#F472B6', name:'Anjali Mehta',  college:'NIT Trichy · B.Tech CS',      pts:'1,290', badges:[Award] },
  { rank:6,  initials:'VG', color:'#FB923C', name:'Vikram Gupta',  college:'BITS Pilani · B.Tech ME',     pts:'1,050', badges:[] },
  { rank:7,  initials:'SA', color:'#60A5FA', name:'Shreya Agarwal',college:'VIT Vellore · B.Tech ECE',   pts:'980',   badges:[] },
  { rank:8,  initials:'KR', color:'#A78BFA', name:'Karthik Reddy', college:'IISc · M.Tech AI',            pts:'920',   badges:[Trophy] },
];

const PTS_RULES = [
  [CalendarDays, 'Register for an event', '+50 pts'],
  [CheckCircle2, 'Attend & check in',     '+150 pts'],
  [Trophy,       'Win a competition',     '+500 pts'],
  [Megaphone,    'Refer a friend',        '+75 pts'],
  [PenLine,      'Host an event',         '+300 pts'],
];

export default function Leaderboard() {
  const { showToast } = useApp();
  const [period, setPeriod] = useState(0);

  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
      className="bg-white min-h-screen w-full overflow-x-hidden">

      <div className="px-4 pt-5 pb-4 md:px-12 md:pt-10 md:max-w-[1000px] md:mx-auto">
        <h1 className="font-display font-bold text-[20px] md:text-[26px] text-text-1 tracking-tight mb-1">Leaderboard</h1>
        <p className="text-[14px] text-text-3">Top students by events attended & points earned</p>
      </div>

      {/* Period chips */}
      <div className="flex gap-2 px-4 md:px-12 pb-2 md:max-w-[1000px] md:mx-auto">
        {PERIODS.map((p, i) => (
          <button key={p} onClick={() => { setPeriod(i); showToast(p + ' rankings', 'info'); }}
            className={`px-[13px] py-1.5 rounded-full border-[1.5px] text-[13px] font-medium
                        transition-all duration-fast
                        ${period === i
                          ? 'bg-primary-light border-primary text-primary'
                          : 'bg-surface border-border text-text-2 hover:border-primary-mid'}`}>
            {p}
          </button>
        ))}
      </div>

      {/* Your rank banner */}
      <div className="mx-4 md:mx-12 md:max-w-[1000px] md:mx-auto mt-3 mb-0
                      bg-primary-light border border-[#C7D2FE] rounded-xl p-4
                      flex items-center gap-3 shadow-1">
        <Award size={24} strokeWidth={1.8} className="text-primary flex-shrink-0" />
        <div>
          <div className="text-[14px] font-semibold text-primary mb-0.5">Your rank: #3 nationally · #3 at NSIT Delhi</div>
          <div className="text-[12px] text-primary-mid">1,580 pts · 7 events this month · 320 pts to reach #2</div>
        </div>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-3 px-4 pt-8 pb-0 md:px-12 md:max-w-[1000px] md:mx-auto">
        {PODIUM.sort((a,b) => (a.rank===1?1:a.rank===2?-1:0)-(b.rank===1?1:b.rank===2?-1:0)).map(
          ({ rank, initials, color, name, college, pts, blockH, blockW, av, crown }) => (
          <div key={rank} className="flex flex-col items-center gap-2">
            {crown && <div className="-mb-1"><Crown size={20} strokeWidth={1.8} className="text-[#D97706]" /></div>}
            <div className="rounded-full border-[3px] flex items-center justify-center
                            font-display font-bold text-white"
              style={{ width: av, height: av, background: color, fontSize: av > 50 ? 18 : 13,
                       borderColor: color }}>
              {initials}
            </div>
            <div className="text-[12px] font-semibold text-text-1 text-center max-w-[70px] truncate">{name}</div>
            <div className="text-[10px] text-text-3 text-center max-w-[70px] truncate">{college}</div>
            <div className="font-display font-bold text-[13px] text-primary">{pts} pts</div>
            <div className="rounded-t-md flex items-center justify-center font-display font-bold text-[18px] text-white"
              style={{ width: blockW, height: blockH, background: color }}>
              {rank}
            </div>
          </div>
        ))}
      </div>

      {/* Full list */}
      <div className="px-4 md:px-12 pt-5 pb-8 md:max-w-[1000px] md:mx-auto">
        <div className="font-display font-bold text-[14px] text-text-1 mb-3">Full Rankings</div>
        <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-1">
          {ROWS.map(({ rank, initials, color, name, college, pts, badges, isMe }) => (
            <div key={rank}
              className={`flex items-center gap-3 px-4 md:px-5 py-3.5 border-b border-border last:border-b-0
                          transition-colors hover:bg-primary-xlight cursor-pointer
                          ${isMe ? 'bg-primary-xlight' : ''}`}>
              <div className={`font-display font-bold text-[14px] w-7 text-center flex-shrink-0
                              ${rank===1?'text-[#D97706]':rank===2?'text-[#9CA3AF]':rank===3?'text-[#B45309]':'text-text-3'}`}>
                {rank}
              </div>
              <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center
                              font-display font-bold text-[13px] text-white flex-shrink-0"
                style={{ background: color }}>{initials}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-text-1 mb-0.5 flex items-center gap-1.5">
                  {name}
                  {isMe && <span className="text-[10px] font-bold text-primary bg-primary-light border border-[#C7D2FE] px-[7px] py-[1px] rounded-full">You</span>}
                </div>
                <div className="text-[12px] text-text-3">{college}</div>
              </div>
              <div className="text-right">
                <div className="font-display font-bold text-[15px] md:text-[16px] text-primary">{pts}</div>
                <div className="flex justify-end gap-[3px] mt-1">
                  {badges.map((BadgeIcon, i) => <BadgeIcon key={i} size={13} strokeWidth={1.8} className="text-text-3" />)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-5">
          <button onClick={() => showToast('Loading more rankings…', 'info')}
            className="px-6 py-2.5 border-[1.5px] border-border rounded-full text-[14px] font-medium
                       text-text-2 hover:border-primary hover:text-primary transition-all">
            Load more rankings
          </button>
        </div>

        {/* How points work */}
        <div className="mt-5 bg-surface-2 rounded-xl p-5">
          <div className="font-display font-bold text-[14px] text-text-1 mb-3">How points are earned</div>
          <div className="flex flex-col gap-2">
            {PTS_RULES.map(([RuleIcon, label, pts]) => (
              <div key={label} className="flex items-center justify-between text-[13px]">
                <span className="text-text-2 flex items-center gap-2"><RuleIcon size={13} strokeWidth={1.8} className="text-text-3 flex-shrink-0" />{label}</span>
                <span className="font-semibold text-primary">{pts}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
