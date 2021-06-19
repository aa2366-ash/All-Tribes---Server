import { Router } from "express";
import { Create, Get, Delete, Edit } from "./post-controller";

const PostRoutes = Router({ mergeParams: true });

PostRoutes.post("/", Create);
PostRoutes.get("/", Get);
PostRoutes.delete("/:postId", Delete);
PostRoutes.patch("/:postId", Edit);
export default PostRoutes;
