import { Router } from "express";
import { Authenticatetoken } from "../../Middleware/validate";
import {
  CreateFollower,
  RemoveFollower,
  GetFollowersList,
} from "./member-controller";

const MemberRoutes = Router({ mergeParams: true });

MemberRoutes.post("/", CreateFollower);
MemberRoutes.get("/", GetFollowersList);
MemberRoutes.delete("/", RemoveFollower);

export default MemberRoutes;
