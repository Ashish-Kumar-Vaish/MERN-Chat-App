import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faClock,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { MediaRenderer, MessagePfp } from "./index.js";

const MessageGroup = ({ group, user, isDM }) => {
  const firstMsg = group[0];

  // Handles left/right/center placement for room messages
  const handleRelative = (msg) => {
    if (!msg) {
      return null;
    }

    if (msg.position === "relative") {
      return msg.senderUsername === user.username ? "right" : "left";
    }

    return msg.position || null;
  };

  const groupSide =
    firstMsg?.position === "center"
      ? "center"
      : isDM
      ? firstMsg.senderUsername === user.username
        ? "right"
        : "left"
      : handleRelative(firstMsg) ||
        (firstMsg.senderUsername === user.username ? "right" : "left");

  return (
    <div
      className={`flex flex-col ${
        groupSide === "center"
          ? "items-center"
          : groupSide === "left"
          ? "items-start"
          : "items-end"
      }`}
    >
      <div className="flex">
        {!isDM && groupSide === "left" && <MessagePfp msg={firstMsg} />}

        <div
          className={`flex flex-col ${
            groupSide === "left" ? "items-start" : "items-end"
          }`}
        >
          {!isDM && groupSide === "left" && (
            <span className="text-xs md:text-sm lg:text-base text-[var(--message-timestamp)] mb-1">
              {firstMsg.senderUsername}
            </span>
          )}

          {group.map((msg, index) => {
            const isCenter = msg.position === "center";

            const side = isCenter
              ? "center"
              : isDM
              ? msg.senderUsername === user.username
                ? "right"
                : "left"
              : handleRelative(msg) ||
                (msg.senderUsername === user.username ? "right" : "left");

            const sideBg =
              side === "left"
                ? "bg-[var(--message-sender-left)]"
                : "bg-[var(--message-sender-right)]";

            const bubbleBase =
              "text-[var(--primary-text)] bg-[var(--message-container-bg)] flex flex-col max-w-[43vw] py-1 pl-4 pr-2 mb-2 rounded-lg text-base md:text-lg";

            return (
              <div
                key={index}
                className={`${
                  isCenter
                    ? "text-[var(--message-system-center)] text-sm md:text-base text-center py-2"
                    : `${bubbleBase} ${sideBg}`
                }`}
              >
                {msg.media?.map((file, index) => (
                  <div key={index} className="-ml-3 -mr-1 mb-1">
                    <MediaRenderer file={file} />
                  </div>
                ))}

                <div className="flex justify-between">
                  <span className="whitespace-pre-line break-words overflow-hidden">
                    {isCenter
                      ? `${
                          msg.senderUsername === user.username
                            ? "You"
                            : msg.senderUsername
                        } ${msg.message}`
                      : msg.message}
                  </span>

                  {!isCenter && (
                    <div className="flex justify-end items-end text-[0.6rem]">
                      <span className="mr-1 ml-2">
                        {new Date(
                          msg.createdAt || Date.now()
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      {msg.status === "sent" && (
                        <span className="text-[var(--pending-text)]">
                          <FontAwesomeIcon icon={faCheck} />
                        </span>
                      )}
                      {msg.status === "pending" && (
                        <span className="text-[var(--pending-text)]">
                          <FontAwesomeIcon icon={faClock} />
                        </span>
                      )}
                      {msg.status === "failed" && (
                        <span className="text-[var(--error-message)]">
                          <FontAwesomeIcon icon={faCircleExclamation} />
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MessageGroup;
