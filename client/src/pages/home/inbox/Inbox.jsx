import React, { useEffect, useState } from "react";
import "./Inbox.css";
import { Outlet, useLocation, useNavigate } from "react-router";
import { UserList } from "../../../components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInbox,
  faXmark,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { getUserDetails, getMultipleUserDetails } from "../../../api/userApi";

const Inbox = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user);
  const [search, setSearch] = useState("");
  const [allUserDetails, setAllUserDetails] = useState([]);
  const [usersDisplay, setUsersDisplay] = useState([]);

  // useEffect to fetch and set rooms joined
  useEffect(() => {
    if (!usersDisplay.length) {
      setAllUserDetails([]);
      setUsersDisplay([]);
      fetchChatWithUsers();
    }
  }, []);

  // fetch rooms joined function
  const fetchChatWithUsers = async () => {
    const result = await getUserDetails(user.username);

    if (result.success) {
      fetchUserDetails(result.chatWithUsers.flat());
    } else {
      console.error("Error fetching user details:", result.error);
    }
  };

  // fetch room details function
  const fetchUserDetails = async (data) => {
    if (!data.length) {
      return;
    }

    const result = await getMultipleUserDetails(data);

    if (result.success) {
      setAllUserDetails(result.users);
      setUsersDisplay(result.users);
    } else {
      console.error("Error fetching user details:", result.error);
    }
  };

  // search users in list
  useEffect(() => {
    if (!search.trim().length) {
      setUsersDisplay(allUserDetails);
    } else {
      setUsersDisplay(
        allUserDetails.filter(
          (user) =>
            user.name.toLowerCase().includes(search.trim().toLowerCase()) ||
            user.username.toLowerCase().includes(search.trim().toLowerCase())
        )
      );
    }
  }, [search]);

  return (
    <div className="inbox">
      <div className="dmList">
        <div className="topHeader">
          <span>Inbox</span>
        </div>

        <div className="line"></div>

        <div className="btnWrapper">
          <button
            className="btn"
            onClick={() =>
              location.pathname !== "friends" && navigate("friends")
            }
          >
            <span>Friends</span>
            <FontAwesomeIcon icon={faInbox} />
          </button>
        </div>

        <div className="inputBar">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {!search.trim().length ? (
            <button className="searchBtn">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          ) : (
            <button className="clearBtn" onClick={() => setSearch("")}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>

        <UserList users={usersDisplay} mode="chat" noUsers="No Users" />
      </div>

      <Outlet />
    </div>
  );
};

export default Inbox;
