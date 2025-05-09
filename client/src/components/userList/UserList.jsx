import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import "./UserList.css";

const UserList = ({
  users = [],
  mode = "chat", // 'chat', 'profile', 'pending'
  noUsers = "No users to display",
  onAccept = () => {},
  onReject = () => {},
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!users.length) {
    return (
      <div className="noUsers">
        <span>{noUsers}</span>
      </div>
    );
  }

  return (
    <div className="userList">
      <div className="scrollDiv">
        {users.flat().map((user) => (
          <div
            key={user.username}
            className={mode === "pending" ? "pendingUser" : ""}
          >
            <button
              className={mode === "pending" ? "pendingUserBtn" : "userBtn"}
              onClick={() => {
                const path =
                  mode === "chat"
                    ? `/inbox/dm/${user.username}`
                    : `/user/${user.username}`;
                if (location.pathname !== path) navigate(path);
              }}
            >
              <img src={user.pfp} alt="pfp" className="userProfilePicture" />
              <div className="name">
                <span>{user.name}</span>
                <span className="username">@{user.username}</span>
              </div>
            </button>

            {mode === "pending" && (
              <>
                <button
                  className="actionBtn blue"
                  onClick={() => onAccept(user)}
                >
                  <span>Accept</span>
                  <FontAwesomeIcon icon={faCheck} />
                </button>
                <button
                  className="actionBtn red"
                  onClick={() => onReject(user)}
                >
                  <span>Reject</span>
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
