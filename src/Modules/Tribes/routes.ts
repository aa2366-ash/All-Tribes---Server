import { Router } from "express";
import {
  CreateHandler,
  GetTribeHandler,
  DeleteHandler,
  UpdateHandler,
} from "./controller";
import { Authenticatetoken } from "../../Middleware/validate";

const TribeRoutes = Router();

TribeRoutes.post("/", Authenticatetoken, CreateHandler);
TribeRoutes.get("/", Authenticatetoken, GetTribeHandler);
TribeRoutes.patch("/", Authenticatetoken, UpdateHandler);
TribeRoutes.delete("/", Authenticatetoken, DeleteHandler);

export default TribeRoutes;
