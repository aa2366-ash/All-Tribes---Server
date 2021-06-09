import { Router } from "express";
import {
  CreateTribe,
  GetTribeList,
  GetTribe,
  GetFollowSuggestionList,
} from "./tribe-controller";
import { Authenticatetoken } from "../../Middleware/validate";

const TribeRoutes = Router({ mergeParams: true });

TribeRoutes.post("/", CreateTribe);
TribeRoutes.get("/", GetTribeList);
TribeRoutes.get("/followsuggestion", GetFollowSuggestionList);
TribeRoutes.get("/:tribeId", GetTribe);
export default TribeRoutes;
