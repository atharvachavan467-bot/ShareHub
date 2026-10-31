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

        // Fallback: Copy/keep in public/temp and serve locally via /temp/<filename>
        const filename = `${Date.now()}_${path.basename(filePath)}`;
        const targetPath = path.resolve('./public/temp', filename);
        if (filePath !== targetPath) {
            fs.copyFileSync(filePath, targetPath);
            try { fs.unlinkSync(filePath); } catch {}
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