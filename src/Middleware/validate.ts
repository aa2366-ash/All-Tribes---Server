import { RequestHandler, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface ReqUser {
  email: string;
  id: string;
}
export const Generatetoken = (email: string, id: string) => {
  const user = { email, id };
  const accesstoken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as string);
  return { accesstoken };
};

export const Authenticatetoken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (token == null) return res.status(401).json({ message: "Token is null" });
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, user) => {
    if (err)
      res.status(400).json({ message: "Acess denied. kindly login again" });
    else {
      req.user = user as ReqUser;
      next();
    }
  });
};
