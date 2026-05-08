import React from 'react';
import { getRank } from '../utils/constants';

/**
 * Bio-Emerald ScoreBoard.
 * Floating HUD with nature-inspired glassmorphism and technical precision.
 */
export default function ScoreBoard({ timeRemaining, myScore, opponentScore, myNickname, opponentNickname, xp }) {
  const formatTime = (seconds) => {
    if (seconds === '∞') return '∞';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const rank = getRank(xp);
  const nextRank = rank.minXP === 10000 ? null : getRank(xp + 1000); // Approximation
  const isCritical = typeof timeRemaining === 'number' && timeRemaining <= 10;

  return (
    <div className="flex justify-center w-full sticky top-6 z-50">
      <div className="bg-[#0c120e]/80 backdrop-blur-3xl border border-emerald-500/10 px-10 py-4 rounded-3xl flex items-center gap-12 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        
        {/* User HUD */}
        <div className="flex flex-col items-center min-w-[120px]">
          <div className="flex items-center gap-2 mb-1">
             <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase truncate max-w-[90px]">
               {myNickname}
             </span>
          </div>
          <span className="text-3xl font-mono font-black text-emerald-50 tabular-nums">{myScore}%</span>
          <div className="w-full h-0.5 bg-emerald-950 mt-2 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 transition-all duration-500 shadow-[0_0_10px_#10b981]" style={{ width: `${(xp % 1000) / 10}%` }} />
          </div>
          <span className={`text-[7px] ${rank.color} mt-1 uppercase tracking-tighter font-bold`}>{rank.name}</span>
        </div>

        {/* Master Clock */}
        <div className="flex flex-col items-center px-10 border-x border-emerald-500/5">
          <span className="text-[8px] font-bold tracking-[0.4em] text-emerald-900 uppercase mb-1">NEURAL_SYNC</span>
          <span className={`text-5xl font-mono font-black tabular-nums transition-all duration-300 ${
            isCritical ? 'text-rose-500 scale-110 drop-shadow-[0_0_15px_#f43f5e] animate-pulse' : 'text-emerald-50'
          }`}>
            {formatTime(timeRemaining)}
          </span>
        </div>

        {/* Opponent HUD */}
        <div className="flex flex-col items-center min-w-[120px]">
          <div className="flex items-center gap-2 mb-1">
             <span className="text-[10px] font-black tracking-widest text-emerald-700 uppercase truncate max-w-[90px]">
               {opponentNickname || (timeRemaining === '∞' ? 'PRACTICE' : 'REMOTE')}
             </span>
          </div>
          <span className="text-3xl font-mono font-black text-emerald-50 tabular-nums">{opponentScore}%</span>
          <div className="w-full h-0.5 bg-emerald-950 mt-2 rounded-full" />
          <span className="text-[7px] text-emerald-900 mt-1 uppercase tracking-tighter font-bold">{timeRemaining === '∞' ? 'OFFLINE_MODE' : 'OPPONENT_NODE'}</span>
        </div>

      </div>
    </div>
  );
}
