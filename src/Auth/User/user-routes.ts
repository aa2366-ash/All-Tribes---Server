import { Router } from "express";
import { GetUser } from "./user-controller";
import { Authenticatetoken } from "../../Middleware/validate";
const UserRoutes = Router();

UserRoutes.get("/me", Authenticatetoken, GetUser);

export default UserRoutes;
