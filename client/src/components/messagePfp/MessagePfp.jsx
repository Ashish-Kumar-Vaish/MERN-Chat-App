import React, { useState, useEffect } from "react";
import "./MessagePfp.css";
import { socket } from "../../socketIO/socket.js";

const MessagePfp = ({ msg }) => {
  const [pfpUrl, setPfpUrl] = useState("/assets/defaultPfp.png");

  useEffect(() => {
    handlePfp(msg);

    socket.on("pfpUpdated", (data) => {
      handlePfpUpdate(data);
    });

    return () => {
      socket.off("pfpUpdated", handlePfpUpdate);
    };
  }, [msg]);

  // handle pfp update
  const handlePfpUpdate = (data) => {
    if (data.username === msg.senderUsername) {
      setPfpUrl(data.newPfpUrl);
    }
  };

  // handle pfp
  const handlePfp = async (msg) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/getUserPfp`,
        {
          method: "GET",
          headers: { username: msg.senderUsername },
        }
      );

      const result = await response.json();

      if (response.status === 200 && result.success) {
        setPfpUrl(result.userPfp);
        return result.userPfp;
      } else {
        return "/assets/defaultPfp.png";
      }
    } catch (error) {
      return "/assets/defaultPfp.png";
    }
  };

  return (
    <div
      className="newMsgPfp"
      style={{ backgroundImage: `url(${pfpUrl})` }}
    ></div>
  );
};

export default MessagePfp;
