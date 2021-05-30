import { RequestHandler } from "express";
import { User } from "./user-model";
import { ReqUser } from "../../Middleware/validate";

export const GetUser: RequestHandler = async (req, res) => {
  try {
    const userreq = req.user as ReqUser;
    const { email, id } = userreq;
    const userDoc = await User.findOne({ email });
    const user = userDoc?.toObject();
    if (!user)
      return res.status(401).json({ message: "Email Address does not exists" });
    const { hashpassword, _id, ...restUser } = user;
    return res.status(200).json({
      message: "login successfull",
      user: restUser,
    });
  } catch (err) {
    res.status(500).json({ message: err.message, err });
  }
};
