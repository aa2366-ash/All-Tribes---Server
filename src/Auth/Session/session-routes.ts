import { Router } from "express";
import { Login, Logout, Token } from "./session-controller";

const SessionRoutes = Router();

SessionRoutes.post("/login", Login);
SessionRoutes.post("/logout", Logout);
SessionRoutes.post("/token", Token);

export default SessionRoutes;
