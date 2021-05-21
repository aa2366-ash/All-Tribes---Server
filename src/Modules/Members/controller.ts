import { RequestHandler } from "express";
import { Members } from "./model";
import { body, validationResult } from "express-validator";
import { ReqUser } from "../../Middleware/validate";

export const CreateHandler: RequestHandler = async (req, res) => {
  await body("tribeId").isString().run(req);

  try {
    const result = validationResult(req);
    if (!result.isEmpty())
      res.status(400).json({
        err: result.array(),
        message: "Invalid Request. Failed at express validator",
      });

    const { tribeId } = req.body;
    const user = req.user as ReqUser;
    const doc = Members.create({ tribeId, userId: user.id, type: "Follower" });
    res.status(201).json({ message: "Successfully Joined the tribe" });
  } catch (err) {
    res.status(400).json({ message: err.message, err });
  }
};

export const UpdateHandler: RequestHandler = async () => {};

export const DeleteHandler: RequestHandler = async () => {};
