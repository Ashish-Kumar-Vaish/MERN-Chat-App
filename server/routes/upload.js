const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }

    const streamUpload = (buffer, mimetype = "") => {
      return new Promise((resolve, reject) => {
        let resourceType = "auto";

        if (
          !mimetype.startsWith("image/") &&
          !mimetype.startsWith("video/") &&
          !mimetype.startsWith("audio/")
        ) {
          resourceType = "raw";
        }

        const fileName = `MERN-Chat-App-${Date.now()}_${Math.floor(
          Math.random() * 1e6
        )}`;

        let stream = cloudinary.uploader.upload_stream(
          {
            folder: "mern-chat-app",
            resource_type: resourceType,
            public_id: fileName,
          },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );

        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    const pLimit = require("p-limit").default;
    const limit = pLimit(5);

    const uploadResults = await Promise.allSettled(
      req.files.map((file) =>
        limit(() => streamUpload(file.buffer, file.mimetype))
      )
    );

    const urls = uploadResults.map((result) => result.secure_url);

    return res.status(200).json({ success: true, urls });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Upload failed: " + error.message });
  }
});

module.exports = router;
