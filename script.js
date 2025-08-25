import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

cloudinary.config({
  cloud_name: "dc8pyevgs",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

(async function () {
  try {
    const folderPath = "./uploads";
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);

      // Upload and generate square version immediately
      const result = await cloudinary.uploader.upload(filePath, {
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "auto" },
          { quality: "auto", fetch_format: "auto" }
        ]
      });

      // This secure_url is already square & optimized
      console.log("Square Optimized URL:", result.secure_url);
      
      // ⬆ Save this `result.secure_url` to MongoDB instead of the original
    }
  } catch (err) {
    console.error("Upload error:", err);
  }
})();
