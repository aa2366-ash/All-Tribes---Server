import * as Mongoose from "mongoose";
import { User } from "../../Auth/User/user-model";
import { Post } from "../Posts/post-model";
import { Tribe } from "../Tribes/tribe-model";

interface IActivity {
  tribeId: string;
  creatorId: string;
  postId: string;
}

interface IActivityDocument extends IActivity, Mongoose.Document {
  createdAt: string;
  updatedAt: string;
}
const ActivitySchema = new Mongoose.Schema(
  {
    tribeId: {
      type: Mongoose.Schema.Types.ObjectId,
      required: true,
    },
    creatorId: {
      type: Mongoose.Schema.Types.ObjectId,
      required: true,
    },
    postId: {
      type: Mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

ActivitySchema.virtual("id").get(function (this: IActivityDocument) {
  return this._id.toHexString();
});

ActivitySchema.set("toJSON", {
  virtuals: true,
});

ActivitySchema.set("toObject", {
  virtuals: true,
});

ActivitySchema.virtual("creator", {
  ref: User,
  localField: "creatorId",
  foreignField: "_id",
  justOne: true,
});
ActivitySchema.virtual("post", {
  ref: Post,
  localField: "postId",
  foreignField: "_id",
  justOne: true,
});
ActivitySchema.virtual("tribe", {
  ref: Tribe,
  localField: "creatorId",
  foreignField: "_id",
  justOne: true,
});

interface IDeleted {
  deletedCount?: number;
  ok?: number;
  number?: number;
}
interface IActivityModel extends Mongoose.Model<IActivityDocument> {
  createActivity(activity: IActivity): Promise<IActivityDocument>;
  deleteActivity(activity: IActivity): IDeleted;
  getActivityList(activity: IActivity): Promise<IActivityDocument[]>;
}

ActivitySchema.statics = {
  async createActivity(
    activity: IActivity
  ): Promise<Mongoose.LeanDocument<IActivityDocument>> {
    const activitydoc = await (await (this as IActivityModel).create(activity))
      .populate("creator", "-hashpassword")
      .populate("tribe")
      .populate("post")
      .execPopulate();
    return activitydoc.toObject();
  },

  async getActivityList(
    activity: IActivity
  ): Promise<Mongoose.LeanDocument<IActivityDocument[]>> {
    const activitydoc = await (this as IActivityModel)
      .find(activity)
      .populate("creator", "-hashpassword")
      .populate("tribe")
      .populate("post")
      .exec();
    return activitydoc;
  },
  async deleteActivity(activity: IActivity) {
    try {
      const activitydoc: IDeleted = await (this as IActivityModel).deleteOne(
        activity
      );
      return activitydoc;
    } catch (err) {
      return err;
    }
  },
};

export const Activity = Mongoose.model<IActivityDocument, IActivityModel>(
  "Activity",
  ActivitySchema
);
