import User from "../models/users.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sendMail.js";
import { generateToken } from "../utils/genToken.js";
import errorResponse from "../helpers/errorHandler.js";

import { manageSession } from "../utils/sessionUtils.js";
import { queueEmail } from "../service/mailQueue/producer.js";

const signUp = async (req, res) => {
  try {
    const { name, email, mobile, address, role, password } = req.body;

    if (!name || !email || !mobile) {
      return errorResponse(res, 400, "Name, Email, and Mobile are required.");
    }

    let existingUser = await User.findOne({ email }).select(
      "+password +isVerified +otp +otpExpiry"
    );

    if (existingUser) {
      if (existingUser.isVerified) {
        return errorResponse(res, 409, "User already exists.");
      }

      // User exists but is not verified, update details
      existingUser.name = name;
      existingUser.mobile = mobile;
      existingUser.address = address;
      existingUser.role = role;
      existingUser.password = await bcrypt.hash(
        password,
        Number(process.env.HASH_ROUND)
      );
    } else {
      existingUser = new User({
        name,
        email,
        mobile,
        password: await bcrypt.hash(password, Number(process.env.HASH_ROUND)),
        address,
        role,
        isVerified: false,
      });
    }

    const otp = crypto.randomInt(1000, 9999).toString();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
    existingUser.otp = await bcrypt.hash(otp, Number(process.env.HASH_ROUND));
    existingUser.otpExpiry = otpExpiry;
    existingUser.deleteAt = new Date(otpExpiry);
    // existingUser.deleteAt = new Date(otpExpiry) + 30 * 1000; //added 30 sec

    await existingUser.save();

    const data = { userName: existingUser.name, otp };

    // Send email without waiting for response to speed up API  this not check if user saved or not.
    sendEmail(existingUser.email, data, "verifyOtp").catch((err) =>
      console.error("Email sending error :", err)
    );

    return res.status(201).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete sign-up.",
    });
  } catch (error) {
    console.error("Error creating/updating user:", error);

    return errorResponse(
      res,
      500,
      "Internal Server Error.",
      error,
      "On Signup : Error creating/updating user"
    );
  }
};

const verify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return errorResponse(res, 400, "Email and OTP are required.");
    }

    const user = await User.findOne({ email }).select(
      "+otp +otpExpiry +isVerified"
    );

    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    if (user.isVerified) {
      return errorResponse(
        res,
        400,
        "User is already verified. Please log in."
      );
    }

    if (Date.now() > user.otpExpiry) {
      await User.updateOne(
        { _id: user._id },
        { $unset: { otp: "", otpExpiry: "", deleteAt: "" } }
      );
      return errorResponse(res, 401, "OTP expired. Request a new one.");
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      return errorResponse(res, 401, "Invalid OTP.");
    }

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          isVerified: true,
          lastLogin: {
            by: "password",
          },
        },
        $unset: {
          otp: "",
          otpExpiry: "",
          deleteAt: "",
        },
      }
    );

    const sessionId = await manageSession(user, req);
    generateToken(user, sessionId, res);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      description: "User Signed Up and logged In.",
      user: {
        id: user._id,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);

    return errorResponse(
      res,
      500,
      "Internal Server Error.",
      error,
      "On Verify : Error in verifying OTP"
    );
  }
};

const login = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;

    if (!email && !mobile) {
      return errorResponse(res, 400, "Please provide an email.");
    }

    const isEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhoneNumber = mobile && /^\d{10}$/.test(mobile);

    if (!isEmail && !isPhoneNumber) {
      return errorResponse(res, 400, "Invalid email format.");
    }

    const user = await User.findOne({
      $or: [{ email }, { mobile }],
    }).select("+password +isVerified +otp +otpExpiry +sessions  +knownIPs");

    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    if (!user.isVerified) {
      return errorResponse(
        res,
        403,
        "User is not verified. Please verify your account first.",
        null,
        "Regenerate Otp Or Sign-Up again."
      );
    }
    if (!user.password) {
      return errorResponse(
        res,
        403,
        "Password not set. Try Google Login.",
        null,
        "Login with Google and update your Profile Or Try Reset Password."
      );
    }
    if (isEmail) {
      if (!password) {
        return errorResponse(res, 400, "Password is required for email login.");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return errorResponse(res, 401, "Invalid credentials.");
      }
      user.lastLogin.by = "password";
      // await user.save();
    } else if (isPhoneNumber) {
      const otp = crypto.randomInt(100000, 999999).toString(); // Generate 6-digit OTP
      const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min validity
      const hashedOtp = await bcrypt.hash(otp, 10);

      user.otp = hashedOtp;
      user.otpExpiry = otpExpiry;

      // await user.save();
      // Update only OTP fields
      await User.updateOne({ _id: user._id }, { otp: hashedOtp, otpExpiry });
      // remove this savee above later

      // await sendSmsOtp(mobile, otp);

      return res.status(200).json({
        success: true,
        message: "OTP sent to your mobile number.",
        userId: user._id,
      });
    }
    console.log("Client IP:", req.clientIp);
    console.log("Device Info:", req.deviceInfo);

    const sessionId = await manageSession(user, req);
    generateToken(user, sessionId, res);

    console.log(`${user.name} : Log in Success`);

    return res.status(200).json({
      success: true,
      message: `${user.name} Logged-In successful.`,
      userId: user._id,
      sessionId,
      // token:token
    });
  } catch (error) {
    console.error("Error:", error);

    return errorResponse(
      res,
      500,
      "Internal Server Error.",
      error,
      "on Login : Error in Login "
    );
  }
};

const me = async (req, res) => {
  try {
    const myDetails = await User.findById(req.user.id).select(
      "-password -otp -otpExpiry -deleteAt -__v -lastLogin"
    );

    if (!myDetails) {
      return errorResponse(res, 404, "User not found.");
    }
    res.status(200).json({
      success: true,
      ip: req.ip,
      message: "Protected route accessed",
      sessionId: req.sessionId,
      user: myDetails,
    });
  } catch (error) {
    errorResponse(res, 500, "Error retrieving user details", error);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, mobile, address, role } = req.body;

    if (!req.user.id) {
      return errorResponse(res, 400, "User ID is required.");
    }
    // Update only provided fields
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (mobile) updateFields.mobile = mobile;
    if (address) updateFields.address = address;
    if (role) updateFields.role = role;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, select: "-password -otp -otpExpiry -deleteAt -__v" }
    );

    if (!updatedUser) {
      return errorResponse(res, 404, "User not found.");
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);

    errorResponse(
      res,
      500,
      "Internal Server Error.",
      error,
      "Update Profile : Error updating User."
    );
  }
};
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!req.user.id) {
      return errorResponse(res, 400, "User ID is required.");
    }
    const sessionId = req.sessionId; // from  middleware

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return errorResponse(res, 401, "Wrong Password");
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(process.env.HASH_ROUND)
    );

    await User.updateOne({ _id: req.user.id }, { password: hashedPassword });
    // 4) Remove ALL other sessions
    user.sessions = user.sessions.filter((s) => s.sessionId === sessionId);

    generateToken(user, sessionId, res);
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Error updating password", error);

    errorResponse(
      res,
      500,
      "Internal Server Error.",
      error,
      "Error on Update Password"
    );
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 400, "Please provide an email.");
    }

    const user = await User.findOne({ email }).select("+otp +otpExpiry");
    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await bcrypt.hash(otp, Number(process.env.HASH_ROUND));

    user.otp = hashedOtp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes

    // await user.save();
    await User.updateOne(
      { _id: user._id },
      {
        otp: hashedOtp,
        otpExpiry: Date.now() + 5 * 60 * 1000,
      }
    );

    const data = { email, otp, name: user.name };
    sendEmail(email, data, "passwordReset");
    // await queueEmail(email, data, "passwordReset");


    res
      .status(200)
      .json({ success: true, message: "OTP sent to your registered email." });
  } catch (error) {
    console.error("Error:", error);

    errorResponse(res, 500, "Internal Server Error.", error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return errorResponse(
        res,
        400,
        "Email, OTP, and new password are required."
      );
    }

    const user = await User.findOne({ email }).select("+otp +otpExpiry");

    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    if (!user.otp) {
      return errorResponse(res, 404, "OTP not found, generate a new one.");
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid || Date.now() > user.otpExpiry) {
      return errorResponse(res, 401, "Invalid or expired OTP.");
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(process.env.HASH_ROUND)
    );

    // user.password = hashedPassword;
    // user.otp = null;
    // user.otpExpiry = null;
    // await user.save();

    await User.updateOne(
      { _id: user._id },
      {
        password: hashedPassword,sessions: [],
        $unset: { otp: "", otpExpiry: "" },
      }
    );

    res
      .clearCookie("auth_token", {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        path: "/",
      })
      .status(200)
      .json({
        success: true,
        message: "Password reset successfully,All devices have been logged out—please log in again with your new password.",
      });
  } catch (error) {
    console.error("Error:", error);

    errorResponse(
      res,
      500,
      "Internal Server Error.",
      error,
      "On Reset Password."
    );
  }
};

const logOut = async (req, res) => {
  try {
    res.clearCookie("auth_token", {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
    });

    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);

    return errorResponse(res, 500, "Logout failed", error);
  }
};

// --

// Controller to list all active sessions for the user
const listSessions = async (req, res) => {
  const sessions = req.user.sessions.map((s) => ({
    sessionId: s.sessionId,
    ip: s.ip,
    userAgent: s.userAgent,
    deviceInfo: s.deviceInfo,
    createdAt: s.createdAt,
    lastUsed: s.lastUsed,
  }));
  res.status(200).json({ success: true, total: sessions.length, sessions });
};

// Controller to logout from a specific session
const logoutSession = async (req, res) => {
  const { sessionId } = req.params;
  await User.updateOne(
    { _id: req.user._id },
    { $pull: { sessions: { sessionId } } }
  );
  // If it's the current session, also clear cookie
  if (sessionId === req.sessionId) {
    res.clearCookie("auth_token", {
      httpOnly: true,
      sameSite: "Strict",
      path: "/",
    });
  }
  res.status(200).json({ success: true, message: "Session removed." });
};

// Controller to logout from all sessions
const logoutAll = async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $set: { sessions: [] } });
  res.clearCookie("auth_token", {
    httpOnly: true,
    sameSite: "Strict",
    path: "/",
  });
  res
    .status(200)
    .json({ success: true, message: "Logged out from all sessions." });
};
// --

export {
  signUp,
  verify,
  login,
  me,
  updateProfile,
  forgotPassword,
  resetPassword,
  logOut,
  updatePassword,
  listSessions,
  logoutSession,
  logoutAll,
};
