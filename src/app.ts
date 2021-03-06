//---------------------------Imports------------------------------------
import express, { Request, Response, NextFunction } from "express";
import { json } from "body-parser";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
import cors from "cors";
import { Authenticatetoken } from "./Middleware/validate";
import cookieParser from "cookie-parser";
import InviteRoutes from "./Auth/Invite/routes";
import UserRoutes from "./Auth/User/user-routes";
import TribeRoutes from "./Modules/Tribes/tribe-routes";
import MemberRoutes from "./Modules/Members/member-routes";
import SessionRoutes from "./Auth/Session/session-routes";
import PostRoutes from "./Modules/Posts/post-routes";
import ActivityRoutes from "./Modules/Activities/activity-routes";

//----------------------------Config----------------------------------
const app = express();
app.use(json());
app.use(cookieParser());
app.use(cors({ origin: process.env.APP_URL, credentials: true }));
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ message: err.message });
});

// -----------------------------Routes--------------------------------

app.use("/api/invite", InviteRoutes);
app.use("/api/user", UserRoutes);
app.use("/api/session", SessionRoutes);
app.use("/api/tribes", Authenticatetoken, TribeRoutes);
app.use("/api/tribes/:tribeId/follow", Authenticatetoken, MemberRoutes);
app.use("/api/tribes/:tribeId/posts", Authenticatetoken, PostRoutes);
app.use("/api/activity/:postId", Authenticatetoken, ActivityRoutes);

//-----------------------------Mongoose--------------------------------
import mongoose from "mongoose";
mongoose.set("debug", true);

if (process.env.DB_URL)
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    .then((data) => {
      console.log("MongoDB connected successfully");
      app.listen(process.env.PORT);
    })
    .catch((err) => {
      throw err;
    });
else {
  console.log("DB connection error");
}
