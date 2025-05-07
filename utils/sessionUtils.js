import crypto from "crypto";
import useragent from "express-useragent"; // for .parse()

/**  Safely extract client IP as a string. */
export function getIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) {
    return fwd.split(",")[0].trim();
  }
  // req.ip and req.connection.remoteAddress are already strings
  return req.ip
    || req.connection?.remoteAddress
    || req.socket?.remoteAddress
    || "unknown";
}

/** * Build a consistent deviceInfo object. */
export function getDeviceInfo(req) {
  const ua = req.useragent || {};
  return {
    platform: ua.platform  || "unknown",
    browser:  ua.browser   || "unknown",
    version:  ua.version   || "unknown",
    isMobile: ua.isMobile  || false,
    isDesktop:ua.isDesktop || false,
    source:   ua.source    || req.headers["user-agent"] || "unknown",
  };
}

/**
 * ONE middleware to:
 *  - parse user-agent
 *  - attach req.clientIp   (string!)
 *  - attach req.deviceInfo
 */
export function sessionMiddleware(req, res, next) {
  // parse UA into req.useragent
  req.useragent  = useragent.parse(req.headers["user-agent"] || ""); 
  req.clientIp   = getIp(req);// extract only the IP string
  req.deviceInfo = getDeviceInfo(req);
  next();
}

/**
 * Create or update a session record on the user model.
 * NOTE: signature takes (user, req) — so ip is always the string req.clientIp
 */
export async function manageSession(user, req) {
  const now        = new Date();
  const ip         = req.clientIp;  //   to be a string
  const deviceInfo = req.deviceInfo;

  // Find existing by ip + UA string
  const existing = user.sessions.find(
    s => s.ip === ip && s.userAgent === deviceInfo.source
  );

  let sessionId;
  if (existing) {
    existing.lastUsed  = now;
    existing.createdAt = now;
    sessionId = existing.sessionId;
  } else {
    sessionId = crypto.randomUUID();
    user.sessions.push({
      sessionId,
      ip,                        
      userAgent: deviceInfo.source,  
      deviceInfo,
      createdAt: now,
      lastUsed: now,
    });
  }

  await user.save();
  return sessionId;
}
