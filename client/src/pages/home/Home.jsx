import React, { useEffect } from "react";
import "./Home.css";
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
        console.log("auth token not found:", result.err);
        navigate("/login");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // useeffect to connect to socket
  useEffect(() => {
    if (user.username) {
      socket.on("connect", () => {
        handleConnect();
      });
    }
  }, [user.username]);

  // handle connect to socket
  const handleConnect = () => {
    socket.emit("privateConnect", {
      username: user.username,
    });
  };

  return (
    <>
      <div className="chat">
        <div className="list">
          <div className="logo">
            <button onClick={() => navigate("/")}>Chat App</button>
          </div>

          <div className="userInfo">
            <div className="user" onClick={() => navigate("/settings")}>
              <img src={user.pfp} className="profilePicture"></img>
              {user.name && user.username ? (
                <div className="nameDiv">
                  <span className="name">{user.name}</span>
                  <span className="username">@{user.username}</span>
                </div>
              ) : (
                <Loader />
              )}
            </div>
          </div>

          <div className="btnWrapper">
            <button
              className="btn"
              onClick={() =>
                !location.pathname.startsWith("/inbox") && navigate("/inbox")
              }
            >
              <span>Inbox</span>
              <FontAwesomeIcon icon={faMessage} />
            </button>
          </div>

          <div className="line"></div>

          <div className="btnWrapper">
            <button
              className="btn"
              onClick={() =>
                location.pathname !== "/createRoom" && navigate("/createRoom")
              }
            >
              <span>Create New Room</span>
              <FontAwesomeIcon icon={faHammer} />
            </button>
          </div>

          <div className="btnWrapper">
            <button
              className="btn"
              onClick={() =>
                location.pathname !== "/rooms" && navigate("/rooms")
              }
            >
              <span>Discover Rooms</span>
              <FontAwesomeIcon icon={faGlobe} />
            </button>
          </div>

          <RoomList />
        </div>

        <Outlet />
      </div>
    </>
  );
};

export default Home;
