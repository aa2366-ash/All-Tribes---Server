import { Document, Model, model, Types, Schema, Query } from "mongoose";
import mongoose, { connection } from "mongoose";

interface IInvite {
  name: string;
  email: string;
  code: string;
}
export interface InviteDocument extends Document, IInvite {
  createdAt: string;
  updatedAt: string;
}

interface InviteModel extends Model<InviteDocument> {
  createInvite(invite: IInvite): Promise<IInvite>;
}

const inviteSchema = new Schema<InviteDocument, InviteModel>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

inviteSchema.statics = {
  async createInvite(
    invite: Pick<IInvite, "email" | "name">
  ): Promise<ReturnType<Document<IInvite>["toObject"]>> {
    const inviteDoc = await (this as InviteModel).create({ ...invite });
    return inviteDoc.toObject();
  },

  async deleteinvite(code: string) {
    const inviteDoc = await (this as InviteModel).findOneAndDelete({ code });
  },
};

export const Invite = mongoose.model<InviteDocument, InviteModel>(
  "Invite",
  inviteSchema
);
