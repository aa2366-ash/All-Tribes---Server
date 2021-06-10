import * as Mongoose from "mongoose";
import { Member } from "../Members/member-model";

export interface Itribe {
  name: string;
  creatorId: string;
  description: string;
  avatarUrl: string;
  coverUrl: string;
  members: number;
}

export interface ITribeDocument extends Itribe, Mongoose.Document {
  createdAt: string;
  updatedAt: string;
}

export interface TribeModel extends Mongoose.Model<ITribeDocument> {
  addFollower(tribeId: string): Promise<Mongoose.LeanDocument<ITribeDocument>>;
  removeFollower(
    tribeId: string
  ): Promise<Mongoose.LeanDocument<ITribeDocument>>;
  tribeSuggestion(
    userId: string,
    search: string
  ): Promise<Mongoose.LeanDocument<ITribeDocument[]>>;
}

const TribeSchema = new Mongoose.Schema<ITribeDocument>(
  {
    name: { type: String, required: true },
    creatorId: {
      type: Mongoose.Schema.Types.ObjectId,
      required: true,
    },
    description: { type: String, required: true },
    avatarUrl: { type: String },
    coverUrl: { type: String },
    members: { type: Number },
  },
  { timestamps: true }
);

TribeSchema.virtual("id").get(function (this: ITribeDocument) {
  return this._id.toHexString();
});

TribeSchema.set("toJSON", {
  virtuals: true,
});

TribeSchema.set("toObject", {
  virtuals: true,
});

TribeSchema.virtual("isMember", {
  ref: "Member",
  localField: "_id",
  foreignField: "tribeId",
  justOne: true,
  model: Member,
});

TribeSchema.statics = {
  async addFollower(
    tribeId: string
  ): Promise<Mongoose.LeanDocument<ITribeDocument>> {
    const increment = (await Tribe.findOneAndUpdate(
      { _id: tribeId },
      { $inc: { members: 1 } }
    )) as ITribeDocument;
    return increment.toObject();
  },
  async removeFollower(
    tribeId: string
  ): Promise<Mongoose.LeanDocument<ITribeDocument>> {
    const decrement = (await Tribe.findOneAndUpdate(
      { _id: tribeId },
      { $inc: { members: -1 } }
    )) as ITribeDocument;
    return decrement.toObject();
  },
  async tribeSuggestion(
    userId: string,
    search: string
  ): Promise<Mongoose.LeanDocument<ITribeDocument[]>> {
    const rgx = new RegExp(search);
    const result = await Tribe.find({
      $or: [{ name: { $regex: rgx } }, { description: { $regex: rgx } }],
    })
      .populate({
        path: "isMember",
        match: { userId },
      })
      .exec();
    return result;
  },
};
export const Tribe = Mongoose.model<ITribeDocument, TribeModel>(
  "Tribe",
  TribeSchema
);
