import { useState, useEffect, useRef, useMemo } from "react";
import { Loader } from "../../components";
import { socket } from "../../socketIO/socket.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getRoomHistory } from "../../api/historyApi.js";
import Button from "../../components/ui/Button.jsx";
import { mediaUploadFunction } from "../../lib/mediaHelpers.js";
import MessageInput from "../../components/MessageInput.jsx";
import MessageGroup from "../../components/MessageGroup.jsx";

const Chat = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(false);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const currentRoom = useSelector((state) => state.currentRoom);

  // Scroll to the bottom when chatHistory changes
  useEffect(() => {
    if (chatContainerRef.current && scrollProgress) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;

      setScrollProgress(false);
    }
  }, [scrollProgress]);

  // useEffect to fetch history
  useEffect(() => {
    if (currentRoom.currentRoomId.length > 0) {
      fetchHistory();
    }
  }, [currentRoom.currentRoomId]);

  // Fetch history function
  const fetchHistory = async () => {
    try {
      const result = await getRoomHistory(currentRoom.currentRoomId);

      if (result.success) {
        setChatHistory(result.history);
        setScrollProgress(true);
      } else {
        console.error("Error fetching history:", result.error);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  // SOCKET IO OPERATIONS
  useEffect(() => {
    if (user.username && currentRoom.currentRoomId) {
      handleConnect();

      socket.on("connect", handleConnect);
      socket.on("receive", handleReceive);
      socket.on("otherUserLeftRoom", handleLeftRoom);
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("receive", handleReceive);
      socket.off("otherUserLeftRoom", handleLeftRoom);
    };
  }, [user.username, currentRoom.currentRoomId]);

  // Listen for message confirmation
  useEffect(() => {
    socket.on("messageConfirmed", (data) => {
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.clientId === data.clientId
            ? { ...msg, ...data, status: "sent" }
            : msg
        )
      );
    });

    return () => {
      socket.off("messageConfirmed");
    };
  }, []);

  // HANDLE FUNCTIONS
  // connect to socket.io
  const handleConnect = () => {
    socket.emit("userJoined", {
      roomId: currentRoom.currentRoomId,
      username: user.username,
    });
  };

  // recieve message
  const handleReceive = (data) => {
    setChatHistory((prev) => [
      ...prev,
      {
        message: data.message,
        media: data.media,
        position: data.position,
        senderUsername: data.senderUsername,
        status: data.status,
        createdAt: data.createdAt,
      },
    ]);

    if (chatContainerRef.current) {
      if (data.senderUsername === user.username) {
        setScrollProgress(true);
        return;
      }

      const bottom =
        chatContainerRef.current.scrollTop +
          chatContainerRef.current.clientHeight >=
        chatContainerRef.current.scrollHeight;

      if (bottom) {
        setScrollProgress(true);
      }
    }
  };

  // left the room
  const handleLeftRoom = (data) => {
    setChatHistory((prev) => [
      ...prev,
      {
        message: "left the room",
        position: "center",
        senderUsername: data.username,
      },
    ]);

    setScrollProgress(true);
  };

  // group consecutive messages
  const groupedMessages = (chatHistory) => {
    const groups = [];
    let currentGroup = [];

    chatHistory.flat().forEach((msg, index) => {
      const isNewGroup =
        index === 0 ||
        chatHistory[index - 1]?.position === "center" ||
        chatHistory[index]?.position === "center" ||
        chatHistory[index - 1]?.senderUsername !== msg.senderUsername;

      if (isNewGroup) {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [msg];
      } else {
        currentGroup.push(msg);
      }
    });

    if (currentGroup.length > 0) {
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
      {!currentRoom.currentRoomId ? (
        <div className="h-full w-full text-[var(--inactive-text)] flex items-center justify-center text-base md:text-lg lg:text-xl font-semibold">
          No room selected
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between h-[10%] bg-[var(--top-navigation-bg)]">
            <button
              className="flex items-center cursor-pointer w-full h-full"
              onClick={() => navigate(`/about/${currentRoom.currentRoomId}`)}
            >
              <img
                src={currentRoom.currentRoomPfp}
                className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 border border-[var(--pfp-border)] rounded-full object-cover mx-4"
                alt="Room Profile"
              />
              <span className="line-clamp-1 text-[var(--primary-text)] text-lg md:text-xl lg:text-2xl font-semibold">
                {currentRoom.currentRoomName}
              </span>
            </button>

            <div className="flex items-center justify-center mx-2 md:mx-4 lg:mx-6">
              <Button
                onClick={() => navigate(`/about/${currentRoom.currentRoomId}`)}
              >
                About
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-scroll" ref={chatContainerRef}>
            {!chatHistory.length ? (
              <Loader />
            ) : (
              groupedMessagesMemo.map((group, index) => (
                <MessageGroup
                  key={index}
                  group={group}
                  user={user}
                  isDM={false}
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
                  position: "relative",
                  senderUsername: user.username,
                  status: "pending",
                  clientId: clientId,
                  createdAt: Date.now(),
                },
              ]);

              socket.emit("send", {
                message: msg || null,
                media: uploaded,
                senderUsername: user.username,
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

export default Chat;
