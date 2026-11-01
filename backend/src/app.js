import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";

const app = express();

const allowedOrigins = [
    "https://share-hub-zeta.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        if (
            allowedOrigins.includes(origin) ||
            origin.endsWith(".vercel.app") ||
            process.env.NODE_ENV !== "production"
        ) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))

// Serve temp static files with automatic PDF and Image MIME detection
app.use("/temp", express.static("public/temp", {
    setHeaders: (res, filePath) => {
        try {
            const fd = fs.openSync(filePath, "r");
            const buffer = Buffer.alloc(8);
            fs.readSync(fd, buffer, 0, 8, 0);
            fs.closeSync(fd);
            if (buffer.toString("utf8", 0, 4) === "%PDF") {
                res.setHeader("Content-Type", "application/pdf");
            } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
                res.setHeader("Content-Type", "image/png");
            } else if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
                res.setHeader("Content-Type", "image/jpeg");
            }
        } catch {}
        res.setHeader("Content-Disposition", "inline");
    }
}));

app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./routes/user.routes.js";
import resourceRouter from "./routes/resource.routes.js";
import bookingRouter from "./routes/booking.routes.js";
import incidentRouter from "./routes/incident.routes.js";
import qualificationRouter from "./routes/qualification.routes.js";

app.use("/api/v1/users",userRouter)
app.use("/api/v1/resources",resourceRouter)
app.use("/api/v1/bookings",bookingRouter)
app.use("/api/v1/incidents",incidentRouter)
app.use("/api/v1/qualifications",qualificationRouter)

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "ShareHub API Core Online (v1)",
        timestamp: new Date().toISOString()
    });
});

app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "ShareHub API Core Online (v1)",
        timestamp: new Date().toISOString()
    });
});

// Global error handler matching API contract
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || (res.statusCode && res.statusCode >= 400 ? res.statusCode : 500);
    const message = err.message || "Internal Server Error";
    return res.status(statusCode).json({
        statusCode,
        message,
        errors: err.errors || [],
        success: false
    });
});

export { app };