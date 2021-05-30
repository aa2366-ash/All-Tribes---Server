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
    const result = validationResult(req);
    if (!result.isEmpty())
      return res.status(401).json({ message: ". Invalid user" });

    const { refreshtoken } = req.body;

    if (!refreshtoken)
      return res.status(401).json({ message: "No refreshToken in body" });

    const userdoc = await Sessions.getSession(refreshtoken);
    console.log(userdoc);
    if (!userdoc) {
      res.status(401).json({ message: "Session Expired. User Logged out" });
      return;
    }
    jwt.verify(
      refreshtoken as string,
      process.env.REFRESH_TOKEN_SECRET as string,
      (err, user) => {
        if (err) {
          res.status(401).json({ message: "Session Expired. User Logged out" });
          return;
        }
        const u = user as IToken;
        if (u.email && u.id) {
          const accessToken = GetAccessToken(u.email, u.id);
          res.status(200).json({ accessToken, currentUser: userdoc.user });
        } else
          res.status(401).json({ message: "Session Expired. User Logged out" });
      }
    );
  } catch (err) {
    res.status(401).json({ message: "Session Expired. User Logged out" });
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
    console.log(err);
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
