import mongoose,{Document, Schema} from "mongoose";

interface IActivity extends Document{
   trip:mongoose.Types.ObjectId;
   title:string;
   description:string;
   date:Date;
   time:string;
   location:string;
   tags:[string];
   createdBy:mongoose.Types.ObjectId;
}


const activitySchema = new mongoose.Schema<IActivity>({
   trip:{
      type:Schema.Types.ObjectId,
      ref:"Trip",
   },
   title:{
      type:String,
   },
   description:{
      type:String,
   },
   date:{
      type:Date,
   },
   time:{
      type:String,
   },
   location:{
      type:String,
   },
   tags:[
      {
         type:String,
      }
   ],
   createdBy:{
      type:Schema.ObjectId,
      ref:"User",
   }

},{
   timestamps:true
})


export default mongoose.model<IActivity>("Activity",activitySchema);