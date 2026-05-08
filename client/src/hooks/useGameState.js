import { useReducer } from 'react';

const INITIAL_STATE = {
  phase: 'waiting', // waiting, matchmaking, playing, finished, tutorial, practice
  role: null,
  roomId: null,
  myCSS: '',
  opponentCSS: '',
  myScore: 0,
  opponentScore: 0,
  timeRemaining: 120,
  target: null,
  isDaily: false,
  isBlind: false,
  winner: null,
  theme: 'dark',
  nickname: localStorage.getItem('cssnap_nickname') || '',
  opponentNickname: '',
  isRegistered: !!localStorage.getItem('cssnap_nickname'),
  xp: parseInt(localStorage.getItem('cssnap_xp')) || 0,
  hasCompletedTutorial: localStorage.getItem('cssnap_tutorial_complete') === 'true',
  lastDailyDate: localStorage.getItem('cssnap_last_daily') || ''
};

function gameReducer(state, action) {
  const today = new Date().toISOString().split('T')[0];
  switch (action.type) {
    case 'REGISTER':
      localStorage.setItem('cssnap_nickname', action.payload);
      return { ...state, nickname: action.payload, isRegistered: true };

    case 'SYNC_USER':
      return {
        ...state,
        xp: action.payload.xp,
        lastDailyDate: action.payload.lastDailyDate || state.lastDailyDate
      };

    case 'ADD_XP':
      const xpMultiplier = (state.isDaily ? 2 : 1) * (state.isBlind ? 1.5 : 1);
      const newXP = state.xp + (action.payload * xpMultiplier);
      localStorage.setItem('cssnap_xp', newXP);
      
      if (state.isDaily) {
        localStorage.setItem('cssnap_last_daily', today);
      }
      
      return { 
        ...state, 
        xp: newXP, 
        lastDailyDate: state.isDaily ? today : state.lastDailyDate 
      };

    case 'START_MATCHMAKING':
      return { 
        ...state, 
        phase: 'matchmaking', 
        isDaily: !!action.payload?.isDaily,
        isBlind: !!action.payload?.isBlind
      };

    case 'CANCEL_MATCHMAKING':
      return { ...state, phase: 'waiting', isDaily: false, isBlind: false };

    case 'START_PRACTICE':
      return {
        ...state,
        phase: 'practice',
        target: action.payload.target,
        isDaily: false,
        isBlind: !!action.payload?.isBlind,
        myCSS: '',
        myScore: 0,
        timeRemaining: '∞'
      };

    case 'START_TUTORIAL':
      return {
        ...state,
        phase: 'tutorial',
        target: { width: "200px", height: "200px", backgroundColor: "rgb(16, 185, 129)", borderRadius: "50%" },
        myCSS: '',
        myScore: 0
      };

    case 'COMPLETE_TUTORIAL':
      localStorage.setItem('cssnap_tutorial_complete', 'true');
      return { ...state, phase: 'waiting', hasCompletedTutorial: true };

    case 'MATCH_FOUND':
      return {
        ...state,
        phase: 'playing',
        roomId: action.payload.roomId,
        role: action.payload.role,
        target: action.payload.target,
        timeRemaining: action.payload.duration,
        opponentNickname: action.payload.opponentNickname || '',
        myCSS: '',
        opponentCSS: '',
        myScore: 0,
        opponentScore: 0,
        winner: null
      };

    case 'UPDATE_MY_CSS':
      return { ...state, myCSS: action.payload };

    case 'UPDATE_OPPONENT_CSS':
      return { ...state, opponentCSS: action.payload };

    case 'UPDATE_SCORES':
      return {
        ...state,
        myScore: action.payload[state.role] || state.myScore,
        opponentScore: action.payload[state.role === 'player1' ? 'player2' : 'player1'] || state.opponentScore
      };

    case 'UPDATE_TUTORIAL_SCORE':
      return { ...state, myScore: action.payload };

    case 'TICK':
      return { ...state, timeRemaining: action.payload };

    case 'GAME_OVER':
      return {
        ...state,
        phase: 'finished',
        winner: action.payload.winner,
        myScore: action.payload.scores[state.role],
        opponentScore: action.payload.scores[state.role === 'player1' ? 'player2' : 'player1']
      };

    case 'RESET':
      return {
        ...INITIAL_STATE,
        nickname: state.nickname,
        isRegistered: state.isRegistered,
        xp: state.xp,
        hasCompletedTutorial: state.hasCompletedTutorial
      };

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  return [state, dispatch];
}
