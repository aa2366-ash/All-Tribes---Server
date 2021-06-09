import { RequestHandler } from "express";
import { body, validationResult, query, param } from "express-validator";
import { ReqUser } from "../../Middleware/validate";
import { Members } from "../Members/member-model";
import { Post } from "./post-model";

export const Create: RequestHandler = async (req, res) => {
  await body("text").isString().run(req);
  await body("gifUrl")
    .optional({ checkFalsy: true })
    .isString()
    .isURL()
    .run(req);
  await param("tribeId").isString().run(req);

  const result = validationResult(req);

  if (!result.isEmpty())
    return res.status(400).json({
      err: result.array(),
      message: "Invalid Request. Failed at express validator",
    });
  try {
    const { id, email } = req.user as ReqUser;
    const { text, gifUrl } = req.body;
    const tribeId = req.params.tribeId as string;
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
  await param("tribeId").isMongoId().run(req);
  await query("pageParam").isString().toInt().run(req);
  await query("limit").isInt().toInt().run(req);
  const result = validationResult(req);
  if (!result.isEmpty())
    return res.status(400).json({
      err: result.array(),
      message: "Invalid Request. Failed at express validator",
    });
  try {
    const { id, email } = req.user as ReqUser;
    const tribeId = req.params.tribeId as string;
    const pageParam = parseInt((req.query.pageParam as string) ?? "0");
    const limit = parseInt((req.query.limit as string) ?? "10");
    const skipCount = pageParam * limit;
    const isMember = Members.findOne({ tribeId, userId: id });
    if (!isMember) {
      // FIXME: statuscode
      return res.status(400).json({ message: "Join tribe to view all posts" });
    }
    const post = await Post.getPostList(tribeId, id, skipCount, limit);
    return res.status(200).json(post);
  } catch (err) {
    return res.status(500).json({ message: err.message, err });
  }
};
