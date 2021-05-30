import { RequestHandler } from "express";
import { MongoError } from "mongodb";
import { Invite } from "./model";
import { v4 as uuidv4 } from "uuid";
import { body, validationResult } from "express-validator";
import Email from "../../utils/email";
import { User } from "../User/user-model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ReqUser } from "../../Middleware/validate";

export const CreateInvite: RequestHandler = async (req, res, next) => {
  await body("email").isEmail().run(req);
  await body("name")
    .isString()
    .matches(/^[aA-zZ\s]+$/)
    .run(req);

  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array() });
  }
  try {
    const { name, email } = req.body;
    const message = "Click the button to accept the invitation";
    const buttontext = "Accept";
    const code = uuidv4();
    const link = `${process.env.APP_URL}/invite?code=${code}&email=${email}&name=${name}`;
    const doc = await User.findOne({ email });
    if (doc) {
      res
        .status(401)
        .json({ message: "Email id already exists. kindly Login" });
      return;
    }
    const user = await Invite.createInvite({ name, email, code });
    const sentEmail = await Email({ name, email, message, buttontext, link });
    res.status(201).json({
      message: "User Registered suceesfully",
      data: { name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message, err });
  }
};

export const CreateUser: RequestHandler = async (req, res, next) => {
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
    const userdoc = await User.findOne({ email });
    if (userdoc) {
      res.status(400).json({
        message: "User already exists. kindly login using registered email id.",
      });
      return;
    }
    const invitedoc = await Invite.findOneAndDelete({ email, code });
    if (!invitedoc) {
      res.status(400).status(400).json({
        message: "Verification code is not valid. kindly register again",
      });
      return;
    }

    const hashpassword = await bcrypt.hash(password, 10);
    const user = await User.createUser({
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
