import { RequestHandler } from "express";
import { Members } from "./model";
import { body, validationResult, query } from "express-validator";
import { ReqUser } from "../../Middleware/validate";
import { Tribe } from "../Tribes/model";

export const Create: RequestHandler = async (req, res) => {
  try {
    await body("tribeId").isString().run(req);
    const result = validationResult(req);
    if (!result.isEmpty())
      return res.status(400).json({
        err: result.array(),
        message: "Invalid Request. Failed at express validator",
      });

    const { tribeId } = req.body;
    const user = req.user as ReqUser;
    const memberdoc = await Members.create({
      tribeId,
      userId: user.id,
      type: "Follower",
    });
    const member = memberdoc.toObject();
    if (member) {
      const addmember = await Tribe.findOneAndUpdate(
        { _id: tribeId },
        { $inc: { members: 1 } }
      );
    }
    return res.status(201).json({ message: "Successfully Joined the tribe" });
  } catch (err) {
    res.status(400).json({ message: err.message, err });
  }
};
