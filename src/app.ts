import express, { Request, Response, NextFunction } from "express";
import { json } from "body-parser";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
import cors from "cors";

//----------------------------config----------------------------------
const app = express();
app.use(json());
app.use(cors({ origin: process.env.API_URL, credentials: true }));
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ message: err.message });
});

// -----------------------------Routes--------------------------------

import InviteRoutes from "./Auth/Invite/routes";
import UserRoutes from "./Auth/User/routes";
import TribeRoutes from "./Modules/Tribes/routes";
import MemberRoutes from "./Modules/Members/routes";

app.use("/api/invite", InviteRoutes);
app.use("/api/user", UserRoutes);
app.use("/api/tribe", TribeRoutes);
app.use("/api/member", MemberRoutes);

//-----------------------------Mongoose--------------------------------
import mongoose from "mongoose";

if (process.env.DB_URL)
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    .then((data) => {
      console.log("MongoDB connected ");
      app.listen(process.env.PORT);
    })
    .catch((err) => {
      throw err;
    });
else {
  console.log("DB connection error");
}
