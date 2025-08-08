import mongoose,{Types,Document} from "mongoose"

interface IUser extends Document{
   name:String;
   email:String;
   password:String;
   profilePic:String;
   token:String;
   trips:Types.ObjectId[];
}

const userSchema = new mongoose.Schema<IUser>({
   name:{
      type:String,
      required:true
   },
   email:{
      type:String,
      required:true,
   },
   password:{
      type:String,
      required:true,
   },
   profilePic:{
      type:String,
      default:"",
   },
   token:{
      type:String,
   },
   trips:[{
      type:mongoose.Types.ObjectId,
      ref:"Trip"
   }]
},{
   timestamps:true
})



const sendOnboardingEmail = async(email,name)=>{
   
}


userSchema.pre("save",async(next)=>{
   if(this.isNew){
      await sendOnboardingEmail(this.email,this.name);
   }
   next();
})

export default mongoose.model<IUser>("User",userSchema);