import { Router } from "express";
import { Authenticatetoken } from "../../Middleware/validate";
import { Create } from "./controller";

const MemberRoutes = Router();

MemberRoutes.post("/", Create);

export default MemberRoutes;
