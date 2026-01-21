import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export function setIO(socketIO: SocketIOServer) {
  io = socketIO;
}

export function getIO(): SocketIOServer | null {
  return io;
}
