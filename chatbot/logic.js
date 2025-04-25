// File: chatbot/logic.js
import faqData from '../helpers/chatbot_data/faqData.js';
import { sendNewRoomNotification } from '../utils/sseManager.js';
import { setCache, getCache, removeCache } from '../utils/redisCache.js';
import { SUPPORT_HOURS, getContext, updateContext, clearContext } from './config.js';

// ephemeral maps & timers
const roomUsers      = new Map();   // roomId → Set(socketId)
const activeRooms    = new Set();   // all rooms waiting/active
const activityTimers = new Map();   // roomId → timeoutId
const warningTimers  = new Map();   // roomId → timeoutId

// — internal helpers —
async function handleRoomCleanup(io, roomId) {
  await removeCache(`room:${roomId}`);
  activeRooms.delete(roomId);

  clearTimeout(activityTimers.get(roomId));
  clearTimeout(warningTimers.get(roomId));
  activityTimers.delete(roomId);
  warningTimers.delete(roomId);

  clearContext(roomId);
  roomUsers.delete(roomId);

  io.to(roomId).emit('support_room_closed', { roomId });
  io.emit('active_support_rooms', Array.from(activeRooms));
}

async function scheduleActiveTimers(io, roomId) {
  // fetch room and compute remaining time
  const key = `room:${roomId}`;
  const room = await getCache(key);
  if (!room || room.status !== 'active') return;

  const now = Date.now();
  const remaining = room.closeTime - now;
  if (remaining <= 0) {
    return handleRoomCleanup(io, roomId);
  }

  // warning at 1 minute before close
  const warnIn = remaining - 60_000;
  if (warnIn > 0) {
    warningTimers.set(roomId, setTimeout(() => {
      io.to(roomId).emit('bot_message', {
        text: 'Support Request Room will close in 1 minute due to inactivity.',
        sender: 'bot',
        roomId,
      });
    }, warnIn));
  }

  // final close
  activityTimers.set(roomId, setTimeout(() => {

    handleRoomCleanup(io, roomId);
    io.to(roomId).emit('bot_message', {
        text: 'Support Request Room closed due to inactivity.',
        sender: 'bot',
        roomId,
      });
  }, remaining));
}
async function updateRoomActivity(io, roomId) {
  const key = `room:${roomId}`;
  const room = await getCache(key);
  if (!room || room.status !== 'active') return;
  // reset inactivity close countdown
  room.lastActivity = Date.now();
  room.closeTime    = Date.now() + 300_000; 
  await setCache(key, room, 300);

  // clear old timers and schedule new
  clearTimeout(activityTimers.get(roomId));
  clearTimeout(warningTimers.get(roomId));
  await scheduleActiveTimers(io, roomId);

// inform front-end of new closeTime
  io.to(roomId).emit('room_close_time', { roomId, closeTime: room.closeTime });

}

// — exported socket handlers —
export async function handleJoinRoom(io, socket, { roomId }) {
  if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Set());
  roomUsers.get(roomId).add(socket.id);
  io.to(roomId).emit('user_count_update', {
    count: roomUsers.get(roomId).size,
  });

  socket.join(roomId);
  const key = `room:${roomId}`;
  const room = await getCache(key);

  if (room) {
     // emit existing state so front-end can render warning/close timer and past messages
     socket.emit('support_room_state', {
      status: room.status,
      closeTime: room.closeTime,
      messages: room.messages || []
    });

    const msg = room.status === 'active'
      ? 'You have an ongoing active support request. Please wait here.'
      : 'Your request is queued. Please wait for an agent to join...';
    socket.emit('bot_message', { text: msg, sender: 'bot', roomId });
    // await updateRoomActivity(io, roomId);

    // only re-schedule timers for active rooms
    if (room.status === 'active') {
      await scheduleActiveTimers(io, roomId);
    }
  } else {
    setTimeout(() => {
      socket.emit('predefined_questions', {
        questions: faqData.questions.slice(0, 4).map(q => q.question),
      });
    }, 2000);
  }
}

export async function handleUserMessage(io, socket, { message, roomId }) {
  const key = `room:${roomId}`;
  const room = await getCache(key);

  if (room?.status === 'active') {

      
    await updateRoomActivity(io, roomId);
    return io.to(roomId).emit('new_message', {
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
      roomId,
    });
  }

  const lower = message.toLowerCase();
  const faq = faqData.questions.find(q => lower === q.question.toLowerCase());

  setTimeout(() => {
    io.to(roomId).emit('bot_message', {
      text: faq?.answer || 'Try again later.',
      sender: 'bot',
      followUp: faq?.followUp || [],
      roomId,
    });
  }, 1000);
}

export async function handleRequestSupport(io, socket, { roomId }) {
  const key = `room:${roomId}`;
  
  if (await getCache(key)) {
    return socket.emit('bot_message', {
      text: 'You already have a pending support request.',
      sender: 'bot',
      roomId,
    });
  }

  const hour = new Date().getHours();
  if (hour < SUPPORT_HOURS.start || hour >= SUPPORT_HOURS.end) {
    return socket.emit('bot_message', {
      text: `Support is open from ${SUPPORT_HOURS.start} to ${SUPPORT_HOURS.end}.`,
      sender: 'bot',
      roomId,
    });
  }

  await setCache(key, { status: 'waiting', 
    roomId,lastActivity: Date.now() }, 300);
  activeRooms.add(roomId);
  sendNewRoomNotification(roomId);

  io.emit('new_support_room', roomId);
  io.to(roomId).emit('bot_message', {
    text: 'A support agent will join in a moment. Chatbot is now off.',
    sender: 'bot',
    roomId,
  });
    // **IMMEDIATELY** tell this client that support-room is active
  socket.emit("support_room_status", { exists: true });

  activityTimers.set(roomId, setTimeout(async () => {
    const r = await getCache(key);
    if (r?.status === 'waiting') {
      io.to(roomId).emit('bot_message', {
        text: 'No agent joined in 5 minutes. Please try again later.',
        sender: 'bot',
        roomId,
      });
      await handleRoomCleanup(io, roomId);
    }
  }, 300_000));
}

export async function handleCancelSupport(io, socket, { roomId }) {
  await handleRoomCleanup(io, roomId);
  socket.emit('support_room_status', { exists: false });
  io.to(roomId).emit('bot_message', {
    text: 'Support Request is closed by User.',
    sender: 'bot',
    roomId,
  });
}

export async function handleCheckSupportRoom(io, socket, { roomId }) {
  const exists = Boolean(await getCache(`room:${roomId}`));
  socket.emit('support_room_status', { exists });
}

export function handleGetActiveRooms(io, socket) {
  socket.emit('active_support_rooms', Array.from(activeRooms));
}

export async function handleCloseSupportRoom(io, socket, { roomId }) {
  await handleRoomCleanup(io, roomId);
  io.to(roomId).emit('bot_message', {
    text: 'Support Request is closed by Agent.',
    sender: 'bot',
    roomId,
  });
}

export async function handleJoinAgent(io, socket, { roomId }) {
  const key = `room:${roomId}`;
  const room = await getCache(key);
  if (!room) return io.emit('support_room_closed', { roomId });

  room.status = 'active';
  room.lastActivity = Date.now();
  await setCache(key, room, 300);
  activeRooms.add(roomId);

  clearTimeout(activityTimers.get(roomId));
  clearTimeout(warningTimers.get(roomId));
  await updateRoomActivity(io, roomId);

  socket.join(roomId);
  io.emit('active_support_rooms', Array.from(activeRooms));

  io.to(roomId).emit('bot_message', {
    text: `An agent has joined the chat (Room: ${roomId}).`,
    sender: 'bot',
    roomId,
  });
}

export async function handleSupportMessage(io, socket, { roomId, message }) {
  await updateRoomActivity(io, roomId);
  io.to(roomId).emit('new_message', {
    text: message,
    sender: 'support',
    timestamp: new Date().toLocaleTimeString(),
    roomId,
  });
}

// Placeholder for future AI logic
export async function getAIResponse(message, context) {
  // TODO: plug your AI here
  return { text: 'AI response placeholder', followUp: [] };
}

export function handleDisconnect(io, socket) {
  for (const [rid, users] of roomUsers.entries()) {
    if (users.delete(socket.id)) {
      io.to(rid).emit('user_count_update', { count: users.size });
      if (users.size === 0) roomUsers.delete(rid);
    }
  }
}
