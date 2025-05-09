import React, { useState, useEffect, useRef, useMemo } from "react";
import "./DirectMessages.css";
import { Loader } from "../../../../components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { socket } from "../../../../socketIO/socket.js";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getUserDetails } from "../../../../api/userApi.js";
import { getDMHistory } from "../../../../api/historyApi.js";

const DirectMessages = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(false);
  const dmContainerRef = useRef(null);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const receiverUsername = useParams().username;
  const [receiver, setReceiver] = useState({});

  // Scroll to the bottom when chatHistory changes
  useEffect(() => {
    if (dmContainerRef.current && scrollProgress) {
      dmContainerRef.current.scrollTop = dmContainerRef.current.scrollHeight;
    }
    setScrollProgress(false);
  }, [scrollProgress]);

  // Fetch message history when the component loads
  useEffect(() => {
    if (receiver.username) {
      fetchHistory();
    }
  }, [user.username, receiver.username]);

  // fetch reciever user
  useEffect(() => {
    fetchRecieverUser();
  }, [receiverUsername]);

  // Fetch history function for direct messages
  const fetchHistory = async () => {
    const result = await getDMHistory(user.username, receiver.username);

    if (result.success) {
      setChatHistory(result.history);
      setScrollProgress(true);
    } else {
      console.error("Error fetching history:", result.error);
    }
  };

  // Fetch user data
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

  // SOCKET.IO OPERATIONS
  useEffect(() => {
    if (!user.username || !receiver.username) {
      return;
    }

    socket.on("receivePrivateMessage", (data) => {
      handleReceivePrivateMessage(data);
    });

    return () => {
      socket.off("receivePrivateMessage");
    };
  }, [user.username, receiver.username]);

  // HANDLE FUNCTIONS
  // receive private message
  const handleReceivePrivateMessage = (data) => {
    setChatHistory((prev) => [
      ...prev,
      {
        message: data.message,
        senderUsername: data.senderUsername,
      },
    ]);

    if (dmContainerRef.current && data.senderUsername === user.username) {
      setScrollProgress(true);
      return;
    }

    if (
      dmContainerRef.current.scrollTop + dmContainerRef.current.clientHeight >=
      dmContainerRef.current.scrollHeight
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

    socket.emit("privateMessage", {
      senderUsername: user.username,
      receiverUsername: receiver.username,
      message: msg,
    });

    setMessage("");
    setScrollProgress(true);
  };

  // group consecutive messages
  const groupedMessages = (chatHistory) => {
    const groups = [];
    let currentGroup = [];

    chatHistory.flat().forEach((msg, index) => {
      const isNewGroup =
        index === 0 ||
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
    <div className="chatWrapper">
      {!receiverUsername ? (
        <Loader />
      ) : (
        <>
          <div className="topArea">
            <button className="backBtn" onClick={() => navigate(-1)}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            <button
              className="receiverInfo"
              onClick={() => navigate(`/user/${receiver.username}`)}
            >
              <img src={receiver.pfp} className="receiverProfilePicture"></img>
              <div className="name">
                <span className="receiverName">{receiver.name}</span>
                <span className="receiverUsername">@{receiver.username}</span>
              </div>
            </button>
          </div>

          <div className="DMContainer" ref={dmContainerRef}>
            {!chatHistory.length ? (
              <p className="noMessages">Start A Conversation!</p>
            ) : (
              groupedMessagesMemo.map((group, index) => {
                const consecutiveMessages = group[0];

                return (
                  <div
                    key={index}
                    className="messageContainer"
                    style={
                      consecutiveMessages.senderUsername === user.username
                        ? { alignItems: "flex-end" }
                        : { alignItems: "flex-start" }
                    }
                  >
                    <div
                      className="messageBox"
                      style={{ marginLeft: "1.5vmin" }}
                    >
                      <div
                        className="messageWrapper"
                        style={
                          consecutiveMessages.senderUsername === user.username
                            ? { alignItems: "flex-end" }
                            : { alignItems: "flex-start" }
                        }
                      >
                        {group.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`message ${
                              msg.senderUsername === user.username
                                ? "right"
                                : "left"
                            }`}
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

export default DirectMessages;
