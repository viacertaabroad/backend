import jwt from "jsonwebtoken";

export const generateToken = (user, sessionId, res) => {
  const payload = {
    id: user._id,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    sessionId,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: false, // true in productioin
    sameSite: "Lax", // "Strict" , //"None", // Required for cross-origin authentication make none in production
    path: "/", // Available throughout the site
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiry
  });
  console.log("Cookies Set.");
};
