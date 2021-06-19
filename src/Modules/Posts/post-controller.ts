import { RequestHandler } from "express";
import { body, validationResult, query, param } from "express-validator";
import { ReqUser } from "../../Middleware/validate";
import { Member } from "../Members/member-model";
import { Post } from "./post-model";

export const Create: RequestHandler = async (req, res) => {
  await body("text").optional({ checkFalsy: true }).isString().run(req);
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
    const isMember = await Member.findOne({ tribeId, userId: id });
    if (isMember == null) {
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
  await param("tribeId").isString().run(req);
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
    if (tribeId !== "MyPost") {
      const isMember = await Member.findOne({ tribeId, userId: id });
      if (!isMember) {
        // FIXME: statuscode
        return res
          .status(401)
          .json({ message: "Join tribe to view all posts" });
      }
    }
    const post = await Post.getPostList(tribeId, id, skipCount, limit);
    return res.status(200).json(post);
  } catch (err) {
    return res.status(500).json({ message: err.message, err });
  }
};

export const Delete: RequestHandler = async (req, res) => {
  try {
    await param("postId").isMongoId().run(req);
    const result = validationResult(req);
    if (!result.isEmpty())
      return res.status(400).json({
        err: result.array(),
        message: "Invalid Request. Failed at express validator",
      });
    const { id, email } = req.user as ReqUser;
    const postId = req.params.postId as string;
    const isDeleted = await Post.deleteOne({ creatorId: id, _id: postId });
    if (isDeleted.deletedCount) {
      return res.status(200).json("Post deleted");
    } else return res.status(400).json({ message: "Post not deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message, err });
  }
};

export const Edit: RequestHandler = async (req, res) => {
  try {
    await param("postId").isMongoId().run(req);
    await body("text").optional({ checkFalsy: true }).isString().run(req);
    await body("gifUrl")
      .optional({ checkFalsy: true })
      .isString()
      .isURL()
      .run(req);
    const result = validationResult(req);
    if (!result.isEmpty())
      return res.status(400).json({
        err: result.array(),
        message: "Invalid Request. Failed at express validator",
      });
    const { id } = req.user as ReqUser;
    const postId = req.params.postId;
    console.log(id, postId);
    const { text, gifUrl } = req.body;
    const postdoc = await Post.findOneAndUpdate(
      { _id: postId, creatorId: id },
      { text, gifUrl },
      { new: true }
    );
    return res.status(200).json({ postdoc });
  } catch (err) {
    return res.status(500).json({ message: err.message, err });
  }
};
