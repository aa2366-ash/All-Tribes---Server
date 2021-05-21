import { Router } from "express";
import {
  CreateHandler,
  DeleteHandler,
  GetUserHandler,
  UpdateHandler,
  LoginHandler,
} from "./controller";
const UserRoutes = Router();

UserRoutes.post("/", CreateHandler);
UserRoutes.post("/login", LoginHandler);
UserRoutes.patch("/", UpdateHandler);
UserRoutes.get("/", GetUserHandler);
UserRoutes.delete("/", DeleteHandler);

export default UserRoutes;
