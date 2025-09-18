import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import Button from "./ui/Button";

const UserList = ({
  users = [],
  mode = "chat", // 'chat', 'profile', 'pending'
  noUsers = "No users to display",
  onAccept = () => {},
  onReject = () => {},
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!users.length) {
    return (
      <div className="text-[var(--inactive-text)] text-center mt-4 md:mt-6 font-semibold">
        <span>{noUsers}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden">
      <div>
        {users.flat().map((user) => (
          <div
            key={user.username}
            className={
              mode === "pending"
                ? "group flex items-center justify-between hover:cursor-pointer hover:bg-[var(--room-button-hover-bg)]"
                : ""
            }
          >
            <button
              className={`bg-[var(--room-button-bg)] text-[var(--input-text)] py-2 w-full flex items-center ${
                mode === "pending"
                  ? "group-hover:cursor-pointer group-hover:bg-[var(--room-button-hover-bg)]"
                  : "hover:bg-[var(--room-button-hover-bg)] cursor-pointer"
              }`}
              onClick={() => {
                const path =
                  mode === "chat"
                    ? `/inbox/dm/${user.username}`
                    : `/user/${user.username}`;

                if (location.pathname !== path) {
                  navigate(path);
                }
              }}
            >
              <img
                src={user.pfp}
                alt="pfp"
                className="h-8 w-8 md:h-10 md:w-10 mx-4 rounded-full object-cover border border-[var(--pfp-border)]"
              />
              <div className="flex flex-col items-start">
                <span className="block overflow-hidden whitespace-nowrap text-ellipsis text-[var(--secondary-text)]">
                  {user.name}
                </span>
                <span className="block overflow-hidden whitespace-nowrap text-ellipsis text-[var(--username-dim)] text-sm">
                  @{user.username}
                </span>
              </div>
            </button>

            {mode === "pending" && (
              <div className="flex gap-x-2 mx-2">
                <Button variant="primary" onClick={() => onAccept(user)}>
                  <span>Accept</span>
                  <FontAwesomeIcon
                    className="w-4 md:w-5 lg:w-6 aspect-square ml-2"
                    icon={faCheck}
                  />
                </Button>

                <Button variant="danger" onClick={() => onReject(user)}>
                  <span>Reject</span>
                  <FontAwesomeIcon
                    className="w-4 md:w-5 lg:w-6 aspect-square ml-2"
                    icon={faXmark}
                  />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
