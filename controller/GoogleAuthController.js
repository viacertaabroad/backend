import User from "../models/users.js";
import { oauth2client } from "../config/googleLoginCongif.js";
import { generateToken } from "../utils/genToken.js";
import axios from "axios";

const googleLogin = async (req, res) => {
  try {
    const { code } = req.query;
    const googlRes = await oauth2client.getToken(code);
    oauth2client.setCredentials(googlRes.tokens);

    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googlRes.tokens.access_token}`,
      {
        headers: {
          Authorization: `Bearer ${googlRes.tokens.id_token}`,
        },
      }
    );

    const { email, name, picture } = userRes.data;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        avatar: picture,
        isVerified: true,
      });
    } else {
      user.isVerified = true;
      await user.save();
    }

    generateToken(user, res);

    console.log(`${user.name} : Google log-in success`);

    res.status(200).json({
      status: true,
      user,
      message: `${user.name} User Logged in successfully via Google-Login `,
    });
  } catch (error) {
    console.log("error", error);
    res.status(200).json({
      status: false,
      message: `ERROR IN Log in via Google-Login `,
    });
  }
};

export { googleLogin };
