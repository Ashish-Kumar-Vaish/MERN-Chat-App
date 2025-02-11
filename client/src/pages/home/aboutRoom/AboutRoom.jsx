import React, { useEffect, useState } from "react";
import "./AboutRoom.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faCrown,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router";
import { useParams } from "react-router-dom";
import { socket } from "../../../socketIO/socket.js";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentRoom, clearCurrentRoom } from "../../../redux/roomSlice.js";
import { useForm } from "react-hook-form";

const AboutRoom = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const roomId = useParams().roomId;
  const [room, setRoom] = useState({});
  const [image, setImage] = useState("");
  const [checkEdit, setCheckEdit] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // convert file to base64
  const convertToBase64 = (pfp) => {
    return new Promise((resolve, reject) => {
      if (!pfp) return resolve("");

      const reader = new FileReader();
      reader.readAsDataURL(pfp);
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // display uploaded image
  const handleUploadImage = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    const base64Pfp = async () => {
      const basefile = await convertToBase64(file);
      setImage(basefile);
      setValue("roomPfp", basefile);
    };

    base64Pfp();
  };

  // form submit
  const onSubmit = async (data, e) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/rooms/editRoom`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId: room.roomId,
            roomPfp: data.roomPfp,
            roomName: data.roomName,
            roomDescription: data.roomDescription,
            senderUsername: user.username,
          }),
        }
      );

      const result = await response.json();

      if (response.status === 200 && result.success) {
        dispatch(clearCurrentRoom({}));
        setCheckEdit(false);
        setRoom({});
        navigate(`/about/${result.roomId}`);
      } else {
        setError("myForm", { type: "string", message: result.err });
      }
    } catch (error) {
      setError("myForm", { type: "string", message: error.message });
    }
  };

  // useEfferct to fetch room details
  useEffect(() => {
    if (!room.roomId) {
      fetchRoomDetails();
    }
  }, [roomId, room]);

  // fetch room details like description
  const fetchRoomDetails = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/rooms/roomDetails`,
        {
          method: "GET",
          headers: { roomid: roomId },
        }
      );

      const result = await response.json();

      if (response.status === 200 && result.success) {
        setRoom({
          roomId: result.roomDetails.roomId,
          roomName: result.roomDetails.roomName,
          roomPfp: result.roomDetails.roomPfp,
          roomDescription: result.roomDetails.roomDescription,
          roomOwner: result.roomDetails.roomOwner,
          roomMembers: result.roomDetails.roomMembers,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // handle join room
  const handleJoin = async (room) => {
    if (joining) {
      return;
    }
    setJoining(true);

    socket.emit("joinRoom", {
      roomId: roomId,
      username: user.username,
    });

    dispatch(
      setCurrentRoom({
        currentRoomId: room.roomId,
        currentRoomName: room.roomName,
        currentRoomPfp: room.roomPfp,
      })
    );
    navigate("/about/" + roomId, { replace: true });
    await fetchRoomDetails();
    setJoining(false);
  };

  // leave room
  const handleLeaveRoom = async () => {
    if (leaving) {
      return;
    }
    setLeaving(true);

    socket.emit("leaveRoom", {
      roomId: roomId,
      username: user.username,
    });

    dispatch(clearCurrentRoom({}));
    navigate("/about/" + roomId, { replace: true });
    await fetchRoomDetails();
    setLeaving(false);
  };

  // handle open chat
  const handleOpenChat = (room) => {
    dispatch(
      setCurrentRoom({
        currentRoomId: room.roomId,
        currentRoomName: room.roomName,
        currentRoomPfp: room.roomPfp,
      })
    );
    navigate("/chat/" + room.roomId);
  };

  // check if user joined the room
  const checkJoined = (room) => {
    const found = user.roomsJoined.find((item) => item.roomId === room.roomId);
    return found;
  };

  // delete room
  const handleDeleteRoom = async (room) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/rooms/deleteRoom`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId: room.roomId,
            username: user.username,
          }),
        }
      );
      const result = await response.json();

      if (response.status === 200 && result.success) {
        dispatch(clearCurrentRoom());
        navigate("/rooms");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // handle change edit state
  const handleChangeEditState = (isEditing) => {
    setValue("roomDescription", room.roomDescription);
    setValue("roomName", room.roomName);
    setImage(room.roomPfp);

    if (isEditing == "true") {
      setCheckEdit(true);
    } else {
      clearErrors();
      setCheckEdit(false);
    }
  };

  return (
    <div className="aboutRoom">
      <div className="topArea">
        <button className="backBtn" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <span>Room Description</span>
      </div>
      {!checkEdit && (
        <div className="container">
          <div className="room">
            <div className="roomDetail">
              <img src={room.roomPfp} className="roomProfilePicture"></img>
              <div className="roomNameWrapper">
                <div className="roomName">
                  <span>{room.roomName}</span>
                  <div className="membersWrapper">
                    <FontAwesomeIcon icon={faUsers} />
                    <span className="roomMembers">
                      {room.roomMembers?.length}
                    </span>
                  </div>
                </div>
                <div className="roomOwner">
                  <FontAwesomeIcon icon={faCrown} />
                  <span>@{room.roomOwner}</span>
                </div>
                <div className="buttonWrapper">
                  {checkJoined(room) ? (
                    <>
                      {room.roomOwner !== user.username && (
                        <button
                          className="btn"
                          onClick={() => handleLeaveRoom()}
                          disabled={leaving}
                        >
                          {leaving ? "Leaving..." : "Leave Room"}
                        </button>
                      )}

                      <button
                        className="btn"
                        onClick={() => handleOpenChat(room)}
                      >
                        Open Chat
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn"
                      onClick={() => handleJoin(room)}
                      disabled={joining}
                    >
                      {joining ? "Joining..." : "Join"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="roomDescription">{room.roomDescription}</div>
          {room.roomOwner === user.username && checkJoined(room) && (
            <div className="ownerSettings">
              <div className="buttonWrapper">
                <button
                  className="btn"
                  onClick={() => handleChangeEditState("true")}
                >
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {checkEdit && (
        <div className="formContainer">
          <form className="myForm" onSubmit={handleSubmit(onSubmit)}>
            <div className="room">
              <div className="roomDetail">
                <div className="pfpWrapper">
                  <input
                    type="file"
                    accept="image/*"
                    className="roomProfilePicture"
                    onChange={(e) => handleUploadImage(e)}
                    style={
                      image
                        ? { backgroundImage: `url(${image})` }
                        : {
                            backgroundImage: `url("/assets/defaultPfp.png")`,
                          }
                    }
                  />
                </div>

                <div className="roomName">
                  <label>Room Name</label>
                  <input
                    type="text"
                    spellCheck="false"
                    placeholder="Enter Room Name..."
                    {...register("roomName", {
                      required: {
                        value: true,
                        message: "Room Name is required.",
                      },
                      minLength: {
                        value: 3,
                        message: "Minimum 3 characters required.",
                      },
                      maxLength: {
                        value: 25,
                        message: "Maximum 25 characters allowed.",
                      },
                    })}
                  />
                  {errors.roomName && (
                    <span className="errorMsg">{errors.roomName.message}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="roomDescription">
              <label>Room Description</label>
              <textarea
                type="text"
                spellCheck="false"
                placeholder="Enter Room Description"
                {...register("roomDescription", {
                  maxLength: {
                    value: 200,
                    message: "Maximum 200 characters allowed.",
                  },
                })}
              />
              {errors.roomDescription && (
                <span className="errorMsg">
                  {errors.roomDescription.message}
                </span>
              )}
            </div>

            <div className="ownerSettings">
              <div className="buttonWrapper">
                <button
                  type="submit"
                  className="btn"
                  {...register("myForm")}
                  disabled={isSubmitting}
                >
                  Save Changes
                </button>
                <button
                  className="btn red"
                  onClick={() => handleDeleteRoom(room)}
                  disabled={isSubmitting}
                >
                  Delete Room
                </button>
                <button
                  className="btn"
                  onClick={() => handleChangeEditState("false")}
                >
                  Cancel
                </button>
              </div>
            </div>
            {errors.myForm && (
              <span className="errorMsg">{errors.myForm.message}</span>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
export default AboutRoom;
