import { Router } from "express";
import { Authenticatetoken } from "../../Middleware/validate";
import { DeleteHandler, CreateHandler, UpdateHandler } from "./controller";

const MemberRoutes = Router();

MemberRoutes.post("/", Authenticatetoken, CreateHandler);
MemberRoutes.patch("/", Authenticatetoken, UpdateHandler);
MemberRoutes.delete("/", Authenticatetoken, DeleteHandler);

export default MemberRoutes;
