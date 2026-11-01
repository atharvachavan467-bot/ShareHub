import multer from "multer";
import os from "os";
import path from "path";
import fs from "fs";

// Determine safe writable temporary directory across local and serverless (Vercel) environments
const getUploadDir = () => {
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return os.tmpdir();
  }

  const localDir = path.resolve(process.cwd(), "public/temp");
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    return localDir;
  } catch {
    return os.tmpdir();
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = getUploadDir();
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedExt = path.extname(file.originalname || "").toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${sanitizedExt}`);
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  }
});