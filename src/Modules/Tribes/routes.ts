import { Router } from "express";
import { Create, Get } from "./controller";
import { Authenticatetoken } from "../../Middleware/validate";

const TribeRoutes = Router();

TribeRoutes.post("/", Create);
TribeRoutes.get("/", Get);

export default TribeRoutes;
