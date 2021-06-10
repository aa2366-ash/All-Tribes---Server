import { RequestHandler } from "express";
import { body, validationResult, query, param } from "express-validator";
import { ReqUser } from "../../Middleware/validate";
import { Member } from "../Members/member-model";
import { Post } from "../Posts/post-model";
import { Activity } from "./activity-model";

export const createactivity: RequestHandler = async (req, res) => {
  await param("tribeId").isString().run(req);
  await param("postId").isString.arguments(req);

  const result = validationResult(req);
  if (!result.isEmpty())
    return res.status(400).json({
      err: result.array(),
      message: "Invalid Request. Failed at express validator",
    });

  try {
    const { id, email } = req.user as ReqUser;
    const tribeId = req.params.tribeId as string;
    const postId = req.params.postId as string;
    const isMember = await Member.findOne({ tribeId, userId: id });
    if (!isMember) {
      // FIXME: statuscode
      return res.status(400).json({ message: "Join tribe to post" });
    }
    const like = await Activity.createActivity({
      postId,
      tribeId,
      creatorId: id,
    });
    const incLike = await (await Post.incLike(postId)).toObject();
    return res.status(200).json({ message: "Liked the post", data: like });
  } catch (err) {
    return res.status(500).json({ message: err.message, err });
  }
};

export const getActivityList: RequestHandler = async (req, res) => {
  await param("tribeId").isString().run(req);
  await param("postId").isString.arguments(req);

  const result = validationResult(req);
  if (!result.isEmpty())
    return res.status(400).json({
      err: result.array(),
      message: "Invalid Request. Failed at express validator",
    });

  try {
    const { id, email } = req.user as ReqUser;
    const tribeId = req.params.tribeId as string;
    const postId = req.params.postId as string;
    const isMember = await Member.findOne({ tribeId, userId: id });
    if (!isMember) {
      // FIXME: statuscode
      return res.status(400).json({ message: "Join tribe to post" });
    }
    const postList = await Activity.getActivityList({
      postId,
      tribeId,
      creatorId: id,
    });
    return res
      .status(200)
      .json({ message: "Loaded the tribe post", data: postList });
  } catch (err) {
    return res.status(500).json({ message: err.message, err });
  }
};
export const deleteactivity: RequestHandler = async (req, res) => {
  await param("tribeId").isString().run(req);
  await param("postId").isString.arguments(req);

  const result = validationResult(req);
  if (!result.isEmpty())
    return res.status(400).json({
      err: result.array(),
      message: "Invalid Request. Failed at express validator",
    });

  try {
    const { id, email } = req.user as ReqUser;
    const tribeId = req.params.tribeId as string;
    const postId = req.params.postId as string;
    const isMember = await Member.findOne({ tribeId, userId: id });
    if (!isMember) {
      // FIXME: statuscode
      return res.status(400).json({ message: "Join tribe to post" });
    }
    const isDeleted = await Activity.deleteActivity({
      postId,
      tribeId,
      creatorId: id,
    });
    if (isDeleted.deletedCount == 0) {
      return res.status(400).json({ message: "Post doesnot exists" });
    } else {
      const decLike = await (await Post.decLike(postId)).toObject();
      return res.status(200).json({ message: "Liked the post", data: decLike });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message, err });
  }
};
