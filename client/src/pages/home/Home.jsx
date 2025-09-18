import { useEffect } from "react";
import { RoomList, Loader } from "../../components";
import { Outlet } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { setUser } from "../../redux/userSlice.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faHammer,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";
import { socket } from "../../socketIO/socket.js";
import { getVerifiedUserDetails } from "../../api/authApi";
import Button from "../../components/ui/Button";

const Home = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // auth token check
  useEffect(() => {
    if (!localStorage.auth_token) {
      navigate("/login");
    } else {
      fetchData();
    }
  }, []);

  // fetch user data
  const fetchData = async () => {
    try {
      const result = await getVerifiedUserDetails(localStorage.auth_token);

      if (result.success) {
        dispatch(
          setUser({
            name: result.name,
            username: result.username,
            email: result.email,
            pfp: result.pfp,
          })
        );
      } else {
        console.error("Auth token not found:", result.error);
        navigate("/login");
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  // useeffect to connect to socket
  useEffect(() => {
    if (user.username) {
      handleConnect();

      socket.on("connect", handleConnect);
    }

    return () => {
      socket.off("connect", handleConnect);
    };
  }, [user.username]);

  // handle connect to socket
  const handleConnect = () => {
    socket.emit("privateConnect", {
      username: user.username,
    });
  };

  return (
    <>
      <div className="flex h-screen bg-[var(--app-bg)]">
        <div className="flex flex-col w-60 md:w-80 gap-y-2 border-r border-[var(--list-border)] text-[var(--list-item-text)]">
          <div className="text-xl md:text-2xl lg:text-3xl text-center my-2">
            <button
              onClick={() => navigate("/")}
              className="cursor-pointer w-full text-xl md:text-2xl text-[var(--logo-text)]"
              style={{
                fontFamily: "Audiowide",
                textShadow: "0.15rem 0.15rem 0.1rem var(--logo-shadow)",
                letterSpacing: "0.5rem",
              }}
            >
              Chat App
            </button>
          </div>

          <div
            className="flex items-center cursor-pointer w-full mb-2"
            onClick={() => navigate("/settings")}
          >
            <img
              src={user.pfp}
              className="h-9 w-9 md:h-12 md:w-12 border border-[var(--pfp-border)] rounded-full object-cover mx-4"
              alt="Profile"
            />

            {user.name && user.username ? (
              <div className="flex flex-col overflow-hidden whitespace-nowrap">
                <span className="text-base md:text-lg lg:text-xl truncate">
                  {user.name}
                </span>
                <span className="text-xs md:text-sm lg:text-base truncate">
                  @{user.username}
                </span>
              </div>
            ) : (
              <div className="flex flex-col overflow-hidden gap-1 md:gap-1.5 lg:gap-2">
                <div className="w-30 md:w-35 lg:w-45 h-3 md:h-4 lg:h-5">
                  <Loader />
                </div>
                <div className="w-20 md:w-25 lg:w-35 h-2 md:h-3 lg:h-4">
                  <Loader />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center">
            <Button
              variant="nav"
              onClick={() =>
                !location.pathname.startsWith("/inbox") && navigate("/inbox")
              }
            >
              <span>Inbox</span>
              <FontAwesomeIcon
                icon={faMessage}
                className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 ml-2 md:ml-4"
              />
            </Button>
          </div>

          <div className="w-[90%] h-px bg-[var(--divider-line)] mx-auto"></div>

          <div className="flex flex-col items-center justify-center">
            <Button
              variant="nav"
              onClick={() =>
                location.pathname !== "/createRoom" && navigate("/createRoom")
              }
            >
              <span>Create New Room</span>
              <FontAwesomeIcon
                icon={faHammer}
                className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 ml-2 md:ml-4"
              />
            </Button>
          </div>

          <div className="flex flex-col items-center justify-center">
            <Button
              variant="nav"
              onClick={() =>
                location.pathname !== "/rooms" && navigate("/rooms")
              }
            >
              <span>Discover Rooms</span>
              <FontAwesomeIcon
                icon={faGlobe}
                className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 ml-2 md:ml-4"
              />
            </Button>
          </div>

          <RoomList />
        </div>

        <Outlet />
      </div>
    </>
  );
};

export default Home;
