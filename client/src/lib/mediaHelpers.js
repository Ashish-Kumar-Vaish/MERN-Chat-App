import { uploadMedia } from "../api/uploadApi";

// guess mime type from file extension
function guessMimeFromExtension(fileName) {
  const ext = fileName.split(".").pop().toLowerCase();

  const map = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",

    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",

    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",

    pdf: "application/pdf",

    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    zip: "application/zip",
    rar: "application/x-rar-compressed",
    "7z": "application/x-7z-compressed",
    tar: "application/x-tar",

    txt: "text/plain",
    html: "text/html",
    json: "application/json",
  };

  return map[ext] || "application/octet-stream";
}

// get media type
export function getMediaType(mimeType, fileName = "") {
  if (!mimeType && fileName) {
    mimeType = guessMimeFromExtension(fileName);
  }

  if (!mimeType) {
    return "file";
  }

  // Image
  if (mimeType.startsWith("image/")) {
    return "image";
  }

  // Video
  if (mimeType.startsWith("video/")) {
    return "video";
  }

  // Audio
  if (mimeType.startsWith("audio/")) {
    return "audio";
  }

  // PDF
  if (mimeType === "application/pdf") {
    return "pdf";
  }

  // Word
  if (
    mimeType === "application/msword" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "doc";
  }

  // Excel
  if (
    mimeType === "application/vnd.ms-excel" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return "excel";
  }

  // PowerPoint
  if (
    mimeType === "application/vnd.ms-powerpoint" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    return "ppt";
  }

  // Archives
  if (
    mimeType === "application/zip" ||
    mimeType === "application/x-rar-compressed" ||
    mimeType === "application/x-7z-compressed" ||
    mimeType === "application/x-tar"
  ) {
    return "archive";
  }

  // Plain text
  if (mimeType.startsWith("text/plain")) {
    return "text";
  }

  // HTML
  if (mimeType === "text/html") {
    return "html";
  }

  // JSON
  if (mimeType === "application/json") {
    return "json";
  }

  return "file";
}

// handle media upload
export async function mediaUploadFunction(mediaFiles) {
  try {
    const result = await uploadMedia(mediaFiles);

    if (!result.success) {
      throw new Error(result.message || "Upload failed");
    }

    return result.urls.map((url, index) => {
      const name = url.substring(url.lastIndexOf("/") + 1);
      const mimeType = mediaFiles[index].type;
      const mediaType = getMediaType(mimeType, mediaFiles[index].name);

      return {
        url: url,
        name: name,
        type: mediaType,
      };
    });
  } catch (error) {
    console.error("Media upload error:", error);
    return [];
  }
}
