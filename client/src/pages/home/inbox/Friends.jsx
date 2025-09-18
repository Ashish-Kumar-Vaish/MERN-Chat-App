import { useEffect, useState } from "react";
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
} from "../../../api/userApi";
import { useForm } from "react-hook-form";
import { UserList } from "../../../components";
import Button from "../../../components/ui/Button";

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
  const { register, handleSubmit, setValue, watch, formState } = useForm();
  const { isSubmitting } = formState;

  useEffect(() => {
    getChats();
    if (location.pathname.endsWith("add")) {
      setOption("Add");
    }
  }, []);

  // load chats
  const getChats = async () => {
    const result = await getUserDetails(user.username);

    if (result.success) {
      fetchUserDetails({
        all: result.chatWithUsers.flat(),
        friends: result.friends.flat(),
        requests: result.requests.flat(),
      });
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
        (u) => !resultFriends.users.some((f) => f.username === u.username)
      );
      setRequestsDetails(requests);
      setRequestsDisplay(requests);
    }
  };

  // filter search locally
  useEffect(() => {
    if (search.trim().length) {
      const filterUsers = (arr, query) =>
        arr.filter(
          (u) =>
            u.name.toLowerCase().includes(query.toLowerCase()) ||
            u.username.toLowerCase().includes(query.toLowerCase())
        );

      setAllUsersDisplay(filterUsers(allUsersDetails, search));
      setFriendsDisplay(filterUsers(friendsDetails, search));
      setRequestsDisplay(filterUsers(requestsDetails, search));
    }
  }, [search]);

  // db search
  const onSubmit = async (data) => {
    if (!data.searchToAdd?.trim()) {
      setValue("searchToAdd", "");
      return;
    }

    const result = await searchUsers({
      searchUser: data.searchToAdd,
      limit: 15,
    });

    if (result.success) {
      setSearchedUsers(result.searchedUsers);
    } else {
      setSearchedUsers([]);
    }
  };

  // Accept Friend Request
  const handleAcceptFriendRequest = async (info) => {
    const result = await acceptFriendRequest(info.username);

    if (result.success) {
      setFriendsDetails([...friendsDetails, info]);
      setFriendsDisplay([...friendsDisplay, info]);
      setRequestsDetails(
        requestsDetails.filter((u) => u.username !== info.username)
      );
      setRequestsDisplay(
        requestsDisplay.filter((u) => u.username !== info.username)
      );
      setFriendRequests(
        friendRequests.filter((u) => u.username !== info.username)
      );
    }
  };

  // Reject Friend Request
  const handleRejectFriendRequest = async (info) => {
    const result = await rejectFriendRequest(info.username);

    if (result.success) {
      setFriendRequests(
        friendRequests.filter((u) => u.username !== info.username)
      );
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center bg-[var(--top-navigation-bg)] p-2">
        {["All", "Friends", "Requests"].map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            className={`mr-2 ${
              option === tab ? "bg-[var(--sidebar-panel-bg)]" : ""
            }`}
            onClick={() => {
              navigate("/inbox/friends");
              setOption(tab);
            }}
          >
            {tab}
          </Button>
        ))}

        <Button
          variant="primary"
          className="whitespace-nowrap"
          onClick={() => {
            if (!location.pathname.endsWith("add")) navigate("add");
            setOption("Add");
          }}
        >
          <FontAwesomeIcon
            icon={faPlus}
            className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 mr-2"
          />
          <span>Add Friend</span>
        </Button>
      </div>

      {option !== "Add" && (
        <div className="flex items-center bg-[var(--input-field-bg)]">
          <input
            type="text"
            placeholder="Search People..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none text-[var(--input-text)] w-full py-4 ml-4"
          />
          {search.trim().length ? (
            <button
              className="cursor-pointer text-[var(--search-button-text)] hover:text-[var(--search-button-hover-text)] mx-2"
              onClick={() => {
                setSearch("");
                setAllUsersDisplay(allUsersDetails);
                setFriendsDisplay(friendsDetails);
                setRequestsDisplay(requestsDetails);
              }}
            >
              <FontAwesomeIcon
                icon={faXmark}
                className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6"
              />
            </button>
          ) : (
            <button className="text-[var(--search-button-text)] mx-2">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6"
              />
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
          <div className="flex text-[var(--primary-text)] border-y border-[var(--list-border)]">
            <button
              className={`flex items-center justify-center p-4 w-full font-medium transition-all 
                border-r border-[var(--list-border)]
                ${
                  status === "SearchToAdd"
                    ? "bg-[var(--nav-button-hover-bg)]"
                    : "bg-[var(--top-navigation-bg)] hover:bg-[var(--nav-button-hover-bg)]"
                }`}
              onClick={() => setStatus("SearchToAdd")}
            >
              <span>Search Users</span>
              <FontAwesomeIcon
                icon={faSearch}
                className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 ml-2"
              />
            </button>

            <button
              className={`flex items-center justify-center p-4 w-full font-medium transition-all
                ${
                  status === "Pending"
                    ? "bg-[var(--nav-button-hover-bg)]"
                    : "bg-[var(--top-navigation-bg)] hover:bg-[var(--nav-button-hover-bg)]"
                }`}
              onClick={() => setStatus("Pending")}
            >
              <span>Pending Requests</span>
              <FontAwesomeIcon
                icon={faBell}
                className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 ml-2"
              />
            </button>
          </div>

          {status === "SearchToAdd" && (
            <>
              <form
                className="flex items-center bg-[var(--input-field-bg)]"
                autoComplete="off"
                onSubmit={handleSubmit(onSubmit)}
              >
                <input
                  type="text"
                  placeholder="Search People..."
                  {...register("searchToAdd")}
                  className="outline-none text-[var(--input-text)] w-full py-4 ml-4"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmit(onSubmit)();
                    }
                  }}
                />

                {watch("searchToAdd") && (
                  <button
                    className="text-[var(--search-button-text)] hover:text-[var(--search-button-hover-text)] cursor-pointer"
                    onClick={() => setValue("searchToAdd", "")}
                  >
                    <FontAwesomeIcon
                      icon={faXmark}
                      className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 ml-2"
                    />
                  </button>
                )}
                <button
                  type="submit"
                  className="text-[var(--search-button-text)] hover:text-[var(--search-button-hover-text)] cursor-pointer"
                  {...register("myForm")}
                  disabled={isSubmitting}
                >
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 mx-2"
                  />
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
