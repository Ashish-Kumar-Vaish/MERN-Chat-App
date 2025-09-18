import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getUserDetails,
  addFriend,
  removeFriend,
  acceptFriendRequest,
} from "../../api/userApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import Button from "../../components/ui/Button";

const User = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({});
  const [myProfile, setMyProfile] = useState({});
  const user = useSelector((state) => state.user);

  useEffect(() => {
    fetchUserDetails(username);
  }, [username]);

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
    }
  };

  // handle add friend
  const handleAddFriend = async () => {
    const result = await addFriend(userProfile.username);
    if (result.success) {
      await fetchUserDetails(username);
    } else {
      console.error("Error adding friend:", result.error);
    }
  };

  // handle remove friend
  const handleRemoveFriend = async () => {
    const result = await removeFriend(userProfile.username);
    if (result.success) {
      await fetchUserDetails(username);
    } else {
      console.error("Error removing friend:", result.error);
    }
  };

  // handle accept friend request
  const handleAcceptFriendRequest = async () => {
    const result = await acceptFriendRequest(userProfile.username);
    if (result.success) {
      await fetchUserDetails(username);
    } else {
      console.error("Error accepting friend:", result.error);
    }
  };

  return (
    <div className="flex flex-col w-full bg-[var(--app-bg)]">
      <div className="flex items-center h-20 mb-4">
        <button
          className="cursor-pointer border-none text-[var(--secondary-text)] rounded-full mx-2 hover:text-[var(--send-button-hover)]"
          onClick={() => navigate(-1)}
        >
          <FontAwesomeIcon
            icon={faChevronLeft}
            className="h-7 w-7 md:h-8 md:w-8 lg:h-10 lg:w-10"
          />
        </button>
        <span className="text-[var(--secondary-text)] text-lg md:text-xl lg:text-2xl font-semibold">
          {userProfile.name}
        </span>
      </div>

      <div className="flex flex-col items-center">
        <img
          src={userProfile.pfp}
          alt="pfp"
          className="w-40 sm:w-48 md:w-56 aspect-square rounded-full object-cover border-2 border-[var(--pfp-border)]"
        />
        <div className="flex flex-col items-center mt-4">
          <span className="text-[var(--secondary-text)] text-xl md:text-2xl font-semibold">
            {userProfile.name}
          </span>
          <span className="text-[var(--dimmed-text)] text-lg md:text-xl">
            @{userProfile.username}
          </span>
        </div>
      </div>

      {userProfile.username === user.username ? (
        <div className="flex justify-center items-center mt-6">
          <Button onClick={() => navigate("/settings/profile")}>
            Go to Settings
          </Button>
        </div>
      ) : (
        <div className="flex justify-center items-center flex-wrap mt-6 gap-x-2">
          {myProfile.sentFriendRequests &&
          myProfile.sentFriendRequests.some(
            (sent) => sent.username === userProfile.username
          ) ? (
            <Button disabled>
              <span>Requested</span>
              <FontAwesomeIcon icon={faCheck} className="ml-2" />
            </Button>
          ) : myProfile.requests &&
            myProfile.requests.some(
              (req) => req.username === userProfile.username
            ) ? (
            <Button variant="primary" onClick={handleAcceptFriendRequest}>
              Accept Friend Request
            </Button>
          ) : myProfile.friends &&
            myProfile.friends.some(
              (friend) => friend.username === userProfile.username
            ) ? (
            <Button variant="danger" onClick={handleRemoveFriend}>
              Unfriend
            </Button>
          ) : (
            <Button variant="primary" onClick={handleAddFriend}>
              Add Friend
            </Button>
          )}

          <Button onClick={() => navigate("/inbox/dm/" + userProfile.username)}>
            Message
          </Button>
        </div>
      )}
    </div>
  );
};

export default User;
