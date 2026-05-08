import { io } from 'socket.io-client';

// In a real production app, this would be an environment variable.
const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

/**
 * Socket singleton to ensure we only have one connection active.
 */
export const socket = io(SOCKET_URL, {
  autoConnect: false,
});
