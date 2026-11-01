import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (filePath) => {
    try {
        if (!filePath) return null;

        // Check if Cloudinary credentials are valid non-dummy
        if (
            process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_CLOUD_NAME !== 'demo_cloud' &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_KEY !== '1234567890'
        ) {
            try {
                const response = await cloudinary.uploader.upload(filePath, {
                    resource_type: "auto"
                });
                console.log("File uploaded successfully to Cloudinary:", response.url);
                try { fs.unlinkSync(filePath); } catch {}
                return response;
            } catch (err) {
                console.warn("Cloudinary remote upload failed, falling back to local static serving:", err.message);
            }
        }

        // Fallback: If in Vercel or cloud environment, convert to Data URI for instant zero-dependency serving
        if (process.env.VERCEL || process.env.NODE_ENV === "production" || !fs.existsSync('./public/temp')) {
            try {
                if (fs.existsSync(filePath)) {
                    const ext = path.extname(filePath).toLowerCase();
                    let mimeType = "application/octet-stream";
                    if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
                    else if (ext === ".png") mimeType = "image/png";
                    else if (ext === ".gif") mimeType = "image/gif";
                    else if (ext === ".webp") mimeType = "image/webp";
                    else if (ext === ".pdf") mimeType = "application/pdf";
                    else if (ext === ".svg") mimeType = "image/svg+xml";

                    const fileBuffer = fs.readFileSync(filePath);
                    const base64Data = fileBuffer.toString("base64");
                    const dataUri = `data:${mimeType};base64,${base64Data}`;
                    try { fs.unlinkSync(filePath); } catch {}
                    return {
                        url: dataUri,
                        secure_url: dataUri
                    };
                }
            } catch (convErr) {
                console.warn("Data URI conversion failed:", convErr);
            }
        }

        // Local development static serving fallback
        const localTempDir = path.resolve('./public/temp');
        if (!fs.existsSync(localTempDir)) {
            try { fs.mkdirSync(localTempDir, { recursive: true }); } catch {}
        }

        const filename = `${Date.now()}_${path.basename(filePath)}`;
        const targetPath = path.resolve(localTempDir, filename);
        if (filePath !== targetPath && fs.existsSync(filePath)) {
            try {
                fs.copyFileSync(filePath, targetPath);
                try { fs.unlinkSync(filePath); } catch {}
            } catch (copyErr) {
                console.warn("Could not copy to local temp directory:", copyErr.message);
            }
        }

        const localUrl = `http://localhost:${process.env.PORT || 8000}/temp/${filename}`;
        console.log("File served locally at:", localUrl);
        return {
            url: localUrl,
            secure_url: localUrl
        };
    }
    catch (error) {
        console.error("Upload error:", error);
        try { fs.unlinkSync(filePath); } catch {}
        return null;
    }
};

const deleteFromCloudinary = async (url) => {
    try {
        if (!url) return null;
        if (url.includes("cloudinary.com")) {
            const pubId = url.split("/upload/")[1]
                ?.replace(/^v\d+\//, "")
                ?.replace(/\.[^/.]+$/, "");
            if (pubId) {
                return await cloudinary.uploader.destroy(pubId, { resource_type: "image" });
            }
        }
        return { result: "ok" };
    } catch (error) {
        console.error("Error deleting file:", error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };