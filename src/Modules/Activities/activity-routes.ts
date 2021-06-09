import { Router } from "express";
import {
  getActivityList,
  createactivity,
  deleteactivity,
} from "./activity-controller";
const ActivityRoutes = Router({ mergeParams: true });

ActivityRoutes.post("/", createactivity);
ActivityRoutes.get("/", getActivityList);
ActivityRoutes.delete("/", deleteactivity);

export default ActivityRoutes;
