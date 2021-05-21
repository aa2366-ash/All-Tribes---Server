import { Router } from "express";
import { inviteHandler } from "./controller";

const router = Router();

router.post("/", inviteHandler);

export default router;
