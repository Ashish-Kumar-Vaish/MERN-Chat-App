import React from "react";
import "./Settings.css";
import { Outlet, useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="settingsContainer">
      <div className="options">
        <div className="topHeader">
          <button className="backBtn" onClick={() => navigate(-1)}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <span>Settings</span>
        </div>

        <button
          className="optionBtn"
          onClick={() => navigate("profile", { replace: true })}
        >
          Profile
        </button>
        <button
          className="optionBtn"
          onClick={() => navigate("account", { replace: true })}
        >
          Account
        </button>
      </div>

      <div className="operations">
        <Outlet />
      </div>
    </div>
  );
};

export default Settings;
