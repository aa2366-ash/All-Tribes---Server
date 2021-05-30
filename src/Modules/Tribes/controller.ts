import { Request, RequestHandler, Response } from "express";
import { Itribe, Tribe, TribeDocument, TribeModel } from "./model";
import { body, query, validationResult } from "express-validator";
import { Members } from "../Members/model";
import { ReqUser } from "../../Middleware/validate";

//----------------------------------------------------------------------------------------------
export const Create = async (req: Request, res: Response) => {
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
    const member = await Members.create({
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
export const Get: RequestHandler = async (req, res) => {
  try {
    await query("type").isString().optional().run(req);
    const result = validationResult(req);
    if (!result.isEmpty())
      return res.status(400).json({
        err: result.array(),
        message: "Invalid Request. Failed at express validator",
      });
    const type = req.query.type ?? "All";
    const user = req.user as ReqUser;

    const tribedoc = await Members.find({
      userId: user?.id,
      ...(type === "All" ? {} : { type }),
    }).populate("tribe");

    return res.status(200).json(tribedoc);
  } catch (err) {
    res.status(400).json({ message: err.message, err });
  }
};
