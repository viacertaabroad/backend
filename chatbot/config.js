// File: chatbot/config.js
// -- constants
export const SUPPORT_HOURS = { start: 10, end: 20 };

// -- simple in-memory convo context store
const contexts = new Map();
export function getContext(roomId) {
  return contexts.get(roomId) || {};
}
export function updateContext(roomId, delta) {
  contexts.set(roomId, { ...getContext(roomId), ...delta });
}
export function clearContext(roomId) {
  contexts.delete(roomId);
}
