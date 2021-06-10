import * as Mongoose from "mongoose";
import { User } from "../../Auth/User/user-model";
import { Activity } from "../Activities/activity-model";
import { Tribe } from "../Tribes/tribe-model";
interface IPost {
  text: string;
  gifUrl: string;
  tribeId: string;
  creatorId: string;
  like: number;
}

interface IPostDocument extends IPost, Mongoose.Document {
  createdAt: string;
  updatedAt: string;
}

interface IPostModel extends Mongoose.Model<IPostDocument> {
  createPost(post: IPost): Promise<IPostDocument>;
  getPostList(
    tribeId: string,
    userId: string,
    skipCount: number,
    limit: number
  ): Promise<IPostDocument[]>;
  incLike(postId: string): Promise<IPostDocument>;
  decLike(postId: string): Promise<IPostDocument>;
}

const PostSchema = new Mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    gifUrl: {
      type: String,
    },
    tribeId: {
      type: Mongoose.Schema.Types.ObjectId,
      required: true,
    },
    creatorId: {
      type: Mongoose.Schema.Types.ObjectId,
      required: true,
    },
    like: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

PostSchema.virtual("id").get(function (this: IPostDocument) {
  return this._id.toHexString();
});

PostSchema.set("toJSON", {
  virtuals: true,
});

PostSchema.set("toObject", {
  virtuals: true,
});

PostSchema.virtual("creator", {
  ref: "User",
  localField: "creatorId",
  foreignField: "_id",
  justOne: true,
  model: User,
});
PostSchema.virtual("tribe", {
  ref: "Tribe",
  localField: "tribeId",
  foreignField: "_id",
  justOne: true,
  model: Tribe,
});
PostSchema.virtual("isLiked", {
  ref: "Activity",
  localField: "_id",
  foreignField: "postId",
  justOne: true,
  model: Activity,
});

PostSchema.statics = {
  async createPost(post: IPost): Promise<Mongoose.LeanDocument<IPostDocument>> {
    const postdoc = await (await (this as IPostModel).create({ ...post }))
      .populate("creator", "-hashpassword")
      .execPopulate();
    return postdoc.toObject();
  },
  async getPostList(
    tribeId: string,
    userId: string,
    skipCount: number,
    limit: number
  ): Promise<Mongoose.LeanDocument<IPostDocument[]>> {
    const postdoc = await (this as IPostModel)
      .find({ ...(tribeId !== "MyPost" ? { tribeId } : { creatorId: userId }) })
      .sort({ updatedAt: -1 })
      .skip(skipCount)
      .limit(limit)
      .populate("creator", "-hashpassword")
      .populate({
        path: "isLiked",
        match: {
          creatorId: userId,
          ...(tribeId === "MyPost" ? {} : { tribeId }),
        },
      })
      .populate({ path: "tribe" })
      .exec();
    return postdoc;
  },
  async incLike(postId: string): Promise<Mongoose.LeanDocument<IPostDocument>> {
    const increment = (await Post.findOneAndUpdate(
      { _id: postId },
      { $inc: { members: 1 } }
    )) as IPostDocument;
    return increment;
  },
  async decLike(postId: string): Promise<Mongoose.LeanDocument<IPostDocument>> {
    const decrement = (await Post.findOneAndUpdate(
      { _id: postId },
      { $inc: { members: -1 } }
    )) as IPostDocument;
    return decrement.toObject();
  },
};

export const Post = Mongoose.model<IPostDocument, IPostModel>(
  "post",
  PostSchema
);
