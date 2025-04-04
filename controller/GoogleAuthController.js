import User from "../models/users.js";
import { oauth2client } from "../config/googleLoginCongif.js";
import { generateToken } from "../utils/genToken.js";
import axios from "axios";

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
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googlRes.tokens.access_token}`,
      {
        headers: {
          Authorization: `Bearer ${googlRes.tokens.id_token}`,
        },
      }
    );

    const { email, name, picture } = googleUser.data;

    // let user = await User.findOne({ email });
    // if (!user) {
    //   user = await User.create({
    //     name,
    //     email,
    //     avatar: picture,
    //     isVerified: true,
    //   });
    // } else {
    //   user.isVerified = true;
    //   await user.save();
    // }

    // Find or create user
    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          name,
          avatar: picture,
          isVerified: true,
          lastLogin: new Date(),
        },
        $setOnInsert: {
          // These fields only set if creating new user
          email,
          role: "user",
          loginMethod: "google",
        },
      },
      {
        upsert: true,
        new: true,
        lean: true,
      }
    );

    generateToken(user, res);

    console.log(`Google login success - User: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: `${name} logged in successfully`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
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
