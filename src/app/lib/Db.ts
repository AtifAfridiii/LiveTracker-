import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const connectDB = async () => {
    try{
        await mongoose.connect(process.env.DB_URI as string);
        console.log("DB connected");
        return mongoose.connection;
    }catch(err){
        console.log("DB connection failed");
        console.log(err instanceof Error ? err.message : 'Unknown error occurred');

        process.exit(1);
    }
}

export default connectDB;
