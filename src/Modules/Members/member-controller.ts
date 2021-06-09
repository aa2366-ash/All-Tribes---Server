import { RequestHandler } from "express";
import { Members } from "./member-model";
import { body, validationResult, query, param } from "express-validator";
import { ReqUser } from "../../Middleware/validate";
import { Tribe } from "../Tribes/tribe-model";

export const CreateFollower: RequestHandler = async (req, res) => {
  try {
    await param("tribeId").isString().run(req);
    const result = validationResult(req);
    if (!result.isEmpty())
      return res.status(400).json({
        err: result.array(),
        message: "Invalid Request. Failed at express validator",
      });

    const tribeId = req.params.tribeId;
    const user = req.user as ReqUser;
    const memberdoc = await Members.create({
      tribeId,
      userId: user.id,
      type: "Follower",
    });
    const member = memberdoc.toObject();
    const incrementmember = await Tribe.addFollower(tribeId);
    return res.status(201).json({ message: "Successfully Joined the tribe" });
  } catch (err) {
    res.status(400).json({ message: err.message, err });
  }
};

export const RemoveFollower: RequestHandler = async (req, res) => {};

export const GetFollowersList: RequestHandler = async (req, res) => {};
