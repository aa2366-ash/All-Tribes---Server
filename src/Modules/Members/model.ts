import * as Mongoose from "mongoose";

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
      ref: "Tribe",
      required: true,
    },
    userId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "Users",
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
export const Members = Mongoose.model<MemberDocument, MemberModel>(
  "Members",
  MemberSchema
);
