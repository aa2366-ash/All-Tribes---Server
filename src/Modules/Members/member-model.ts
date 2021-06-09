import * as Mongoose from "mongoose";
import { Tribe } from "../Tribes/tribe-model";
enum MemberType {
  Admin = "Admin",
  Follower = "Follower",
}
export interface Imember {
  tribeId: string;
  userId: string;
  type: MemberType;
}

export interface MemberDocument extends Mongoose.Document {
  createdAt: string;
  updatedAt: string;
}

export interface MemberModel extends Mongoose.Model<MemberDocument> {}

const MemberSchema = new Mongoose.Schema(
  {
    tribeId: {
      type: Mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: Mongoose.Schema.Types.ObjectId,
      required: true,
    },
    type: {
      type: String,
      enum: ["Admin", "Follower"],
      required: true,
    },
  },
  { timestamps: true }
);

MemberSchema.virtual("id").get(function (this: MemberDocument) {
  return this._id.toHexString();
});

MemberSchema.set("toJSON", {
  virtuals: true,
});

MemberSchema.set("toObject", {
  virtuals: true,
});

MemberSchema.virtual("tribe", {
  ref: "Tribe",
  localField: "tribeId",
  foreignField: "_id",
  justOne: true,
  model: Tribe,
});

export const Member = Mongoose.model<MemberDocument, MemberModel>(
  "Member",
  MemberSchema
);
