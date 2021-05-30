import * as Mongoose from "mongoose";
import { User, UserDocument } from "../User/user-model";

interface ISession {
  refreshtoken: string;
  userId: string;
}

interface SessionDocument extends ISession, Mongoose.Document {
  createdAt: string;
  UpdatedAt: string;
}

interface SessionPopulatedDocument extends SessionDocument {
  user: UserDocument;
}

interface SessionModel extends Mongoose.Model<SessionDocument> {
  getSession(refreshtoken: string): Promise<SessionPopulatedDocument | null>;
}

const SessionSchema = new Mongoose.Schema<SessionDocument, SessionModel>(
  {
    refreshtoken: {
      type: String,
      required: true,
    },
    userId: {
      type: Mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

SessionSchema.virtual("user", {
  ref: User,
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

SessionSchema.virtual("id").get(function (this: SessionDocument) {
  return this._id.toHexString();
});

SessionSchema.set("toJSON", {
  virtuals: true,
});
SessionSchema.set("toObject", {
  virtuals: true,
});

SessionSchema.statics = {
  async getSession(refreshtoken: string) {
    const sessionDoc = await Sessions.findOne({ refreshtoken }).populate(
      "user",
      "-hashpassword"
    );

    return sessionDoc?.toObject();
  },
};
export const Sessions = Mongoose.model<SessionDocument, SessionModel>(
  "Sessions",
  SessionSchema
);
