import { RequestHandler, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface ReqUser {
  email: string;
  id: string;
}
export const GetAccessToken = (email: string, id: string) => {
  const user = { email, id };
  const accesstoken = jwt.sign(
    user,
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: "10800s" }
  );
  return accesstoken;
};
export const GetRefreshToken = (email: string, id: string) => {
  const user = { email, id };
  const refreshtoken = jwt.sign(
    user,
    process.env.REFRESH_TOKEN_SECRET as string
  );
  return { refreshtoken };
};

export const Authenticatetoken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token is null" });
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, user) => {
    if (err)
      return res
        .status(401)
        .json({ message: "Access denied. kindly login again" });
    else {
      req.user = user as ReqUser;
      next();
    }
  });
};
