import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";

const MediaPreview = ({ files, onRemoveFile, onAddFiles }) => {
  if (!files || !files.length) {
    return null;
  }

  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file));
    };
  }, [files]);

  return (
    <div className="flex overflow-x-auto gap-2 p-2 bg-[var(--top-navigation-bg)] border-t border-[var(--list-border)]">
      <button
        onClick={onAddFiles}
        className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-md 
            flex items-center justify-center border border-dashed border-[var(--pfp-border)] 
            bg-black/50 text-[var(--secondary-text)] hover:bg-black/60 hover:text-[var(--primary-text)]"
      >
        <FontAwesomeIcon
          icon={faPlus}
          className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8"
        />
      </button>

      {files.map((file, index) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        const url = URL.createObjectURL(file);

        return (
          <div
            key={index}
            className="relative flex-shrink-0 w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 
            rounded-md overflow-hidden border border-[var(--pfp-border)]"
          >
            <button
              onClick={() => onRemoveFile(index)}
              className="absolute top-1 right-1 z-10 bg-black/50 text-[var(--secondary-text)] hover:bg-black/70
                hover:text-[var(--primary-text)] w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 flex items-center justify-center rounded-md"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <div className="flex-1 h-full relative">
              {isImage && (
                <img
                  src={url}
                  alt={`preview-${index}`}
                  className="w-full h-full object-cover"
                />
              )}

              {isVideo && (
                <video
                  src={url}
                  className="w-full h-full object-cover"
                  controls
                />
              )}

              {!isImage && !isVideo && (
                <div
                  className="w-full h-full flex items-center justify-center bg-[var(--message-container-bg)] 
                    text-[var(--secondary-text)] text-sm md:text-base lg:text-lg p-2 text-center"
                >
                  <FontAwesomeIcon
                    icon={faFile}
                    className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6"
                  />
                  <span className="whitespace-pre-line break-words overflow-hidden">
                    {file.name}
                  </span>
                </div>
              )}

              <div className="absolute bottom-0 w-full">
                <div
                  className="bg-gradient-to-t from-black/80 to-transparent md:text-xs lg:text-sm 
                    text-[var(--primary-text)] truncate text-center p-1 text-[0.6rem]"
                >
                  {file.name}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MediaPreview;
