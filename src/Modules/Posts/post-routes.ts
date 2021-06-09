import { Router } from "express";
import { Create, Get } from "./post-controller";

const PostRoutes = Router({ mergeParams: true });

PostRoutes.post("/", Create);
PostRoutes.get("/", Get);

export default PostRoutes;
