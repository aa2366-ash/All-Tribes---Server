import { Request, Response } from "express";
import { Itribe, Tribe, TribeDocument, TribeModel } from "./model";
import { body, validationResult } from "express-validator";
import { Members } from "../Members/model";
import { ReqUser } from "../../Middleware/validate";

//----------------------------------------------------------------------------------------------
export const CreateHandler = async (req: Request, res: Response) => {
  try {
    await body("name")
      .isString()
      .matches(/^\S*$/, "Tribe name should not contain spaces")
      .run(req);
    await body("description").isString().run(req);
    await body("avatarUrl").optional().isURL().run(req);
    await body("tags").optional().isArray().run(req);

    const result = validationResult(req);
    if (!result.isEmpty()) res.status(400).json({ error: result.array() });

    const { name, description, avatarUrl, tags } = req.body;
    const user = req.user as ReqUser;
    const tribe = await Tribe.create({
      name,
      creatorId: user.id,
      description,
      avatarUrl,
      tags,
    });
    const member = await Members.create({
      tribeId: tribe.id,
      userId: user.id,
      type: "Admin",
    });
    res.status(201).json({
      tribeId: tribe.id,
      userId: user.id,
      message: "Tribe successfully created",
    });
  } catch (err) {
    res.status(401).json({ err, message: err.message });
  }
};
//--------------------------------------------------------------------------------------------------------------
export const UpdateHandler = async (req: Request, res: Response) => {};

//--------------------------------------------------------------------------------------------------------------

export const GetTribeHandler = async (req: Request, res: Response) => {};
//--------------------------------------------------------------------------------------------------------------

export const DeleteHandler = async (req: Request, res: Response) => {};
