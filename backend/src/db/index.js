import mongoose from "mongoose";
import { DB_NAME } from "./../constants.js";

let mongodInstance = null;

const connectDB = async () => {
    const rawUri = (process.env.MONGODB_URI || "mongodb://127.0.0.1:27017").trim().replace(/\/+$/, "");
    try {
        const connectIstant = await mongoose.connect(`${rawUri}/${DB_NAME}`, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log(`\n MongoDB connected : ${connectIstant.connection.host}`);
    } catch(err) {
        console.log("\n External MongoDB not active, starting local embedded MongoMemoryServer...", err.message);
        try {
            const { MongoMemoryServer } = await import("mongodb-memory-server");
            mongodInstance = await MongoMemoryServer.create({
                instance: {
                    port: 27017,
                    dbName: DB_NAME,
                }
            });
            const uri = mongodInstance.getUri();
            const connectIstant = await mongoose.connect(`${uri}${DB_NAME}`);
            console.log(`\n Embedded MongoDB connected : ${connectIstant.connection.host}`);
        } catch (innerErr) {
            console.log("ERROR while connecting to embedded MongoDB:", innerErr);
            process.exit(1);
        }
    }
};

export default connectDB;