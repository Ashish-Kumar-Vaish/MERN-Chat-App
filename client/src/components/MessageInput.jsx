import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faSmile,
  faSmileBeam,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import EmojiPicker from "emoji-picker-react";
import MediaPreview from "./MediaPreview";

const MessageInput = ({ onSend }) => {
  const [message, setMessage] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  // close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // handle send message
  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = message.trim();

    if (!trimmed && mediaFiles.length === 0) {
      return;
    }

    onSend(trimmed, mediaFiles);
    setMessage("");
    setMediaFiles([]);
  };

  return (
    <>
      {mediaFiles.length > 0 && (
        <MediaPreview
          files={mediaFiles}
          onRemoveFile={(index) => {
            setMediaFiles((prev) => prev.filter((_, i) => i !== index));
          }}
          onAddFiles={() => document.getElementById("mediaInput").click()}
        />
      )}

      <div className="bg-[var(--top-navigation-bg)] h-[10%] flex items-center">
        <div className="flex items-center ml-2 gap-x-2 lg:gap-x-0 text-[var(--secondary-text)] relative">
          <input
            type="file"
            multiple
            id="mediaInput"
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files);
              if (files.length > 0) {
                setMediaFiles((prev) => [...prev, ...files]);
              }
              e.target.value = null;
            }}
          />

          <button
            className="cursor-pointer hover:text-[var(--send-button-hover)]"
            onClick={() => document.getElementById("mediaInput").click()}
          >
            <FontAwesomeIcon
              icon={faPlus}
              className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 xl:h-10 xl:w-10"
            />
          </button>

          <button
            className="cursor-pointer hover:text-[var(--send-button-hover)]"
            onClick={() => setShowPicker((prev) => !prev)}
          >
            <FontAwesomeIcon
              icon={showPicker ? faSmileBeam : faSmile}
              className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 xl:h-10 xl:w-10"
            />
          </button>

          {showPicker && (
            <div ref={pickerRef} className="absolute bottom-15 z-50">
              <EmojiPicker
                theme="dark"
                onEmojiClick={(emojiData) =>
                  setMessage((prev) => prev + emojiData.emoji)
                }
              />
            </div>
          )}
        </div>

        <input
          type="text"
          className="w-full outline-none p-4 text-[var(--primary-text)]"
          placeholder="Type something..."
          spellCheck="false"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend(e);
            }
          }}
        />

        <button
          className="cursor-pointer text-[var(--secondary-text)] mr-4 hover:text-[var(--send-button-hover)]"
          onClick={handleSend}
        >
          <FontAwesomeIcon
            icon={faPaperPlane}
            className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 xl:h-10 xl:w-10"
          />
        </button>
      </div>
    </>
  );
};

export default MessageInput;
