import { useState, useEffect, useRef, useMemo } from "react";
import { Loader } from "../../../components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { socket } from "../../../socketIO/socket.js";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getUserDetails } from "../../../api/userApi.js";
import { getDMHistory } from "../../../api/historyApi.js";
import { mediaUploadFunction } from "../../../lib/mediaHelpers.js";
import MessageInput from "../../../components/MessageInput.jsx";
import MessageGroup from "../../../components/MessageGroup.jsx";

const DirectMessages = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(false);
  const dmContainerRef = useRef(null);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const receiverUsername = useParams().username;
  const [receiver, setReceiver] = useState({});

  // scroll bottom
  useEffect(() => {
    if (dmContainerRef.current && scrollProgress) {
      dmContainerRef.current.scrollTop = dmContainerRef.current.scrollHeight;

      setScrollProgress(false);
    }
  }, [scrollProgress]);

  // useEffect to fetch chat history
  useEffect(() => {
    if (user.username && receiver.username) {
      fetchHistory();
    }
  }, [user.username, receiver.username]);

  // fetch chat history
  const fetchHistory = async () => {
    try {
      const result = await getDMHistory(user.username, receiver.username);

      if (result.success) {
        setChatHistory(result.history);
        setScrollProgress(true);
      } else {
        console.error("Error fetching chat history:", result.error);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  // useEffect to fetch reciever user details
  useEffect(() => {
    if (receiverUsername) {
      fetchRecieverUser();
    }
  }, [receiverUsername]);

  // fetch reciever user details
  const fetchRecieverUser = async () => {
    const result = await getUserDetails(receiverUsername);

    if (result.success) {
      setReceiver({
        name: result.name,
        username: result.username,
        pfp: result.pfp,
      });
    } else {
      console.error("Error fetching user details:", result.error);
    }
  };

  // SOCKET
  useEffect(() => {
    if (!user.username || !receiver.username) {
      return;
    }

    socket.on("receivePrivateMessage", handleReceivePrivateMessage);
    socket.on("privateMessageConfirmed", handleMessageConfirmed);

    return () => {
      socket.off("receivePrivateMessage", handleReceivePrivateMessage);
      socket.off("privateMessageConfirmed", handleMessageConfirmed);
    };
  }, [user.username, receiver.username]);

  // Handle message confirmation
  const handleMessageConfirmed = (data) => {
    setChatHistory((prev) =>
      prev.map((msg) =>
        msg.clientId === data.clientId
          ? { ...msg, ...data, status: "sent" }
          : msg
      )
    );
  };

  // handle receive private message
  const handleReceivePrivateMessage = (data) => {
    setChatHistory((prev) => [
      ...prev,
      {
        message: data.message,
        media: data.media,
        senderUsername: data.senderUsername,
        status: data.status,
        createdAt: data.createdAt,
      },
    ]);

    if (dmContainerRef.current) {
      if (data.senderUsername === user.username) {
        setScrollProgress(true);
        return;
      }

      const bottom =
        dmContainerRef.current.scrollTop +
          dmContainerRef.current.clientHeight >=
        dmContainerRef.current.scrollHeight;

      if (bottom) {
        setScrollProgress(true);
      }
    }
  };

  // Group consecutive sender messages
  const groupedMessages = (chatHistory) => {
    const groups = [];
    let currentGroup = [];

    chatHistory.flat().forEach((msg, idx) => {
      const isNew =
        idx === 0 ||
        chatHistory[idx - 1]?.senderUsername !== msg.senderUsername;

      if (isNew) {
        if (currentGroup.length) {
          groups.push(currentGroup);
        }
        currentGroup = [msg];
      } else currentGroup.push(msg);
    });

    if (currentGroup.length) {
      groups.push(currentGroup);
    }
    return groups;
  };

  // memo to save computation
  const groupedMessagesMemo = useMemo(
    () => groupedMessages(chatHistory),
    [chatHistory]
  );

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {!receiverUsername ? (
        <Loader />
      ) : (
        <>
          <div className="flex items-center justify-between h-[10%] bg-[var(--top-navigation-bg)]">
            <button
              onClick={() => navigate(-1)}
              className="cursor-pointer text-[var(--secondary-text)] rounded-full mx-2 hover:text-[var(--send-button-hover)]"
            >
              <FontAwesomeIcon
                icon={faChevronLeft}
                className="w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10"
              />
            </button>

            <button
              onClick={() => navigate(`/user/${receiver.username}`)}
              className="flex items-center flex-1 cursor-pointer"
            >
              <img
                src={receiver.pfp}
                alt="pfp"
                className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 border border-[var(--pfp-border)] rounded-full object-cover mr-4"
              />
              <div className="flex flex-col items-start">
                <span className="text-[var(--primary-text)] text-base md:text-lg font-semibold">
                  {receiver.name}
                </span>
                <span className="text-[var(--dimmed-text)] text-xs md:text-sm">
                  @{receiver.username}
                </span>
              </div>
            </button>
          </div>

          <div
            ref={dmContainerRef}
            className="flex-1 overflow-y-scroll pl-2 pt-2"
          >
            {!chatHistory.length ? (
              <span className="text-center text-[var(--inactive-text)] text-sm sm:text-base font-medium mt-10">
                Start A Conversation!
              </span>
            ) : (
              groupedMessagesMemo.map((group, index) => (
                <MessageGroup
                  key={index}
                  group={group}
                  user={user}
                  isDM={true}
                />
              ))
            )}
          </div>

          <MessageInput
            onSend={async (msg, files) => {
              let uploaded = [];

              if (files.length) {
                uploaded = await mediaUploadFunction(files);
              }

              const clientId = Date.now() + "-" + Math.random();

              setChatHistory((prev) => [
                ...prev,
                {
                  message: msg || null,
                  media: uploaded,
                  senderUsername: user.username,
                  status: "pending",
                  clientId: clientId,
                  createdAt: Date.now(),
                },
              ]);

              socket.emit("privateMessage", {
                senderUsername: user.username,
                receiverUsername: receiver.username,
                message: msg || null,
                media: uploaded,
                clientId: clientId,
              });

              setScrollProgress(true);
            }}
          />
        </>
      )}
    </div>
  );
};

export default DirectMessages;
