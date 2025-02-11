import React, { useEffect } from "react";
import "./Home.css";
import Chatlist from "../../components/chatlist/Chatlist.jsx";
import Loader from "../../components/loader/Loader.jsx";
import { Outlet } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { setUser } from "../../redux/userSlice.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

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
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        {
          method: "GET",
          headers: { token: localStorage.auth_token },
        }
      );

      const result = await response.json();

      if (response.status === 200 && result.success) {
        dispatch(
          setUser({
            name: result.name,
            username: result.username,
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

  return (
    <>
      <div className="chat">
        <div className="list">
          <div className="logo">Chat App</div>

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

          <div className="discover">
            <button
              className="discoverRoomBtn"
              onClick={() =>
                location.pathname !== "/rooms" && navigate("/rooms")
              }
            >
              <span>Discover Rooms</span>
              <FontAwesomeIcon icon={faGlobe} />
            </button>
          </div>

          <Chatlist />
        </div>

        <Outlet />
      </div>
    </>
  );
};

export default Home;
