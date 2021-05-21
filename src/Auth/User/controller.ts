import { RequestHandler } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";

import { Users } from "./model";
import { Invite } from "../Invite/model";
import { Generatetoken } from "../../Middleware/validate";

export const CreateHandler: RequestHandler = async (req, res, next) => {
  await body("email").isEmail().run(req);
  await body("name")
    .isString()
    .matches(/^[aA-zZ\s]+$/)
    .run(req);
  await body("password")
    .isString()
    .matches(/^\S*$/, "should not contain white spaces")
    .isLength({ min: 5 })
    .run(req);
  await body("handler")
    .isString()
    .matches(/^\S*$/, "should not contain white spaces")
    .optional({ nullable: true })
    .run(req);
  await body("code").isString().run(req);

  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res
      .status(400)
      .json({ errors: result.array(), message: "express validator error" });
  }

  try {
    const { name, email, password, handler, code } = req.body;
    const invitedoc = await Invite.findOneAndDelete({ email, code });
    if (!invitedoc)
      res.status(400).status(400).json({
        message: "Verification code is not valid. kindly register again",
      });
    const userdoc = await Users.findOne({ email });
    if (userdoc) {
      res.status(400).json({ message: "User already exists" });
    }
    const hashpassword = await bcrypt.hash(password, 10);
    const user = await Users.createUser({
      name,
      email,
      hashpassword,
      handler,
    });
    res.status(201).json({
      message: "Registeration sucessfull. Login using registered email",
    });
  } catch (err) {
    res.status(500).json({ message: err.message, err });
  }
};

export const LoginHandler: RequestHandler = async (req, res, next) => {
  try {
    await body("email").isEmail().run(req);
    await body("password").isString().run(req);
    const result = validationResult(req);
    if (!result.isEmpty()) res.status(500).json({ error: result });
    const { email, password } = req.body;
    const user = await Users.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Email Address does not exists" });
    const isValid = await bcrypt.compare(password, user.hashpassword);
    if (!isValid)
      return res.status(401).json({ message: "Password is incorrect" });
    const { accesstoken } = Generatetoken(email, user.id);
    res.status(200).json({
      message: "login successfull",
      token: accesstoken,
    });
  } catch (err) {
    res.status(500).json({ message: err.message, err });
  }
};

export const UpdateHandler: RequestHandler = (req, res, next) => {};

export const GetUserHandler: RequestHandler = (req, res, next) => {};

export const DeleteHandler: RequestHandler = (req, res, next) => {};
