import { Router } from "express";
import multer from "multer";
import { uploadToCloudinary } from "../util/cloudinary.js";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Endpoint for single image upload (e.g. product thumbnail)
router.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const productId = req.body.productId ? String(req.body.productId).trim() : "unknown_product";
    const type = req.body.type || "thumbnail"; // thumbnail, alternate, benefit

    let folder = "Renoro";
    if (type === "thumbnail") {
      folder = "Renoro/thumbnail";
    } else if (type === "alternate") {
      folder = "Renoro/alternate images";
    } else if (type === "benefit") {
      folder = "Renoro/benefit images";
    } else if (type === "ingredient") {
      folder = "Renoro/ingredients";
    }

    // Include productId, type, and a timestamp to guarantee uniqueness and clear identification
    const publicId = `${productId}_${type}_${Date.now()}`;

    const imageUrl = await uploadToCloudinary(req.file.buffer, folder, publicId);
    res.json({ success: true, url: imageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint for multiple image uploads (e.g. alternate product images)
router.post("/api/upload/multiple", upload.array("images", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }
    const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer));
    const imageUrls = await Promise.all(uploadPromises);
    res.json({ success: true, urls: imageUrls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
