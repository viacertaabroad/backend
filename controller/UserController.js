import User from "../models/users.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sendMail.js";
import { generateToken } from "../utils/genToken.js";
import errorResponse from "../helpers/errorHandler.js";

// Helper function for error responses
// const errorResponse = (res, status, message, error = null) => {
//   const response = { success: false, message };
//   if (error) {
//     response.error = error.message;
//   }
//   return res.status(status).json(response);
// };

const signUp = async (req, res) => {
  try {
    const { name, email, mobile, address, role, password } = req.body;

    if (!name || !email || !mobile) {
      // return res.status(400).json({
      //   success: false,
      //   message: "Name, Email, and Mobile are required.",
      // });
      return errorResponse(res, 400, "Name, Email, and Mobile are required.");
    }

    // let existingUser = await User.findOne({ email });
    let existingUser = await User.findOne({ email }).select(
      "+password +isVerified +otp +otpExpiry"
    );

    if (existingUser) {
      if (existingUser.isVerified) {
        // return res.status(409).json({
        //   success: false,
        //   message: "User already exists.",
        // });
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
    // await sendEmail(existingUser.email, data, "verifyOtp");
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
    // return res.status(500).json({
    //   success: false,
    //   message: "Internal Server Error.",
    //   error: error.message,

    // });
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
      // return res.status(400).json({
      //   success: false,
      //   message: "Email and OTP are required.",
      // });
      return errorResponse(res, 400, "Email and OTP are required.");
    }

    // const user = await User.findOne({ email });
    const user = await User.findOne({ email }).select(
      "+otp +otpExpiry +isVerified"
    );

    if (!user) {
      // return res.status(404).json({
      //   success: false,
      //   message: "User not found.",
      // });
      return errorResponse(res, 404, "User not found.");
    }

    if (user.isVerified) {
      // return res.status(400).json({
      //   success: false,
      //   message: "User is already verified. Please log in.",
      // });
      return errorResponse(
        res,
        400,
        "User is already verified. Please log in."
      );
    }

    // if (Date.now() > user.otpExpiry) {
    //   user.otp = undefined;
    //   user.otpExpiry = undefined;
    //   user.deleteAt = undefined;
    //   await user.save();

    //   // return res.status(401).json({
    //   //   success: false,
    //   //   message: "OTP expired. Request a new one.",
    //   // });
    //   return errorResponse(res, 401, "OTP expired. Request a new one.");
    // }

    if (Date.now() > user.otpExpiry) {
      await User.updateOne(
        { _id: user._id },
        { $unset: { otp: "", otpExpiry: "", deleteAt: "" } }
      );
      return errorResponse(res, 401, "OTP expired. Request a new one.");
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      // return res.status(401).json({
      //   success: false,
      //   message: "Invalid OTP.",
      // });

      return errorResponse(res, 401, "Invalid OTP.");
    }

    // user.isVerified = true;
    // user.otp = undefined;
    // user.otpExpiry = undefined;
    // user.deleteAt = undefined;
    // await user.save();

    // Update only necessary fields
    await User.updateOne(
      { _id: user._id },
      {
        isVerified: true,
        $unset: { otp: "", otpExpiry: "", deleteAt: "" },
      }
    );

    generateToken(user, res);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      description: " User Signed Up and logged In.",
      user: {
        id: user._id,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    // return res.status(500).json({
    //   success: false,
    //   message: "Internal Server Error.",
    //   error: error.message,
    // });
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
      // return res.status(400).json({
      //   success: false,
      //   message: "Please provide an email or mobile number.",
      // });
      return errorResponse(res, 400, "Please provide an email.");
    }

    const isEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhoneNumber = mobile && /^\d{10}$/.test(mobile);

    if (!isEmail && !isPhoneNumber) {
      // return res.status(400).json({
      //   success: false,
      //   message: "Invalid email or phone number format.",
      // });
      return errorResponse(res, 400, "Invalid email format.");
    }

    const user = await User.findOne({
      $or: [{ email }, { mobile }],
    }).select("+password +isVerified +otp +otpExpiry");

    if (!user) {
      // return res
      //   .status(404)
      //   .json({ success: false, message: "User not found." });
      return errorResponse(res, 404, "User not found.");
    }

    // Check if the user is verified
    if (!user.isVerified) {
      // return res.status(403).json({
      //   success: false,
      //   message: "User is not verified. Please verify your account first.",
      //   description: "Regenerate Otp Or Sign-Up again.",
      // });
      return errorResponse(
        res,
        403,
        "User is not verified. Please verify your account first.",
        null,
        "Regenerate Otp Or Sign-Up again."
      );
    }

    if (isEmail) {
      if (!password) {
        // return res.status(400).json({
        //   success: false,
        //   message: "Password is required for email login.",
        // });
        return errorResponse(res, 400, "Password is required for email login.");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        // return res
        //   .status(401)
        //   .json({ success: false, message: "Invalid credentials." });
        return errorResponse(res, 401, "Invalid credentials.");
      }
    } else if (isPhoneNumber) {
      const otp = crypto.randomInt(100000, 999999).toString(); // Generate 6-digit OTP
      const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min validity
      const hashedOtp = await bcrypt.hash(otp, 10);

      user.otp = hashedOtp;
      user.otpExpiry = otpExpiry;

      // await user.save();
      // Update only OTP fields
      await User.updateOne({ _id: user._id }, { otp: hashedOtp, otpExpiry });

      // await sendSmsOtp(mobile, otp);

      return res.status(200).json({
        success: true,
        message: "OTP sent to your mobile number.",
        userId: user._id,
      });
    }
    generateToken(user, res);
    // const token = jwt.sign(
    //   {
    //     id: user._id,
    //     email: user.email,
    //     mobile: user.mobile,
    //     role: user.role,
    //   },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "7d" }
    // );

    // Set token as a cookie
    // res.setHeader(
    //   "Set-Cookie",
    //   cookie.serialize("auth_token", token, {
    //     httpOnly: true,
    //     secure: false, // false for local true for online
    //     sameSite: "lax",
    //     path: "/",
    //   })
    // );

    console.log(`${user.name} : Log in Success`);

    return res.status(200).json({
      success: true,
      message: `${user.name} Logged-In successful.`,
      userId: user._id,
      // token:token
    });
  } catch (error) {
    console.error("Error:", error);
    // return res
    //   .status(500)
    //   .json({ success: false, message: "Internal Server Error." });
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
    // const myDetails = await User.findById(req.user.id);
    const myDetails = await User.findById(req.user.id).select(
      "-password -otp -otpExpiry -deleteAt -__v"
    );

    if (!myDetails) {
      // return res
      //   .status(404)
      //   .json({ success: false, message: "User not found." });
      return errorResponse(res, 404, "User not found.");
    }
    res.status(200).json({
      success: true,
      message: "Protected route accessed",
      // fromToken: auth.user,
      user: myDetails,
    });
  } catch (error) {
    // res.status(500).json({
    //   success: false,
    //   message: "Error retrieving user details",
    //   error: error.message,
    // });
    errorResponse(res, 500, "Error retrieving user details", error);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, mobile, address, role } = req.body;

    if (!req.user.id) {
      // return res
      //   .status(400)
      //   .json({ success: false, message: "User ID is required." });

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

    // if (!updatedUser) {
    //   return res
    //     .status(404)
    //     .json({ success: false, message: "User not found." });
    // }

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
    // res.status(500).json({
    //   success: false,
    //   message: "Internal Server Error.",
    //   error: error.message,
    // });
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
      // return res
      //   .status(400)
      //   .json({ success: false, message: "User ID is required." });
      return errorResponse(res, 400, "User ID is required.");
    }
    // const user = await User.findById(req.user.id);

    // if (!user) {
    //   return res
    //     .status(404)
    //     .json({ success: false, message: "User not found." });
    // }
    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      // return res
      //   .status(401)
      //   .json({ success: false, message: "Wrong Password" });
      return errorResponse(res, 401, "Wrong Password");
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(process.env.HASH_ROUND)
    );
    // const updatedUser = await User.findByIdAndUpdate(
    //   req.user.id,
    //   { password: hashedPassword },
    //   { new: true }
    // );

    await User.updateOne({ _id: req.user.id }, { password: hashedPassword });
    // if (!updatedUser) {
    //   return res
    //     .status(404)
    //     .json({ success: false, message: "User not found." });
    // }

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Error updating password", error);
    // res.status(500).json({
    //   success: false,
    //   message: "Internal Server Error.",
    //   error: error.message,
    // });
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
      // return res
      //   .status(400)
      //   .json({ success: false, message: "Please provide an email." });
      return errorResponse(res, 400, "Please provide an email.");
    }

    // const user = await User.findOne({ email });
    const user = await User.findOne({ email }).select("+otp +otpExpiry");
    if (!user) {
      // return res
      //   .status(404)
      //   .json({ success: false, message: "User not found." });
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
    sendEmail(email, data, "password_Reset_Otp");

    res
      .status(200)
      .json({ success: true, message: "OTP sent to your registered email." });
  } catch (error) {
    console.error("Error:", error);

    // res.status(500).json({
    //   success: false,
    //   message: "Internal Server Error.",
    //   error: error.message,
    // });

    errorResponse(res, 500, "Internal Server Error.", error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      // return res.status(400).json({
      //   success: false,
      //   message: "Email, OTP, and new password are required.",
      // });
      return errorResponse(
        res,
        400,
        "Email, OTP, and new password are required."
      );
    }

    const user = await User.findOne({ email }).select("+otp +otpExpiry");

    if (!user) {
      // return res
      //   .status(404)
      //   .json({ success: false, message: "User not found." });
      return errorResponse(res, 404, "User not found.");
    }

    if (!user.otp) {
      // return res.status(404).json({
      //   success: false,
      //   message: "OTP not found, generate a new one.",
      // });
      return errorResponse(res, 404, "OTP not found, generate a new one.");
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid || Date.now() > user.otpExpiry) {
      // return res
      //   .status(401)
      //   .json({ success: false, message: "Invalid or expired OTP." });
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
        password: hashedPassword,
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
        message: "Password reset successfully, Log in again with new Password.",
      });
  } catch (error) {
    console.error("Error:", error);
    // res.status(500).json({
    //   success: false,
    //   message: "Internal Server Error.",
    //   error: error.message,
    // });
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
    // return res
    //   .status(500)
    //   .json({ success: false, message: "Logout failed", error });
    return errorResponse(res, 500, "Logout failed", error);
  }
};

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
};
