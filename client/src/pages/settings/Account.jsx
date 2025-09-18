import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../../redux/userSlice.js";
import { clearCurrentRoom } from "../../redux/roomSlice.js";
import { socket } from "../../socketIO/socket.js";
import { deleteUser } from "../../api/userApi.js";
import Button from "../../components/ui/Button.jsx";

const Account = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // logout user
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    socket.disconnect();
    dispatch(clearUser());
    dispatch(clearCurrentRoom());
    navigate("/");
  };

  // delete user account
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
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <span className="text-lg md:text-xl lg:text-2xl font-semibold mb-8">
        Account
      </span>

      <div className="flex items-center justify-between mb-4">
        <span className="text-base md:text-lg">Log out from this device</span>
        <Button variant="danger" onClick={handleLogout}>
          Log out
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-base md:text-lg">Delete account permanently</span>
        <Button variant="danger" onClick={handleAccountDeletion}>
          Delete Account
        </Button>
      </div>
    </div>
  );
};

export default Account;
