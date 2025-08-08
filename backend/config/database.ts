import mongoose from "mongoose"
import {config} from "dotenv"

config();

export const connectDB = async()=>{
   mongoose.connect(process.env.DATABASE_URL!)
   .then(()=>console.log("DataBase connected Successfully"))
   .catch((e)=>{
      console.log("error occured in connecting with the DB")
      process.exit(1);
   })
}