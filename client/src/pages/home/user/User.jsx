import React, { useEffect, useState } from "react";
import "./User.css";
import { useParams, useNavigate } from "react-router-dom";
import { getUserDetails } from "../../../api/userApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import {
  addFriend,
  removeFriend,
  acceptFriendRequest,
} from "../../../api/userApi";

const User = () => {
  const username = useParams().username;
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({});
  const [myProfile, setMyProfile] = useState({});
  const user = useSelector((state) => state.user);

  useEffect(() => {
    fetchUserDetails(username);
  }, [username, userProfile]);

  // fetch user details
  const fetchUserDetails = async (username) => {
    const userResult = await getUserDetails(username);
    const myResult = await getUserDetails(user.username);

    if (userResult.success && myResult.success) {
      setUserProfile({
        name: userResult.name,
        username: userResult.username,
        pfp: userResult.pfp,
      });

      setMyProfile({
        friends: myResult.friends,
        requests: myResult.requests,
        sentFriendRequests: myResult.sentFriendRequests,
      });
    } else {
      console.error(
        "Error fetching user details:",
        userResult.error,
        "&",
        myResult.error
      );
    }
  };

  // handle add friend
  const handleAddFriend = async () => {
    const result = await addFriend(userProfile.username);

    if (!result.success) {
      console.error("Error adding friend:", result.error);
    }
  };

  // handle remove friend
  const handleRemoveFriend = async () => {
    const result = await removeFriend(userProfile.username);

    if (!result.success) {
      console.error("Error removing friend:", result.error);
    }
  };

  // handle accept friend request
  const handleAcceptFriendRequest = async (info) => {
    const result = await acceptFriendRequest(info.username);

    if (result.success) {
      navigate("/user/" + info.username);
    } else {
      console.error("Error accepting friend:", result.error);
    }
  };

  return (
    <div className="userProfile">
      <div className="topHeader">
        <button className="backBtn" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <span>{userProfile.name}</span>
      </div>

      <div className="pfpAndUser">
        <div className="pfpAndEdit">
          <img src={userProfile.pfp} className="pfp" />
        </div>
        <div className="nameContainer">
          <span className="name">{userProfile.name}</span>
          <span className="username">{"@" + userProfile.username}</span>
        </div>
      </div>

      {userProfile.username !== user.username && (
        <div className="buttonWrapper">
          {myProfile.sentFriendRequests &&
          myProfile.sentFriendRequests.some(
            (sent) => sent.username === userProfile.username
          ) ? (
            <button className="btn transparent" disabled>
              <span>Requested</span>
              <FontAwesomeIcon icon={faCheck}></FontAwesomeIcon>
            </button>
          ) : myProfile.requests &&
            myProfile.requests.some(
              (request) => request.username === userProfile.username
            ) ? (
            <button
              className="btn blue"
              onClick={() => handleAcceptFriendRequest(userProfile)}
            >
              <span>Accept Friend Request</span>
            </button>
          ) : myProfile.friends &&
            myProfile.friends.some(
              (friend) => friend.username === userProfile.username
            ) ? (
            <button className="btn red" onClick={() => handleRemoveFriend()}>
              <span>Unfriend</span>
            </button>
          ) : (
            <button className="btn blue" onClick={() => handleAddFriend()}>
              <span>Add Friend</span>
            </button>
          )}

          <button
            className="btn"
            onClick={() => navigate("/inbox/dm/" + userProfile.username)}
          >
            <span>Message</span>
          </button>
        </div>
      )}

      {userProfile.username === user.username && (
        <div className="buttonWrapper">
          <button className="btn" onClick={() => navigate("/settings/profile")}>
            <span>Go to Settings</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default User;
