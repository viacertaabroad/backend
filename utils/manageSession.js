import crypto from 'crypto';

export default async function manageSession(user, ip, userAgent) {
  const now = new Date();
  // Try find existing session
  const existing = user.sessions.find(
    (s) => s.ip === ip && s.userAgent === userAgent
  );

  let sessionId;
  if (existing) {
    existing.lastUsed = now;
    existing.createdAt = now;
    sessionId = existing.sessionId;
  } else {
    sessionId = crypto.randomUUID();
    user.sessions.push({
      sessionId,
      ip,
      userAgent,
      createdAt: now,
      lastUsed: now,
    });
  }

  // Persist one database write
  await user.save();
  return sessionId;
}
