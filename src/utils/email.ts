import sgMail, { MailDataRequired } from "@sendgrid/mail";
import { emailtemplate } from "./emailtemplate";

interface EmailArgs {
  name: string;
  email: string;
  message: string;
  buttontext: string;
  link: string;
}
const Email = async ({ name, email, message, buttontext, link }: EmailArgs) => {
  try {
    if (process.env.EMAIL_API_KEY && process.env.SENDGRID_EMAIL) {
      sgMail.setApiKey(process.env.EMAIL_API_KEY);
      const htmltemplate = emailtemplate(name, message, buttontext, link);
      const msg: MailDataRequired = {
        to: email,
        from: process.env.SENDGRID_EMAIL,
        subject: `Hi ${name}`,
        text: "Welcome to Tribe!",
        html: htmltemplate,
      };
      await sgMail.send(msg);
    } else console.log("email error");
  } catch (err) {
    console.log(err);
  }
};

export default Email;
