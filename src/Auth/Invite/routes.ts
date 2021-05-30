import { Router } from "express";
import { CreateInvite, CreateUser } from "./controller";

const router = Router();

router.post("/", CreateInvite);
router.post("/create", CreateUser);
export default router;
