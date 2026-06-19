import { v2 as cloudinary } from "cloudinary";
import "./env.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (buffer, folder = "rein_oro_products", publicId = null) => {
  return new Promise((resolve, reject) => {
    const options = { folder };
    if (publicId) {
      options.public_id = publicId;
    }
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    stream.end(buffer);
  });
};

export default cloudinary;
