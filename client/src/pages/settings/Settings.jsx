import { Outlet, useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--app-bg)]">
      <div className="flex flex-col w-60 md:w-80 border-r border-[var(--list-border)]">
        <div className="flex items-center my-2 text-[var(--secondary-text)]">
          <button
            className="cursor-pointer border-none rounded-full mx-2 hover:text-[var(--send-button-hover)]"
            onClick={() => navigate(-1)}
          >
            <FontAwesomeIcon
              icon={faChevronLeft}
              className="h-7 w-7 md:h-8 md:w-8 lg:h-10 lg:w-10"
            />
          </button>
          <span className="text-base sm:text-lg md:text-xl font-semibold">
            Settings
          </span>
        </div>

        <button
          onClick={() => navigate("profile", { replace: true })}
          className="bg-[var(--room-button-bg)] hover:bg-[var(--room-button-hover-bg)] 
          focus:bg-[var(--room-button-hover-bg)] text-[var(--input-text)] flex items-center cursor-pointer p-4"
        >
          Profile
        </button>
        <button
          onClick={() => navigate("account", { replace: true })}
          className="bg-[var(--room-button-bg)] hover:bg-[var(--room-button-hover-bg)] 
          focus:bg-[var(--room-button-hover-bg)] text-[var(--input-text)] flex items-center cursor-pointer p-4"
        >
          Account
        </button>
      </div>

      <div className="w-full py-4 px-8 text-[var(--secondary-text)]">
        <Outlet />
      </div>
    </div>
  );
};

export default Settings;
