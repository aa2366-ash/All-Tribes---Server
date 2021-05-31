import { RequestHandler } from "express";
import { body, validationResult, query } from "express-validator";
import { Iuser } from "../../Auth/User/user-model";
import { ReqUser } from "../../Middleware/validate";
import { Members } from "../Members/model";
import { Post } from "./post-model";

export const Create: RequestHandler = async (req, res) => {
  await body("text").isString().run(req);
  await body("gifUrl").optional().isString().isURL().run(req);
  await query("tribeId").isString().run(req);

  const result = validationResult(req);

  if (!result.isEmpty())
    return res.status(400).json({
      err: result.array(),
      message: "Invalid Request. Failed at express validator",
    });
  try {
    const { id, email } = req.user as ReqUser;
    const { text, gifUrl } = req.body;
    const tribeId = req.query.tribeId as string;
    const isMember = Members.findOne({ tribeId, userId: id });
    if (!isMember) {
      // FIXME: statuscode
      return res.status(400).json({ message: "Join tribe to post" });
    }
    const post = await Post.createPost({
      text,
      gifUrl,
      tribeId,
      creatorId: id,
      like: 0,
    });
    return res
      .status(200)
      .json({ message: "Post created successfully", data: post });
  } catch (err) {
    return res.status(500).json({ message: err.message, err });
  }
};

export const Get: RequestHandler = async (req, res) => {
  await query("tribeId").isString().run(req);
  const result = validationResult(req);
  if (!result.isEmpty())
    return res.status(400).json({
      err: result.array(),
      message: "Invalid Request. Failed at express validator",
    });
  try {
    const { id, email } = req.user as ReqUser;
    const tribeId = req.query.tribeId as string;
    const isMember = Members.findOne({ tribeId, userId: id });
    if (!isMember) {
      // FIXME: statuscode
      return res.status(400).json({ message: "Join tribe to post" });
    }
    const post = await Post.getPostList(tribeId);
    return res
      .status(200)
      .json({ message: "Post fetched successfully", data: post });
  } catch (err) {
    return res.status(500).json({ message: err.message, err });
  }
};
