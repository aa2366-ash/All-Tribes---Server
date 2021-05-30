import * as Mongoose from "mongoose";

export interface Iuser {
  name: string;
  email: string;
  hashpassword: string;
  handler?: string;
  avatarurl?: string;
}

export interface UserDocument extends Iuser, Mongoose.Document {
  createdAt: string;
  updatedAt: string;
}

export interface UserModel extends Mongoose.Model<UserDocument> {
  createUser(user: Iuser): Promise<Iuser>;
  UpdateUser(user: Iuser, fieldstoUpdate: Partial<Iuser>): Promise<Iuser>;
  // getUser(user: Partial<Iuser[]>): Promise<Iuser[]>;
  // deleteUser(user: Iuser): Promise<Iuser>;
}

const userSchema = new Mongoose.Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    hashpassword: {
      type: String,
      required: true,
    },
    handler: {
      type: String,
    },
    avatarUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.virtual("id").get(function (this: UserDocument) {
  return this._id.toHexString();
});

userSchema.set("toJSON", {
  virtuals: true,
});

userSchema.set("toObject", {
  virtuals: true,
});

userSchema.statics = {
  async createUser(user: Iuser): Promise<Mongoose.LeanDocument<UserDocument>> {
    const userDoc = await (this as UserModel).create({ ...user });
    return userDoc.toObject();
  },
  async UpdateUser(user: Iuser, fieldstoUpdate: Partial<Iuser>) {
    const userDoc = await (this as UserModel).findOneAndUpdate(
      user,
      fieldstoUpdate,
      { new: true }
    );
    return userDoc?.toObject();
  },
};

export const User = Mongoose.model<UserDocument, UserModel>("User", userSchema);
