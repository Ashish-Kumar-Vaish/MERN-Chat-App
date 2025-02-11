import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";
import Loader from "../../../components/loader/Loader.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { socket } from "../../../socketIO/socket.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import MessagePfp from "../../../components/messagePfp/MessagePfp.jsx";

const Chat = () => {
  const [message, setMessage] = useState("");
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
    }
    setScrollProgress(false);
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
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/history/getHistory`,
        {
          method: "GET",
          headers: { roomid: currentRoom.currentRoomId },
        }
      );

      const result = await response.json();

      if (response.status === 200 && result.success) {
        setChatHistory(result.history);
        setScrollProgress(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // SOCKET IO OPERATIONS
  useEffect(() => {
    if (user.username && currentRoom.currentRoomId) {
      socket.connect();

      socket.on("connect", () => {
        handleConnect();
      });

      socket.on("receive", (data) => {
        handleReceive(data);
      });

      socket.on("otherUserLeftRoom", (data) => {
        handleLeftRoom(data);
      });
    }

    return () => {
      socket.off("connect");
      socket.off("receive");
      socket.off("left");
      socket.off("otherUserLeftRoom");
    };
  }, [user.username, currentRoom.currentRoomId]);

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
        position: data.position,
        senderUsername: data.senderUsername,
      },
    ]);

    // console.log(chatContainerRef.current.scrollTop); // 2208
    // console.log(chatContainerRef.current.clientHeight); // 556
    // console.log(chatContainerRef.current.scrollHeight); // 2764

    if (
      chatContainerRef.current.scrollTop +
        chatContainerRef.current.clientHeight >=
      chatContainerRef.current.scrollHeight
    ) {
      setScrollProgress(true);
    }
  };

  // send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    const msg = message.trim();
    if (!msg) {
      setMessage("");
      return;
    }

    setChatHistory((prev) => [
      ...prev,
      {
        message: msg,
        position: "right",
        senderUsername: user.username,
      },
    ]);

    socket.emit("send", {
      message: msg,
      senderUsername: user.username,
    });

    setMessage("");
    setScrollProgress(true);
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

  // handle relative position
  const handleRelative = (msg) => {
    if (msg.position === "relative") {
      return msg.senderUsername === user.username ? "right" : "left";
    } else {
      return msg.position;
    }
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

  return (
    <div className="chatWrapper">
      {!currentRoom.currentRoomId ? (
        <div className="noRoomSelected">No room selected</div>
      ) : (
        <>
          <div className="topArea">
            <button
              className="roomInfo"
              onClick={() => navigate(`/about/${currentRoom.currentRoomId}`)}
            >
              <img
                src={currentRoom.currentRoomPfp}
                className="roomProfilePicture"
              ></img>
              <span className="roomName">{currentRoom.currentRoomName}</span>
            </button>
            <div className="roomOptions">
              <button
                className="btn"
                onClick={() => navigate(`/about/${currentRoom.currentRoomId}`)}
              >
                About
              </button>
            </div>
          </div>
          <div className="container" ref={chatContainerRef}>
            {!chatHistory.length ? (
              <Loader />
            ) : (
              groupedMessages(chatHistory).map((group, index) => {
                const consecutiveMessages = group[0];

                return (
                  <div
                    key={index}
                    className="messageContainer"
                    style={
                      consecutiveMessages.position === "center"
                        ? { alignItems: "center" }
                        : handleRelative(consecutiveMessages) === "left"
                        ? { alignItems: "flex-start" }
                        : { alignItems: "flex-end" }
                    }
                  >
                    <div className="messageBox">
                      {handleRelative(consecutiveMessages) === "left" && (
                        <MessagePfp msg={consecutiveMessages} />
                      )}

                      <div
                        className="messageWrapper"
                        style={
                          handleRelative(consecutiveMessages) === "left"
                            ? { alignItems: "flex-start" }
                            : { alignItems: "flex-end" }
                        }
                      >
                        {handleRelative(consecutiveMessages) === "left" && (
                          <span>{consecutiveMessages.senderUsername}</span>
                        )}

                        {group.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`message ${handleRelative(msg)}`}
                          >
                            {msg.position === "center"
                              ? `${
                                  msg.senderUsername === user.username
                                    ? "You"
                                    : msg.senderUsername
                                } ${msg.message}`
                              : msg.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="send">
            <input
              type="text"
              className="messageInput"
              placeholder="Type something..."
              spellCheck="false"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage(e);
                }
              }}
            />
            <button className="btn" onClick={(e) => handleSendMessage(e)}>
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;
