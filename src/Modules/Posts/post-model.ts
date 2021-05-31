import * as Mongoose from "mongoose";
import { User } from "../../Auth/User/user-model";

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
  getPostList(tribeId: string): Promise<IPostDocument[]>;
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
  ref: User,
  localField: "creatorId",
  foreignField: "_id",
  justOne: true,
});

PostSchema.statics = {
  async createPost(post: IPost): Promise<Mongoose.LeanDocument<IPostDocument>> {
    const postdoc = await (await (this as IPostModel).create({ ...post }))
      .populate("creator", "-hashpassword")
      .execPopulate();
    return postdoc.toObject();
  },
  async getPostList(
    tribeId: string
  ): Promise<Mongoose.LeanDocument<IPostDocument[]>> {
    const postdoc = await (this as IPostModel)
      .find({ tribeId })
      .populate("creator", "-hashpassword")
      .exec();
    return postdoc;
  },
};

export const Post = Mongoose.model<IPostDocument, IPostModel>(
  "post",
  PostSchema
);
