import { RequestHandler } from "express";
import { MongoError } from "mongodb";
import { Invite } from "./model";
import { v4 as uuidv4 } from "uuid";
import { body, validationResult } from "express-validator";
import Email from "../../utils/email";
import { Users } from "../User/model";

export const inviteHandler: RequestHandler = async (req, res, next) => {
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
    const link = `${process.env.APP_URL}/invite/${code}`;
    const doc = await Users.findOne({ email });
    if (doc)
      res
        .status(401)
        .json({ message: "Email id already exists. kindly Login" });
    const user = await Invite.createInvite({ name, email, code });
    const sentEmail = await Email(name, email, message, buttontext, link);
    res.status(201).json({
      message: "User Registered suceesfully",
      data: { name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message, err });
  }
};
