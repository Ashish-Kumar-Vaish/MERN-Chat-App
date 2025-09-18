import { useState, useEffect } from "react";
import { socket } from "../socketIO/socket.js";
import { getUserDetails } from "../api/userApi.js";
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
    try {
      const result = await getUserDetails(msg.senderUsername);

      if (result.success) {
        setPfpUrl(result.pfp);
      } else {
        console.error("Error fetching user details:", result.error);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  return (
    <div
      className="sticky top-2 w-6 h-6 lg:w-8 lg:h-8 rounded-full mt-8 mx-2 mb-2 border border-[var(--pfp-border)] cursor-pointer"
      style={{
        backgroundImage: `url(${pfpUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onClick={() => navigate(`/user/${msg.senderUsername}`)}
    ></div>
  );
};

export default MessagePfp;
