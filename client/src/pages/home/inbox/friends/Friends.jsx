import React, { useEffect, useState } from "react";
import "./Friends.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMagnifyingGlass,
  faXmark,
  faSearch,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getUserDetails,
  getMultipleUserDetails,
  acceptFriendRequest,
  rejectFriendRequest,
  searchUsers,
} from "../../../../api/userApi";
import { useForm } from "react-hook-form";
import { UserList } from "../../../../components";

const Friends = () => {
  const [option, setOption] = useState("All");
  const [status, setStatus] = useState("SearchToAdd");
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [allUsersDetails, setAllUsersDetails] = useState([]);
  const [allUsersDisplay, setAllUsersDisplay] = useState([]);
  const [friendsDetails, setFriendsDetails] = useState([]);
  const [friendsDisplay, setFriendsDisplay] = useState([]);
  const [requestsDetails, setRequestsDetails] = useState([]);
  const [requestsDisplay, setRequestsDisplay] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [searchedUsers, setSearchedUsers] = useState([]);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm();

  useEffect(() => {
    getChats();

    if (location.pathname.endsWith("add")) {
      setOption("Add");
    }
  }, []);

  // search users in list
  const getChats = async () => {
    const result = await getUserDetails(user.username);

    if (result.success) {
      fetchUserDetails({
        all: result.chatWithUsers.flat(),
        friends: result.friends.flat(),
        requests: result.requests.flat(),
      });
    } else {
      console.error("Error fetching user details:", result.error);
    }
  };

  // fetch user details function
  const fetchUserDetails = async (data) => {
    const resultAll = await getMultipleUserDetails(data.all);
    const resultFriends = await getMultipleUserDetails(data.friends);
    const resultFriendRequests = await getMultipleUserDetails(data.requests);

    if (
      resultAll.success &&
      resultFriends.success &&
      resultFriendRequests.success
    ) {
      setAllUsersDetails(resultAll.users);
      setAllUsersDisplay(resultAll.users);

      setFriendsDetails(resultFriends.users);
      setFriendsDisplay(resultFriends.users);

      setFriendRequests(resultFriendRequests.users);

      const requests = resultAll.users.filter(
        (user) =>
          !resultFriends.users.some(
            (friend) => friend.username === user.username
          )
      );

      setRequestsDetails(requests);
      setRequestsDisplay(requests);
    } else {
      console.error(
        "Error fetching user details:",
        resultAll.error,
        "&",
        resultFriends.error,
        "&",
        resultFriendRequests.error
      );
    }
  };

  // search users in lists
  useEffect(() => {
    if (search.trim().length) {
      const filterUsers = (users, query) => {
        return users.filter(
          (user) =>
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.username.toLowerCase().includes(query.toLowerCase())
        );
      };

      setAllUsersDisplay(filterUsers(allUsersDetails, search.trim()));
      setFriendsDisplay(filterUsers(friendsDetails, search.trim()));
      setRequestsDisplay(filterUsers(requestsDetails, search.trim()));
    }
  }, [search]);

  // search users in db
  const onSubmit = async (data, e) => {
    if (!data.searchToAdd.trim().length) {
      setValue("searchToAdd", "");
      return;
    }

    try {
      const result = await searchUsers({
        searchUser: data.searchToAdd,
        limit: 15,
      });

      if (result.success) {
        setSearchedUsers(result.searchedUsers);
      } else {
        setSearchedUsers([]);
        console.log(result.error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // handle accept friend request
  const handleAcceptFriendRequest = async (info) => {
    const result = await acceptFriendRequest(info.username);

    if (result.success) {
      setFriendsDetails([...friendsDetails, info]);
      setFriendsDisplay([...friendsDisplay, info]);
      setRequestsDetails(
        requestsDetails.filter((user) => user.username !== info.username)
      );
      setRequestsDisplay(
        requestsDisplay.filter((user) => user.username !== info.username)
      );
      setFriendRequests(
        friendRequests.filter((user) => user.username !== info.username)
      );
    } else {
      console.error("Error accepting friend:", result.error);
    }
  };

  // handle reject friend request
  const handleRejectFriendRequest = async (info) => {
    const result = await rejectFriendRequest(info.username);

    if (result.success) {
      setFriendRequests(
        friendRequests.filter((user) => user.username !== info.username)
      );
    } else {
      console.error("Error rejecting friend:", result.error);
    }
  };

  return (
    <div className="friends">
      <div className="categories">
        <button
          className="option"
          onClick={() => {
            if (location.pathname !== "/inbox/friends") {
              navigate("/inbox/friends");
            }
            setOption("All");
          }}
          style={{
            backgroundColor: option === "All" ? "rgb(49, 51, 56)" : undefined,
          }}
        >
          All
        </button>

        <button
          className="option"
          onClick={() => {
            if (location.pathname !== "/inbox/friends") {
              navigate("/inbox/friends");
            }
            setOption("Friends");
          }}
          style={{
            backgroundColor:
              option === "Friends" ? "rgb(49, 51, 56)" : undefined,
          }}
        >
          Friends
        </button>

        <button
          className="option"
          onClick={() => {
            if (location.pathname !== "/inbox/friends") {
              navigate("/inbox/friends");
            }
            setOption("Requests");
          }}
          style={{
            backgroundColor:
              option === "Requests" ? "rgb(49, 51, 56)" : undefined,
          }}
        >
          Requests
        </button>

        <button
          className="option add"
          onClick={() => {
            if (!location.pathname.endsWith("add")) {
              navigate("add");
            }
            setOption("Add");
          }}
        >
          <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
          <span> Add Friend</span>
        </button>
      </div>

      {option !== "Add" && (
        <div className="inputBar">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search.trim().length ? (
            <button
              className="clearBtn"
              onClick={() => {
                setSearch("");
                setAllUsersDisplay(allUsersDetails);
                setFriendsDisplay(friendsDetails);
                setRequestsDisplay(requestsDetails);
              }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          ) : (
            <button className="searchBtn">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          )}
        </div>
      )}
      {option === "All" && (
        <UserList users={allUsersDisplay} mode="chat" noUsers="No DMs" />
      )}
      {option === "Friends" && (
        <UserList users={friendsDisplay} mode="chat" noUsers="No Friends :(" />
      )}
      {option === "Requests" && (
        <UserList users={requestsDisplay} mode="chat" noUsers="No Requests" />
      )}
      {option === "Add" && (
        <>
          <div className="searchToAddAndPending">
            <button
              className="searchToAddAndPendingBtn"
              onClick={() => setStatus("SearchToAdd")}
              style={{
                backgroundColor:
                  status === "SearchToAdd" ? "rgb(79, 81, 85)" : undefined,
              }}
            >
              <span>Search Users</span>
              <FontAwesomeIcon icon={faSearch}></FontAwesomeIcon>
            </button>

            <button
              className="searchToAddAndPendingBtn"
              onClick={() => setStatus("Pending")}
              style={{
                backgroundColor:
                  status === "Pending" ? "rgb(79, 81, 85)" : undefined,
              }}
            >
              <span>Pending Friend Requests</span>
              <FontAwesomeIcon icon={faBell}></FontAwesomeIcon>
            </button>
          </div>

          {status === "SearchToAdd" && (
            <>
              <form
                className="myForm inputBar"
                autoComplete="off"
                onSubmit={handleSubmit(onSubmit)}
              >
                <input
                  type="text"
                  spellCheck="false"
                  placeholder="Search Users..."
                  {...register("searchToAdd")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmit(onSubmit)();
                    }
                  }}
                />

                {watch("searchToAdd") && (
                  <button
                    className="searchBtn"
                    onClick={() => {
                      setValue("searchToAdd", "");
                    }}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                )}

                <button
                  className="searchBtn"
                  type="submit"
                  {...register("myForm")}
                  disabled={isSubmitting}
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
              </form>

              <UserList
                users={searchedUsers}
                mode="profile"
                noUsers="No User Found"
              />
            </>
          )}

          {status === "Pending" && (
            <UserList
              users={friendRequests}
              mode="pending"
              noUsers="No Pending Friend Requests"
              onAccept={handleAcceptFriendRequest}
              onReject={handleRejectFriendRequest}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Friends;
