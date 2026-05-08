import React, { useEffect, useCallback, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { socket } from '../socket';
import { useGameState } from '../hooks/useGameState';
import { scoreCSS } from '../utils/cssScorer';
import { playSound } from '../utils/audio';
import { TARGETS, getRank } from '../utils/constants';
import ScoreBoard from '../components/ScoreBoard';
import CSSEditor from '../components/CSSEditor';
import PreviewFrame from '../components/PreviewFrame';
import TutorialOverlay from '../components/TutorialOverlay';

const DEBOUNCE_MS = 300;

export default function BattlePage() {
  const [state, dispatch] = useGameState();
  const [tempNickname, setTempNickname] = useState('');
  const [showOpponentCode, setShowOpponentCode] = useState(false);
  const [showBlindTarget, setShowBlindTarget] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const debounceTimer = useRef(null);
  const celebrationFired = useRef(false);

  const rank = getRank(state.xp);

  // Blind Mode Logic
  useEffect(() => {
    if (state.isBlind && state.phase === 'playing') {
      const timer = setTimeout(() => {
        setShowBlindTarget(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowBlindTarget(true);
    }
  }, [state.isBlind, state.phase]);

  // Socket Connection & Global Events
  useEffect(() => {
    socket.connect();

    socket.on('user_synced', (data) => {
      dispatch({ type: 'SYNC_USER', payload: data });
    });

    socket.on('match_found', (config) => {
      celebrationFired.current = false;
      playSound('match_found');
      dispatch({ type: 'MATCH_FOUND', payload: config });
    });

    socket.on('tick', ({ remaining }) => {
      if (remaining <= 10 && remaining > 0) playSound('tick');
      dispatch({ type: 'TICK', payload: remaining });
    });

    socket.on('opponent_css', ({ css }) => {
      dispatch({ type: 'UPDATE_OPPONENT_CSS', payload: css });
    });

    socket.on('score_update', (scores) => {
      dispatch({ type: 'UPDATE_SCORES', payload: scores });
    });

    socket.on('game_over', (result) => {
      if (result.winner === state.role) {
        playSound('win');
        fireVictoryConfetti();
      } else {
        playSound('lose');
      }
      
      if (result.newXp && result.newXp[state.role]) {
        dispatch({ type: 'SYNC_USER', payload: { xp: result.newXp[state.role] } });
      }
      
      dispatch({ type: 'GAME_OVER', payload: result });
    });

    socket.on('opponent_disconnected', () => {
      alert('NODE_ABORTED: Opponent uplink lost.');
      dispatch({ type: 'RESET' });
    });

    return () => {
      socket.off();
      socket.disconnect();
    };
  }, [dispatch, state.role]);

  // Metric Extraction & Real-time Scoring
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'metrics' && (state.phase === 'playing' || state.phase === 'tutorial' || state.phase === 'practice')) {
        const score = scoreCSS(event.data.metrics, state.target);
        
        if (state.phase === 'tutorial' || state.phase === 'practice') {
           dispatch({ type: 'UPDATE_TUTORIAL_SCORE', payload: score });
        } else {
           if (score === 100 && !celebrationFired.current) {
             celebrationFired.current = true;
             firePerfectConfetti();
           }

           if (score !== state.myScore) {
             socket.emit('request_score', { roomId: state.roomId, metrics: event.data.metrics });
           }
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [state.phase, state.target, state.roomId, state.myScore, dispatch]);

  const handleCSSChange = (newCSS) => {
    dispatch({ type: 'UPDATE_MY_CSS', payload: newCSS });
    
    if (state.phase === 'playing' && state.roomId) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        socket.emit('css_update', { roomId: state.roomId, css: newCSS });
      }, DEBOUNCE_MS);
    }
  };

  const firePerfectConfetti = () => {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#34d399', '#ffffff'] });
  };

  const fireVictoryConfetti = () => {
    const end = Date.now() + 3000;
    const colors = ['#10b981', '#059669'];
    (function frame() {
      confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  };

  if (!state.isRegistered) {
    return (
      <div className="min-h-screen bg-[#060907] bg-particles flex flex-col items-center justify-center p-4">
        <div className="relative z-10 w-full max-w-lg bg-black/60 backdrop-blur-3xl border-t-2 border-emerald-500 p-12 shadow-[0_0_100px_rgba(16,185,129,0.1)]">
           <div className="text-center mb-10">
             <div className="text-[10px] font-mono font-black text-emerald-500 tracking-[0.5em] uppercase mb-4 opacity-50">System_Initialization</div>
             <h2 className="text-6xl font-black tracking-tighter text-white italic mb-2 select-none">CSSNAP<span className="text-emerald-500">.</span></h2>
             <p className="text-emerald-500/40 text-[9px] font-mono tracking-widest uppercase">Precision_Dueling_Engine v2.0</p>
           </div>
           
           <form onSubmit={(e) => { e.preventDefault(); if (tempNickname.trim()) { playSound('click'); dispatch({ type: 'REGISTER', payload: tempNickname.trim() }); } }} className="space-y-8">
              <div className="group">
                <label className="block text-[9px] font-mono font-bold text-emerald-500/30 uppercase tracking-[0.3em] mb-3 group-focus-within:text-emerald-500 transition-colors">User_Access_Token</label>
                <input 
                  type="text" 
                  value={tempNickname}
                  onChange={(e) => setTempNickname(e.target.value)}
                  className="w-full bg-white/5 border-b-2 border-white/10 px-0 py-4 text-2xl text-white font-mono focus:border-emerald-500 outline-none transition-all placeholder:text-white/5"
                  placeholder="ENTER_NICKNAME"
                  maxLength={15}
                  required
                />
              </div>
              
              <button className="btn-tetrio w-full bg-emerald-500 text-black py-5 font-black text-sm tracking-[0.4em] uppercase shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                Initialize_Link()
              </button>
           </form>
        </div>
      </div>
    );
  }

  if (state.phase === 'waiting') {
    const today = new Date().toISOString().split('T')[0];
    const isDailyDone = state.lastDailyDate === today;

    return (
      <div className="min-h-screen bg-[#060907] bg-particles flex flex-col items-center justify-center p-4">
        <div className="relative z-10 w-full max-w-6xl animate-fade-in-up">
          
          <div className="flex flex-col md:flex-row gap-12 items-center">
             <div className="w-full md:w-80 bg-black/40 backdrop-blur-2xl border-l-4 border-emerald-500 p-8 flex flex-col gap-6">
                <div className="space-y-1">
                   <div className="text-[9px] font-mono text-emerald-500/40 tracking-widest uppercase">Authenticated_Node</div>
                   <div className="text-2xl font-black text-white truncate">{state.nickname}</div>
                </div>
                
                <div className="space-y-1">
                   <div className="text-[9px] font-mono text-emerald-500/40 tracking-widest uppercase">System_Rank</div>
                   <div className={`text-lg font-black tracking-widest ${rank.color}`}>{rank.name}</div>
                   <div className="w-full h-1 bg-white/5 mt-2 overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(state.xp % 1000) / 10}%` }} />
                   </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                   <div className="flex flex-col">
                      <span className="text-[8px] font-mono text-white/20 uppercase">Total_XP</span>
                      <span className="text-xs font-mono font-bold text-emerald-500">{state.xp.toLocaleString()}</span>
                   </div>
                   <button 
                     onClick={() => { playSound('click'); localStorage.clear(); window.location.reload(); }}
                     className="text-[8px] font-mono text-rose-900 hover:text-rose-500 transition-colors uppercase"
                   >
                     [Term_Session]
                   </button>
                </div>
             </div>

             <div className="flex-1 space-y-4">
                <h1 className="text-[10rem] font-black tracking-tighter text-white italic leading-none mb-8 select-none text-glow opacity-90">
                  CSSNAP<span className="text-emerald-500">.</span>
                </h1>

                <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-2 bg-black/40 p-4 border border-emerald-500/20 rounded mb-2">
                      <div className="text-[9px] font-mono text-emerald-500/40 tracking-widest uppercase mb-3 text-center">Select_Threat_Level</div>
                      <div className="grid grid-cols-4 gap-2">
                        {['easy', 'medium', 'hard', 'impossible'].map((d) => (
                          <button
                            key={d}
                            onClick={() => { playSound('click'); setSelectedDifficulty(d); }}
                            className={`py-2 px-1 text-[8px] font-black uppercase tracking-tighter transition-all border ${
                              selectedDifficulty === d 
                              ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_0_10px_#10b981]' 
                              : 'bg-white/5 text-emerald-500/40 border-white/10 hover:border-emerald-500/30'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                   </div>

                   <button
                     onClick={() => { playSound('click'); dispatch({ type: 'START_MATCHMAKING' }); socket.emit('join_queue', { nickname: state.nickname, difficulty: selectedDifficulty }); }}
                     className="btn-tetrio bg-emerald-500 text-black p-8 text-left group"
                   >
                      <div className="text-[10px] font-black tracking-widest opacity-50 mb-1">STANDARD_DUEL</div>
                      <div className="text-3xl font-black italic tracking-tighter">MATCHMAKING</div>
                   </button>

                   <button
                     disabled={isDailyDone}
                     onClick={() => { playSound('click'); dispatch({ type: 'START_MATCHMAKING', payload: { isDaily: true } }); socket.emit('join_queue', { nickname: state.nickname, mode: 'daily' }); }}
                     className={`btn-tetrio p-8 text-left relative ${isDailyDone ? 'bg-white/5 opacity-50' : 'bg-indigo-600 text-white'}`}
                   >
                      <div className="text-[10px] font-black tracking-widest opacity-50 mb-1">DAILY_CHALLENGE</div>
                      <div className="text-3xl font-black italic tracking-tighter">{isDailyDone ? 'COMPLETED' : 'DAILY_SYNC'}</div>
                      {!isDailyDone && <div className="absolute top-4 right-4 bg-white text-indigo-600 text-[8px] px-2 py-1 font-black">2X_XP</div>}
                   </button>

                   <button
                     onClick={() => { playSound('click'); dispatch({ type: 'START_MATCHMAKING', payload: { isBlind: true } }); socket.emit('join_queue', { nickname: state.nickname, mode: 'blind', difficulty: selectedDifficulty }); }}
                     className="btn-tetrio bg-rose-600 text-white p-8 text-left"
                   >
                      <div className="text-[10px] font-black tracking-widest opacity-50 mb-1">HARDCORE_MODE</div>
                      <div className="text-3xl font-black italic tracking-tighter">BLIND_DUEL</div>
                      <div className="absolute top-4 right-4 bg-white text-rose-600 text-[8px] px-2 py-1 font-black">1.5X_XP</div>
                   </button>

                   <div className="grid grid-cols-1 gap-4">
                      <button
                        onClick={() => { 
                          playSound('click'); 
                          const tierTargets = TARGETS[selectedDifficulty] || TARGETS.easy;
                          const randomTarget = tierTargets[Math.floor(Math.random() * tierTargets.length)];
                          dispatch({ type: 'START_PRACTICE', payload: { target: randomTarget.styles, isBlind: false } }); 
                        }}
                        className="btn-tetrio bg-white/5 border border-white/10 text-white p-4 text-sm font-bold tracking-widest uppercase hover:bg-white/10"
                      >
                        Practice_Simulation
                      </button>
                      <button
                        onClick={() => { playSound('click'); dispatch({ type: 'START_TUTORIAL' }); }}
                        className="btn-tetrio bg-white/5 border border-white/10 text-white p-4 text-sm font-bold tracking-widest uppercase hover:bg-white/10"
                      >
                        Training_Protocol
                      </button>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    );
  }

  if (state.phase === 'matchmaking') {
    return (
      <div className="min-h-screen bg-[#060907] bg-particles flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center text-center animate-fade-in-up">
           <div className="w-24 h-24 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]" />
           <h2 className="text-4xl font-black italic tracking-tighter text-emerald-50 mb-2">{state.isDaily ? 'SYNCING_DAILY_MISSION' : (state.isBlind ? 'CALIBRATING_BLIND_ARRAY' : 'SYNCHRONIZING_NODES')}</h2>
           <p className="text-emerald-500/40 font-mono text-[10px] tracking-[0.4em] uppercase mb-12">Locating_compatible_stylist_in_grid...</p>
           
           <button 
             onClick={() => { playSound('click'); dispatch({ type: 'CANCEL_MATCHMAKING' }); window.location.reload(); }}
             className="text-[10px] font-black tracking-[0.3em] text-emerald-900 border border-emerald-900/30 px-6 py-3 rounded uppercase hover:text-rose-500 hover:border-rose-500/30 transition-all"
           >
             Abort_Uplink()
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060907] grid-bg-fine text-emerald-50 selection:bg-emerald-500/20">
      <div className="max-w-[1600px] mx-auto px-6 py-6 flex flex-col h-screen">
        
        {state.phase === 'tutorial' && (
          <TutorialOverlay 
            onComplete={() => dispatch({ type: 'COMPLETE_TUTORIAL' })} 
            currentScore={state.myScore} 
            currentCSS={state.myCSS}
          />
        )}

        <div data-tutorial="scoreboard">
          <ScoreBoard 
            timeRemaining={state.phase === 'tutorial' || state.phase === 'practice' ? '∞' : state.timeRemaining} 
            myScore={state.myScore} 
            opponentScore={state.phase === 'tutorial' || state.phase === 'practice' ? 0 : state.opponentScore}
            myNickname={state.nickname}
            opponentNickname={state.phase === 'tutorial' ? 'AI_UNIT' : (state.phase === 'practice' ? 'SIMULATOR' : state.opponentNickname)}
            xp={state.xp}
          />
        </div>

        <main className="grid grid-cols-12 gap-8 flex-1 mt-12 mb-4 min-h-0 animate-fade-in-up">
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-6 min-h-0">
            <div className="flex-1 min-h-0 shadow-2xl transition-transform duration-500 hover:scale-[1.01]" data-tutorial="editor">
              <CSSEditor 
                value={showOpponentCode ? state.opponentCSS : state.myCSS} 
                onChange={showOpponentCode ? () => {} : handleCSSChange} 
                readOnly={showOpponentCode}
              />
            </div>
            <div className="grid grid-cols-2 gap-6 h-[320px]">
               <div className="transition-transform duration-500 hover:scale-[1.02]" data-tutorial="local-preview"><PreviewFrame css={state.myCSS} label="Local_Buffer" isLocal={true} /></div>
               <div className="transition-transform duration-500 hover:scale-[1.02]" data-tutorial="target-design">
                  {showBlindTarget && state.target ? (
                    <PreviewFrame label="Global_Mission" isTarget={true} targetStyles={state.target} />
                  ) : (
                    <div className="flex flex-col flex-1 h-[300px] border border-rose-500/20 bg-rose-500/5 rounded-lg items-center justify-center animate-pulse">
                       <span className="text-[10px] font-mono font-bold text-rose-500 tracking-[0.4em] uppercase">TARGET_LOST</span>
                    </div>
                  )}
               </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 min-h-0">
            <div className="flex-1 min-h-0 transition-transform duration-500 hover:scale-[1.01]">
               <PreviewFrame css={state.opponentCSS} label={state.phase === 'tutorial' || state.phase === 'practice' ? 'Simulation_Feed' : "Remote_Stream"} />
            </div>
            
            <div className="h-[220px] bg-emerald-950/10 border border-emerald-500/5 rounded-xl p-8 flex flex-col justify-center relative overflow-hidden">
              {state.phase === 'finished' ? (
                <div className="text-center animate-fade-in-up">
                  <h2 className="text-5xl font-black mb-2 tracking-tighter italic uppercase">
                    {state.winner === 'draw' ? "PROTOCOL_DRAW" : (state.winner === state.role ? "MISSION_ACCOMPLISHED" : "MISSION_FAILURE")}
                  </h2>
                  <button onClick={() => { playSound('click'); window.location.reload(); }} className="bg-emerald-500 text-[#060907] px-10 py-2.5 rounded-sm text-[10px] font-black tracking-widest uppercase hover:bg-emerald-400 hover:scale-105 transition-transform active:scale-95">Return_to_Grid</button>
                </div>
              ) : (
                <div className="space-y-8">
                   <div className="flex justify-between items-end">
                      <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-emerald-500/40 uppercase">Bio_Telemetry</span>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                        <span className="text-[8px] text-emerald-500 font-bold uppercase">{state.phase === 'practice' ? 'Practice_Session' : (state.phase === 'tutorial' ? 'Simulation_Active' : 'Uplink_Established')}</span>
                      </div>
                   </div>
                   <div className="space-y-6">
                      <HUDProgressBar label={`${state.nickname}`} value={state.myScore} color="bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
                      <HUDProgressBar label={state.phase === 'tutorial' || state.phase === 'practice' ? 'Simulator' : `${state.opponentNickname || 'Opponent'}`} value={state.phase === 'tutorial' || state.phase === 'practice' ? 0 : state.opponentScore} color="bg-emerald-800 shadow-[0_0_20px_rgba(6,78,59,0.2)]" />
                   </div>

                   {state.phase === 'practice' && (
                     <button 
                       onClick={() => { playSound('click'); window.location.reload(); }}
                       className="w-full mt-4 py-2 border border-emerald-500/20 text-[9px] font-black tracking-[0.2em] text-emerald-500/40 uppercase hover:bg-emerald-500/5 hover:text-emerald-500 transition-all"
                     >
                       Terminate_Practice_Session()
                     </button>
                   )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function HUDProgressBar({ label, value, color }) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-[9px] font-mono font-bold text-emerald-500/40 mb-2 tracking-widest uppercase italic">
        <span>{label}</span>
        <span className="text-emerald-50">{value}%</span>
      </div>
      <div className="w-full h-1 bg-emerald-500/5 rounded-full overflow-hidden border border-white/5">
        <div className={`h-full ${color} transition-all duration-1000 ease-out`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
