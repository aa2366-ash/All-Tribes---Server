import { Router } from "express";
import { CreateTribe, GetTribeList, GetTribe } from "./tribe-controller";
import { Authenticatetoken } from "../../Middleware/validate";

const TribeRoutes = Router({ mergeParams: true });

TribeRoutes.post("/", CreateTribe);
TribeRoutes.get("/", GetTribeList);
TribeRoutes.get("/:tribeId", GetTribe);
export default TribeRoutes;
