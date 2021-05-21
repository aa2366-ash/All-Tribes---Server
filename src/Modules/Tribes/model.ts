import * as Mongoose from "mongoose";

export interface Itribe {
  name: string;
  creatorId: string;
  description: string;
  avatarUrl?: string;
  tags: string[];
}

export interface TribeDocument extends Itribe, Mongoose.Document {
  createdAt: string;
  updatedAt: string;
}

export interface TribeModel extends Mongoose.Model<TribeDocument> {}

const TribeSchema = new Mongoose.Schema<TribeDocument>(
  {
    name: { type: String, required: true, unique: true },
    creatorId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: { type: String, required: true },
    avatarUrl: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

TribeSchema.virtual("id").get(function (this: TribeDocument) {
  return this._id.toHexString();
});

TribeSchema.set("toJSON", {
  virtuals: true,
});

TribeSchema.virtual("creator", {
  ref: "Users",
  localField: "_id",
  foreignField: "creatorId",
  justOne: true,
});

export const Tribe = Mongoose.model<TribeDocument, TribeModel>(
  "Tribe",
  TribeSchema
);
