import { RequestHandler } from "express";
import { body, validationResult, query, param } from "express-validator";
import { ReqUser } from "../../Middleware/validate";
import { Member } from "../Members/member-model";
import { Post } from "../Posts/post-model";
import { Activity } from "./activity-model";

export const createactivity: RequestHandler = async (req, res) => {
  await param("postId").isMongoId().run(req);
  const result = validationResult(req);
  if (!result.isEmpty())
    return res.status(400).json({
      err: result.array(),
      message: "Invalid Request. Failed at express validator",
    });

  try {
    const { id } = req.user as ReqUser;
    const postId = req.params.postId as string;
    const like = await Activity.createActivity({
      postId,
      creatorId: id,
    });
    if (like) {
      const incLike = await Post.incLike(postId);
      return res.status(200).json({ message: "Liked the post", data: incLike });
    } else {
      return res.status(400).json({ message: "Post not liked" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message, err });
  }
};

export const getActivityList: RequestHandler = async (req, res) => {
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
      creatorId: id,
    });
    return res.status(200).json({ postList });
  } catch (err) {
    return res.status(500).json({ message: err.message, err });
  }
};

export const deleteactivity: RequestHandler = async (req, res) => {
  await param("postId").isMongoId().run(req);
  const result = validationResult(req);
  if (!result.isEmpty())
    return res.status(400).json({
      err: result.array(),
      message: "Invalid Request. Failed at express validator",
    });

  try {
    const { id } = req.user as ReqUser;
    const postId = req.params.postId as string;
    const isDeleted = await Activity.deleteActivity({
      postId,
      creatorId: id,
    });
    console.log(isDeleted);
    const decLike = await Post.decLike(postId);
    return res.status(200).json({ message: "Uniked the post", data: decLike });
  } catch (err) {
    return res.status(500).json({ message: err.message, err });
  }
};
