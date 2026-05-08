import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { RoomManager } from './gameLogic';
import { scoreCSS } from './cssScorer';
import { getUser, updateUserXP, saveMatch } from './db';
import { TARGETS } from '../client/src/utils/constants';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const rooms = new RoomManager();
const nicknameMap = new Map<string, string>();

const GAME_DURATION_S = 120;

io.on('connection', (socket: Socket) => {
  socket.on('join_queue', async ({ nickname, mode = 'standard', difficulty: preferredDifficulty }: { nickname?: string, mode?: string, difficulty?: string }) => {
    const nick = nickname || 'Anonymous';
    nicknameMap.set(socket.id, nick);
    
    let userXp = 0;
    try {
      const user = await getUser(nick);
      userXp = user.xp;
      socket.emit('user_synced', { xp: user.xp, lastDailyDate: user.last_daily_date });
    } catch (e) {
      console.error("DB Sync Error:", e);
    }
    
    const result = rooms.addToQueue(socket.id, mode);
    
    if (result.status === 'matched' && result.room && result.roomId) {
      const { roomId, room } = result;
      socket.join(roomId);
      
      const p1Socket = io.sockets.sockets.get(room.players.player1);
      if (p1Socket) p1Socket.join(roomId);

      // Determine Difficulty: Use preferred if valid, otherwise XP-based
      let difficulty: keyof typeof TARGETS = 'easy';
      if (preferredDifficulty && TARGETS[preferredDifficulty as keyof typeof TARGETS]) {
        difficulty = preferredDifficulty as keyof typeof TARGETS;
      } else {
        if (userXp > 5000) difficulty = 'impossible';
        else if (userXp > 2000) difficulty = 'hard';
        else if (userXp > 500) difficulty = 'medium';
      }

      let selectedTarget;
      const tierTargets = TARGETS[difficulty];
      
      if (mode === 'daily') {
        const day = new Date().getUTCDate();
        // Mix all targets for daily but use day to seed
        const allTargets = [...TARGETS.easy, ...TARGETS.medium, ...TARGETS.hard, ...TARGETS.impossible];
        selectedTarget = allTargets[day % allTargets.length].styles;
      } else {
        selectedTarget = tierTargets[Math.floor(Math.random() * tierTargets.length)].styles;
      }
      
      room.target = selectedTarget;

      const config = { roomId, target: selectedTarget, duration: GAME_DURATION_S, mode, difficulty };

      io.to(room.players.player1).emit('match_found', { 
        ...config, 
        role: 'player1', 
        opponentNickname: nicknameMap.get(room.players.player2) 
      });
      io.to(room.players.player2).emit('match_found', { 
        ...config, 
        role: 'player2', 
        opponentNickname: nicknameMap.get(room.players.player1) 
      });

      startRoomTimer(roomId);
    }
  });

  socket.on('css_update', ({ roomId, css }: { roomId: string, css: string }) => {
    socket.to(roomId).emit('opponent_css', { css });
  });

  socket.on('request_score', ({ roomId, metrics }: { roomId: string, metrics: any }) => {
    const room = rooms.getRoom(roomId);
    if (!room || !room.target) return;
    
    // Server-side score validation!
    const validatedScore = scoreCSS(metrics, room.target);
    const scores = rooms.updateScore(roomId, socket.id, validatedScore);
    
    if (scores) {
      io.to(roomId).emit('score_update', scores);
    }
  });

  socket.on('disconnect', () => {
    const cleanup = rooms.leaveRoom(socket.id);
    if (cleanup && cleanup.status === 'room_closed' && cleanup.opponentId) {
      io.to(cleanup.opponentId).emit('opponent_disconnected');
    }
    nicknameMap.delete(socket.id);
  });
});

function startRoomTimer(roomId: string) {
  const room = rooms.getRoom(roomId);
  if (!room) return;

  let remaining = GAME_DURATION_S;
  
  room.timer = setInterval(() => {
    const currentRoom = rooms.getRoom(roomId);
    if (!currentRoom) {
      if (room.timer) clearInterval(room.timer);
      return;
    }

    remaining -= 1;
    io.to(roomId).emit('tick', { remaining });

    if (remaining <= 0) {
      if (room.timer) clearInterval(room.timer);
      const winner = currentRoom.scores.player1 > currentRoom.scores.player2 
        ? 'player1' 
        : (currentRoom.scores.player2 > currentRoom.scores.player1 ? 'player2' : 'draw');
      
      // Calculate XP and update DB
      const p1Nickname = nicknameMap.get(currentRoom.players.player1) || 'Anonymous';
      const p2Nickname = nicknameMap.get(currentRoom.players.player2) || 'Anonymous';
      
      const xpMultiplier = (currentRoom.mode === 'daily' ? 2 : 1) * (currentRoom.mode === 'blind' ? 1.5 : 1);
      
      let p1XpAdd = 50;
      let p2XpAdd = 50;
      if (winner === 'player1') { p1XpAdd = 100; p2XpAdd = 50; }
      else if (winner === 'player2') { p1XpAdd = 50; p2XpAdd = 100; }
      
      p1XpAdd *= xpMultiplier;
      p2XpAdd *= xpMultiplier;

      (async () => {
        try {
          const p1Updated = await updateUserXP(p1Nickname, p1XpAdd, currentRoom.mode === 'daily');
          const p2Updated = await updateUserXP(p2Nickname, p2XpAdd, currentRoom.mode === 'daily');
          await saveMatch(roomId, p1Nickname, p2Nickname, winner, currentRoom.scores.player1, currentRoom.scores.player2, currentRoom.mode);

          io.to(roomId).emit('game_over', { 
            winner, 
            scores: currentRoom.scores,
            newXp: { player1: p1Updated.xp, player2: p2Updated.xp }
          });
        } catch (e) {
          console.error("Game Over DB Error:", e);
          io.to(roomId).emit('game_over', { winner, scores: currentRoom.scores });
        }
      })();
      
      rooms.leaveRoom(currentRoom.players.player1); // Auto-cleanup
    }
  }, 1000);
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`EMERALD_SERVER_UP@${PORT}`));
