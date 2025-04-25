// File: chatbot/index.js
import { Server } from 'socket.io';
import setupChatbot from './socketLogic.js';

export function initChatbot(server) {
  const io = new Server(server, {
    cors: { origin: 'http://localhost:3000', methods: ['GET','POST'] }
  });
  setupChatbot(io);
  return io;
}
