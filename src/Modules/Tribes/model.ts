import * as Mongoose from "mongoose";

export interface Itribe {
  name: string;
  creatorId: string;
  description: string;
  avatarUrl: string;
  coverUrl: string;
}

export interface TribeDocument extends Itribe, Mongoose.Document {
  createdAt: string;
  updatedAt: string;
}

export interface TribeModel extends Mongoose.Model<TribeDocument> {}

const TribeSchema = new Mongoose.Schema<TribeDocument>(
  {
    name: { type: String, required: true },
    creatorId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: { type: String, required: true },
    avatarUrl: { type: String },
    coverUrl: { type: String },
    members: { type: Number },
  },
  { timestamps: true }
);

TribeSchema.virtual("id").get(function (this: TribeDocument) {
  return this._id.toHexString();
});

TribeSchema.set("toJSON", {
  virtuals: true,
});

TribeSchema.set("toObject", {
  virtuals: true,
});
export const Tribe = Mongoose.model<TribeDocument, TribeModel>(
  "Tribe",
  TribeSchema
);
