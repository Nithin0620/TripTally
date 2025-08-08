import express from "express"
import { configDotenv } from "dotenv";
configDotenv();
import { connectDB } from "./config/database";


const app = express();

const PORT:string = process.env.PORT!;

app.listen(PORT,()=>{
   console.log(`The server has started and is running at port:${PORT}`);
   connectDB();
})