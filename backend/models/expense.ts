import mongoose,{Document,Schema} from "mongoose";


interface IExpense extends Document{
   trip:mongoose.Types.ObjectId;
   title:string;
   amount:number;
   paidBy:mongoose.Types.ObjectId;
   paidOn:Date;
   splitType:'equal' | 'percentage' |'custom';
   involved:[mongoose.Types.ObjectId];

   percentages:Map<number,number>;
   customShares:Map<number,number>;

   notes:string;
   tags:[string];
   createdBy:mongoose.Types.ObjectId;
}


const expenseSchema = new mongoose.Schema<IExpense>({
   trip:{
      type:Schema.Types.ObjectId,
      ref:"Trip",
   },
   title:{
      type:String,
   },
   amount:{
      type:Number,
   },
   paidBy:{
      type:Schema.Types.ObjectId,
      ref:"User",
   },
   paidOn:{
      type:Date,
   },
   splitType:{
      type:String,
      enum:["equal", "percentage", "custom"],
      default:"equal",
   },
   involved:[{
      type:Schema.Types.ObjectId,
      ref:"User",
   }],

   percentages: {
      type: Map,
      of: Number, 
   },
   customShares: {
      type: Map,
      of: Number, 
   },

   notes: String,
   tags: [String],
   createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: "User" 
   },
})


export default mongoose.model<IExpense>("Expense",expenseSchema);