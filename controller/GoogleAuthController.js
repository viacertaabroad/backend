import User from "../models/users.js";
import { oauth2client } from "../config/googleLoginCongif.js";
import { generateToken } from "../utils/genToken.js";
import axios from "axios";
import crypto from "crypto";
import getIp from "../utils/getIp.js";
import manageSession from "../utils/manageSession.js";

const googleLogin = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return errorResponse(res, 400, "Authorization code is required");
    }
    // Exchange code for tokens
    const tokenResponse = await oauth2client.getToken(code);
    oauth2client.setCredentials(tokenResponse.tokens);

    const googleUser = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokenResponse.tokens.access_token}`,
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.tokens.id_token}`,
        },
      }
    );

    const { email, name, picture } = googleUser.data;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        avatar: picture,
        isVerified: true,
      });
    } else {
      if (!user.avatar) {
        user.avatar = picture;
      }
      user.isVerified = true;
      user.lastLogin.by = "google";
      // await user.save();
    }
    //---
    // session logic
    //  . Handle sessions
    const ip = getIp(req);
    const userAgent = req.headers["user-agent"] || "";
    const ua = req.useragent.source;
    
    // (Optional) Log info about the device
    console.log("User is using:", {
     platform: req.useragent.platform,
     browser: req.useragent.browser,
     version: req.useragent.version,
     isMobile: req.useragent.isMobile,
     isDesktop: req.useragent.isDesktop,
     source: ua
   });
    // Notify if IP unknown
    // await sendVerificationIfUnknownIP(user, ip);

    // Manage/create session
    const sessionId = await manageSession(user, ip, userAgent);

    generateToken(user, sessionId, res);

    console.log(`Google login success - User: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: `${name} logged in successfully`,
      user,
      // data: {
      //   id: user._id,
      //   name: user.name,
      //   email: user.email,
      //   avatar: user.avatar,
      //   role: user.role,
      // },
    });

    // console.log(`${user.name} : Google log-in success`);

    // res.status(200).json({
    //   status: true,
    //   user,
    //   message: `${user.name} User Logged in successfully via Google-Login `,
    // });
  } catch (error) {
    console.log("error", error);
    res.status(200).json({
      status: false,
      message: `ERROR IN Log in via Google-Login `,
    });
  }
};

export { googleLogin };
