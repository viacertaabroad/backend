import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
});

const demoLimiter = rateLimit({
  max: 3,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: "We have received too many request. Please Try again after 15 min",
  legacyHeaders: false,
  trustProxy: false,
});
const logInLimit = rateLimit({
  max: 3,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message:
    "We have received too many Log-IN request. Please Try again after 15 min",
  // legacyHeaders: false,
  trustProxy: false,
});
const forgotLinkLimit = rateLimit({
  max: 2,
  windowMs: 60 * 60 * 1000, // 60 minutes
  message:
    "We have received too many Forgot Passworgod Mail request. Please Try again after 1 hours min",
  // legacyHeaders: false,
  trustProxy: false,
});
export { limiter, demoLimiter, logInLimit, forgotLinkLimit };
