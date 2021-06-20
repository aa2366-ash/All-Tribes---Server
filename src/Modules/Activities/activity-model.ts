import * as Mongoose from "mongoose";
import { User } from "../../Auth/User/user-model";
import { Post } from "../Posts/post-model";

interface IActivity {
  creatorId: string;
  postId: string;
}

interface IActivityDocument extends IActivity, Mongoose.Document {
  createdAt: string;
  updatedAt: string;
}
const ActivitySchema = new Mongoose.Schema(
  {
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

ActivitySchema.virtual("creator", {
  ref: "User",
  localField: "creatorId",
  foreignField: "_id",
  justOne: true,
  model: User,
});
ActivitySchema.virtual("post", {
  ref: "Post",
  localField: "postId",
  foreignField: "_id",
  justOne: true,
  model: Post,
});
ActivitySchema.set("toJSON", {
  virtuals: true,
});

ActivitySchema.set("toObject", {
  virtuals: true,
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
      .execPopulate();
    return activitydoc.toObject();
  },

  async getActivityList(
    activity: IActivity
  ): Promise<Mongoose.LeanDocument<IActivityDocument[]>> {
    const activitydoc = await (this as IActivityModel)
      .find(activity)
      .populate("creator", "-hashpassword")
      .exec();
    return activitydoc;
  },
  async deleteActivity(activity: IActivity) {
    const activitydoc: IDeleted = await (this as IActivityModel).deleteOne(
      activity
    );

    return activitydoc;
  },
};

export const Activity = Mongoose.model<IActivityDocument, IActivityModel>(
  "Activity",
  ActivitySchema
);
