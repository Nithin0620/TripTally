import mongoose, { Document, Types, Schema } from "mongoose";

interface ITrip extends Document {
   title: string;
   description?: string;
   startDate?: Date;
   endDate?: Date;
   owner: Types.ObjectId;
   members: {
      user: Types.ObjectId;
      role: 'owner' | 'editor' | 'viewer';
   }[];
   coverImage?: string;
   budgetLimit?: number;
   currency: string;
   createdAt: Date;
   updatedAt: Date;
}

   const tripSchema = new Schema<ITrip>(
   {
      title: {
         type: String,
         required: true,
      },
      description: {
         type: String,
      },
      startDate: {
         type: Date,
      },
      endDate: {
         type: Date,
      },
      owner: {
         type: Types.ObjectId,
         ref: "User",
      },
      members: [
         {
         user: { type: Types.ObjectId, ref: "User" },
         role: { type: String, enum: ["owner", "editor", "viewer"] },
         },
      ],
      coverImage: {
         type: String,
      },
      budgetLimit: {
         type: Number,
      },
      currency: {
         type: String,
         default: "INR",
      },
   },
   {
      timestamps: true,
   }
);

export default mongoose.model<ITrip>("Trip", tripSchema);
