import { useEffect, useState } from "react";
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
import Button from "../../../components/ui/Button";

const Inbox = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user);
  const [search, setSearch] = useState("");
  const [allUserDetails, setAllUserDetails] = useState([]);
  const [usersDisplay, setUsersDisplay] = useState([]);

  // useEffect to fetch users when mounted
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

  // search filtering
  useEffect(() => {
    if (!search.trim().length) {
      setUsersDisplay(allUserDetails);
    } else {
      setUsersDisplay(
        allUserDetails.filter(
          (u) =>
            u.name.toLowerCase().includes(search.trim().toLowerCase()) ||
            u.username.toLowerCase().includes(search.trim().toLowerCase())
        )
      );
    }
  }, [search]);

  return (
    <div className="flex w-full h-full">
      <div className="flex flex-col min-w-60 md:min-w-72 border-r border-solid border-[var(--list-border)] text-[var(--list-item-text)] bg-[var(--app-bg)]">
        <div className="text-center my-2 sm:my-3 md:my-4">
          <span className="text-[var(--secondary-text)] text-base sm:text-lg md:text-xl font-semibold">
            Inbox
          </span>
        </div>

        <div className="w-[90%] h-px bg-[var(--divider-line)] mx-auto"></div>

        <div className="flex flex-col items-center justify-center my-2">
          <Button
            variant="nav"
            onClick={() =>
              location.pathname !== "friends" && navigate("friends")
            }
          >
            <span>Friends</span>
            <FontAwesomeIcon
              icon={faInbox}
              className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 ml-2 md:ml-4"
            />
          </Button>
        </div>

        <div className="flex items-center justify-center bg-[var(--input-field-bg)]">
          <input
            type="text"
            placeholder="Search People..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none outline-none text-[var(--input-text)] w-full py-4 ml-4"
          />

          {!search.trim().length ? (
            <button className="text-[var(--search-button-text)] mx-2">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6"
              />
            </button>
          ) : (
            <button
              onClick={() => setSearch("")}
              className="border-none cursor-pointer text-[var(--search-button-text)] hover:text-[var(--search-button-hover-text)] mx-2"
            >
              <FontAwesomeIcon
                icon={faXmark}
                className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6"
              />
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
