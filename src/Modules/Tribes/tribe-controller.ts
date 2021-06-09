import { Request, RequestHandler, Response } from "express";
import { Itribe, Tribe, ITribeDocument, TribeModel } from "./tribe-model";
import { body, param, query, validationResult } from "express-validator";
import { Member } from "../Members/member-model";
import { ReqUser } from "../../Middleware/validate";

//----------------------------------------------------------------------------------------------
export const CreateTribe = async (req: Request, res: Response) => {
  try {
    await body("name").isString().run(req);
    await body("description").isString().run(req);
    await body("avatarUrl").optional().isString().run(req);
    await body("coverUrl").optional().isString().run(req);

    const result = validationResult(req);
    if (!result.isEmpty())
      return res.status(400).json({ error: result.array() });

    const { name, description, avatarUrl, coverUrl } = req.body;
    const user = req.user as ReqUser;
    const tribe = await Tribe.create({
      name,
      creatorId: user.id,
      description,
      avatarUrl,
      coverUrl,
      members: 1,
    });
    const member = await Member.create({
      tribeId: tribe.id,
      userId: user.id,
      type: "Admin",
    });
    return res.status(201).json({
      message: "Tribe successfully created",
    });
  } catch (err) {
    res.status(401).json({ err, message: err.message });
  }
};

export const GetTribeList: RequestHandler = async (req, res) => {
  try {
    await query("type").isString().optional().run(req);
    const result = validationResult(req);
    if (!result.isEmpty())
      return res.status(400).json({
        err: result.array(),
        message: "Invalid Request. Failed at express validator",
      });
    const type = req.query.type ?? "All";
    const { id, email } = req.user as ReqUser;

    const tribedoc = await Member.find({
      userId: id,
      ...(type === "All" ? {} : { type }),
    }).populate("tribe");
    console.log("tribedoc", tribedoc);
    return res.status(200).json(tribedoc);
  } catch (err) {
    res.status(400).json({ message: err.message, err });
  }
};

export const GetTribe: RequestHandler = async (req, res) => {
  await param("tribeId").isMongoId().run(req);
  const result = validationResult(req);
  if (!result.isEmpty())
    return res.status(400).json({
      err: result.array(),
      message: "Invalid Request. Failed at express validator",
    });
  try {
    const tribeId = req.params.tribeId;
    const { id, email } = req.user as ReqUser;
    const isMember = Member.findOne({ tribeId, userId: id });
    if (!isMember) {
      // FIXME: statuscode
      return res
        .status(400)
        .json({ message: "Join tribe to get the tribe Information" });
    }
    const tribedoc = await Tribe.findOne({ _id: tribeId });
    const tribe = tribedoc?.toObject();
    if (!tribe)
      return res.status(400).json({ message: "Tribe does not exists" });
    return res
      .status(200)
      .json({ message: "Tribe data fetched successfully", data: tribe });
  } catch (err) {
    return res.status(500).json({ message: err.message, err });
  }
};

export const GetFollowSuggestionList: RequestHandler = async (req, res) => {
  try {
    const { id, email } = req.user as ReqUser;
    const suggestion = await Tribe.tribeSuggestion(id);
    return res.status(200).json(suggestion);
  } catch (err) {
    res.status(500).json({ message: err.message, err });
  }
};
