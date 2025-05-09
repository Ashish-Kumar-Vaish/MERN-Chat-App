import React from "react";
import "./Account.css";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../../../redux/userSlice.js";
import { clearCurrentRoom } from "../../../redux/roomSlice.js";
import { socket } from "../../../socketIO/socket.js";
import { deleteUser } from "../../../api/userApi.js";

const Account = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // log out user
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    socket.disconnect();
    dispatch(clearUser());
    dispatch(clearCurrentRoom());
    navigate("/");
  };

  // delete account permanently
  const handleAccountDeletion = async () => {
    try {
      const result = await deleteUser(user.username);

      if (result.success) {
        localStorage.removeItem("auth_token");
        socket.disconnect();
        dispatch(clearUser());
        dispatch(clearCurrentRoom());
        navigate("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="account">
      <div className="btnContainer">
        <div className="btnWrapper">
          <p>Log out from this device</p>
          <button className="btn red" onClick={handleLogout}>
            Log out
          </button>
        </div>
        <div className="btnWrapper">
          <p>Delete account permanently</p>
          <button className="btn red" onClick={handleAccountDeletion}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;
