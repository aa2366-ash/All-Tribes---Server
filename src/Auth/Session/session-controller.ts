import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RequestHandler } from "express";
import { GetAccessToken, GetRefreshToken } from "../../Middleware/validate";
import { User } from "../User/user-model";
import { Sessions } from "./session-model";

interface IToken {
  email: string;
  id: string;
}

export const Token: RequestHandler = async (req, res) => {
  try {
    await body("refreshtoken").isString().run(req);
    const result = validationResult(req);

    if (!result.isEmpty())
      return res.status(401).json({ message: "Refresh token is null" });

    const { refreshtoken } = req.body;

    if (!refreshtoken)
      return res.status(401).json({ message: "Refresh token is null" });

    const userdoc = await Sessions.getSession(refreshtoken);
    if (!userdoc) {
      res
        .status(401)
        .json({ message: "Refresh token expired. User Logged out" });
      return;
    }

    jwt.verify(
      refreshtoken as string,
      process.env.REFRESH_TOKEN_SECRET as string,
      (err, user) => {
        if (err) {
          res
            .status(401)
            .json({ message: "Refresh token verification failed" });
          return;
        }
        const u = user as IToken;
        if (!u.email && !u.id) {
          return res
            .status(401)
            .json({ message: "User with refresh token is null" });
        } else {
          const accesstoken = GetAccessToken(u.email, u.id);
          return res
            .status(200)
            .json({ accesstoken, currentUser: userdoc.user });
        }
      }
    );
  } catch (err) {
    res.status(401).json({ message: "Fetch Acess token failed" });
  }
};

export const Login: RequestHandler = async (req, res, next) => {
  try {
    await body("email").isEmail().run(req);
    await body("password").isString().run(req);
    const result = validationResult(req);
    if (!result.isEmpty()) res.status(500).json({ error: result });
    const { email, password } = req.body;
    const userDoc = await User.findOne({ email });
    const user = userDoc?.toObject();
    if (!user)
      return res.status(401).json({ message: "Email Address does not exists" });
    const { hashpassword, _id, ...restUser } = user;
    const isValid = await bcrypt.compare(password, hashpassword);
    if (!isValid)
      return res.status(401).json({ message: "Password is incorrect" });
    const accesstoken = GetAccessToken(email, _id);
    const { refreshtoken } = GetRefreshToken(email, _id);
    const session = Sessions.create({ refreshtoken, userId: _id });
    return res.status(200).json({
      message: "login successfull",
      accesstoken,
      refreshtoken,
      user: restUser,
    });
  } catch (err) {
    res.status(500).json({ message: err.message, err });
  }
};

export const Logout: RequestHandler = async (req, res, next) => {
  try {
    await body("refreshtoken").isString().run(req);
    await body("userId").isString().run(req);

    const result = validationResult(req);
    if (!result.isEmpty())
      return res
        .status(401)
        .json({ message: "Session Expired. User Logged out" });

    const { refreshtoken, userId } = req.body;
    const session = await Sessions.findOneAndDelete({ refreshtoken, userId });
    res.status(200).json({ message: "User Logged out" });
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};
