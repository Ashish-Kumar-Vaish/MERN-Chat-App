import React, { useState, useEffect } from "react";
import "./MessagePfp.css";
import { socket } from "../../socketIO/socket.js";
import { getUserDetails } from "../../api/userApi.js";
import { useNavigate } from "react-router-dom";

const MessagePfp = ({ msg }) => {
  const navigate = useNavigate();
  const [pfpUrl, setPfpUrl] = useState("/assets/defaultPfp.png");

  // useEffect to fetch and set pfp
  useEffect(() => {
    handlePfp(msg);

    socket.on("pfpUpdated", (data) => {
      handlePfpUpdate(data);
    });

    return () => {
      socket.off("pfpUpdated");
    };
  }, [msg]);

  // handle pfp update
  const handlePfpUpdate = (data) => {
    if (data.username === msg.senderUsername) {
      setPfpUrl(data.newPfpUrl);
    }
  };

  // handle pfp load
  const handlePfp = async (msg) => {
    const result = await getUserDetails(msg.senderUsername);

    if (result.success) {
      setPfpUrl(result.pfp);
    } else {
      console.error("Error fetching user details:", result.error);
    }
  };

  return (
    <div
      className="newMsgPfp"
      style={{ backgroundImage: `url(${pfpUrl})` }}
      onClick={() => navigate(`/user/${msg.senderUsername}`)}
    ></div>
  );
};

export default MessagePfp;
