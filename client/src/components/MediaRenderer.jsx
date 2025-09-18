import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFilePowerpoint,
  faFileArchive,
  faFileAlt,
  faFileCode,
  faFile,
  faPlayCircle,
  faTimes,
  faCircleArrowDown,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";

const MediaRenderer = ({ file }) => {
  const [showVideo, setShowVideo] = useState(false);
  const [showImage, setShowImage] = useState(false);

  if (!file || !file.url) {
    return null;
  }

  // get download url for cloudinary
  const getDownloadUrl = (url, fileName) => {
    if (!url) {
      return url;
    }

    const parts = url.split("/upload/");
    if (parts.length !== 2) {
      return url;
    }

    let nameWithoutExtension = fileName
      ? fileName.replace(/\s+/g, "_").replace(/\.[^/.]+$/, "")
      : "download";

    return `${parts[0]}/upload/fl_attachment:${encodeURIComponent(
      nameWithoutExtension
    )}/${parts[1]}`;
  };

  if (file.type === "image") {
    return (
      <>
        <div className="w-90 max-h-110 min-h-10 overflow-hidden rounded-lg">
          <img
            src={file.url}
            alt={file.name || "image"}
            className="cursor-pointer w-full h-full object-cover"
            onClick={() => setShowImage(true)}
          />
        </div>

        {showImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
            <div className="absolute top-4 right-4 flex gap-x-4">
              <a
                href={getDownloadUrl(file.url, file.name)}
                download={file.name || true}
                className="text-2xl text-[var(--secondary-text)] hover:text-[var(--dimmed-text)] cursor-pointer"
              >
                <FontAwesomeIcon icon={faDownload} />
              </a>

              <button
                className="text-2xl text-[var(--secondary-text)] hover:text-[var(--dimmed-text)] cursor-pointer"
                onClick={() => setShowImage(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <img
              src={file.url}
              alt={file.name || "media"}
              className="max-w-[75vw] max-h-[95vh] h-full object-contain"
            />
          </div>
        )}
      </>
    );
  } else if (file.type === "video") {
    return (
      <>
        <div
          className="w-90 max-h-110 min-h-10 rounded-lg overflow-hidden relative cursor-pointer"
          onClick={() => setShowVideo(true)}
        >
          <video src={file.url} className="w-full h-full object-cover" muted />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-all">
            <FontAwesomeIcon
              icon={faPlayCircle}
              className="text-[var(--secondary-text)] hover:text-[var(--primary-text)] text-4xl"
            />
          </div>
        </div>

        {showVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
            <div className="absolute top-4 right-4 flex gap-x-4">
              <a
                href={getDownloadUrl(file.url, file.name)}
                download={file.name || true}
                className="text-2xl text-[var(--secondary-text)] hover:text-[var(--dimmed-text)] cursor-pointer"
              >
                <FontAwesomeIcon icon={faDownload} />
              </a>

              <button
                className="text-2xl text-[var(--secondary-text)] hover:text-[var(--dimmed-text)] cursor-pointer"
                onClick={() => setShowVideo(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <video
              src={file.url}
              controls
              autoPlay
              className="max-w-[75vw] max-h-[95vh] h-full object-contain"
            />
          </div>
        )}
      </>
    );
  } else if (file.type === "audio") {
    return (
      <div className="bg-[var(--message-container-bg)] p-2 rounded-lg max-w-90 max-h-20">
        <audio src={file.url} controls />
      </div>
    );
  }

  const iconMap = {
    pdf: faFilePdf,
    doc: faFileWord,
    docx: faFileWord,
    xls: faFileExcel,
    xlsx: faFileExcel,
    ppt: faFilePowerpoint,
    pptx: faFilePowerpoint,
    zip: faFileArchive,
    rar: faFileArchive,
    txt: faFileAlt,
    html: faFileCode,
    json: faFileCode,
  };

  const icon = iconMap[file.type] || faFile;

  return (
    <div className="flex items-center gap-x-4 bg-[var(--message-container-bg)] p-4 rounded-lg max-w-[40vw] max-h-20">
      <div className="flex items-center gap-x-2 ">
        <FontAwesomeIcon
          icon={icon}
          className="text-2xl text-[var(--secondary-text)]"
        />
        <span className="text-sm font-medium text-[var(--primary-text)] line-clamp-1">
          {file.name}
        </span>
      </div>

      <a
        href={file.url}
        download={file.name || true}
        target="_blank"
        rel="noreferrer"
        className="text-[var(--secondary-text)] hover:text-[var(--dimmed-text)]"
      >
        <FontAwesomeIcon icon={faCircleArrowDown} className="text-xl" />
      </a>
    </div>
  );
};

export default MediaRenderer;
