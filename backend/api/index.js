import { app } from "../src/app.js";
import connectDB from "../src/db/index.js";

export default async function handler(req, res) {
    try {
        await connectDB();
    } catch (err) {
        console.error("Database connection failed in serverless handler:", err);
    }
    return app(req, res);
}
