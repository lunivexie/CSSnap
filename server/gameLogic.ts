export interface PlayerState {
  player1: string;
  player2: string;
}

export interface RoomScores {
  player1: number;
  player2: number;
}

export interface RoomState {
  id: string;
  players: PlayerState;
  scores: RoomScores;
  mode: string;
  target: any;
  startTime: number;
  status: 'playing' | 'finished';
  timer: NodeJS.Timeout | null;
}

export interface JoinQueueResult {
  status: 'already_in_room' | 'already_in_queue' | 'queued' | 'matched';
  roomId?: string;
  room?: RoomState;
}

export interface LeaveRoomResult {
  status: 'removed_from_queue' | 'room_closed';
  roomId?: string;
  opponentId?: string;
}

/**
 * Robust Game Session Manager.
 * Handles matchmaking, room lifecycles, and game modes.
 */
export class RoomManager {
  public rooms: Map<string, RoomState>;
  public playerToRoom: Map<string, string>;
  public queues: Record<string, string[]>;

  constructor() {
    this.rooms = new Map(); // roomId -> Room object
    this.playerToRoom = new Map(); // socketId -> roomId
    this.queues = {
      standard: [],
      daily: [],
      blind: []
    };
  }

  /**
   * Adds a player to the queue and returns match info if a pair is formed.
   */
  addToQueue(socketId: string, mode: string = 'standard', target: any = {}): JoinQueueResult {
    if (this.playerToRoom.has(socketId)) {
      const existingRoomId = this.playerToRoom.get(socketId);
      return { roomId: existingRoomId, status: 'already_in_room' };
    }

    // Default to standard if mode is unrecognized
    if (!this.queues[mode]) mode = 'standard';
    const queue = this.queues[mode];
    if (queue.includes(socketId)) return { status: 'already_in_queue' };

    queue.push(socketId);

    if (queue.length >= 2) {
      const p1 = queue.shift()!;
      const p2 = queue.shift()!;
      return this._createRoom(p1, p2, mode, target);
    }

    return { status: 'queued' };
  }

  private _createRoom(p1: string, p2: string, mode: string, target: any): JoinQueueResult {
    const roomId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const room: RoomState = {
      id: roomId,
      players: { player1: p1, player2: p2 },
      scores: { player1: 0, player2: 0 },
      mode,
      target,
      startTime: Date.now(),
      status: 'playing',
      timer: null
    };

    this.rooms.set(roomId, room);
    this.playerToRoom.set(p1, roomId);
    this.playerToRoom.set(p2, roomId);

    return { roomId, room, status: 'matched' };
  }

  removeFromQueue(socketId: string): boolean {
    for (const mode in this.queues) {
      const index = this.queues[mode].indexOf(socketId);
      if (index !== -1) {
        this.queues[mode].splice(index, 1);
        return true;
      }
    }
    return false;
  }

  leaveRoom(socketId: string): LeaveRoomResult | null {
    const roomId = this.playerToRoom.get(socketId);
    if (!roomId) {
      return this.removeFromQueue(socketId) ? { status: 'removed_from_queue' } : null;
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      this.playerToRoom.delete(socketId);
      return null;
    }

    const opponentId = room.players.player1 === socketId ? room.players.player2 : room.players.player1;

    // Cleanup
    if (room.timer) clearInterval(room.timer);
    this.rooms.delete(roomId);
    this.playerToRoom.delete(socketId);
    this.playerToRoom.delete(opponentId);

    return { roomId, opponentId, status: 'room_closed' };
  }

  getRoom(roomId: string): RoomState | undefined {
    return this.rooms.get(roomId);
  }

  updateScore(roomId: string, socketId: string, score: number): RoomScores | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const role = room.players.player1 === socketId ? 'player1' : 'player2';
    room.scores[role] = score;
    return room.scores;
  }
}
