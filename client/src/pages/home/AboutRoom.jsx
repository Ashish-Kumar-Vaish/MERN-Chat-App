import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faCircleExclamation,
  faCrown,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router";
import { useParams } from "react-router-dom";
import { socket } from "../../socketIO/socket.js";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentRoom, clearCurrentRoom } from "../../redux/roomSlice.js";
import { setRoomsJoined } from "../../redux/userSlice.js";
import { useForm } from "react-hook-form";
import { getRoomDetails, editRoom, deleteRoom } from "../../api/roomApi";
import Button from "../../components/ui/Button.jsx";

const AboutRoom = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
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
  const textareaRef = useRef(null);
  const [isJoined, setIsJoined] = useState(false);

  // convert file to base64
  const convertToBase64 = (pfp) => {
    return new Promise((resolve, reject) => {
      if (!pfp) {
        return resolve(null);
      }

      const reader = new FileReader();
      reader.readAsDataURL(pfp);
      reader.onload = () => resolve(reader.result);
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

  // form submit to edit room
  const onSubmit = async (data, e) => {
    try {
      const result = await editRoom({
        roomName: data.roomName,
        roomId: room.roomId,
        roomPfp: data.roomPfp,
        roomDescription: data.roomDescription,
      });

      if (result.success) {
        dispatch(clearCurrentRoom());
        setCheckEdit(false);
        setRoom({});
        navigate(`/about/${result.roomId}`);
      } else {
        setError("myForm", { type: "string", message: result.error });
      }
    } catch (error) {
      setError("myForm", { type: "string", message: error.message });
    }
  };

  // useEfferct to fetch room details
  useEffect(() => {
    fetchRoomDetails();
  }, [roomId]);

  // fetch room details like description
  const fetchRoomDetails = async () => {
    try {
      const result = await getRoomDetails(roomId);

      if (result.success) {
        setRoom({
          roomId: result.roomDetails.roomId,
          roomName: result.roomDetails.roomName,
          roomPfp: result.roomDetails.roomPfp,
          roomDescription: result.roomDetails.roomDescription,
          roomOwner: result.roomDetails.roomOwner,
          roomMembers: result.roomDetails.roomMembers,
        });

        setIsJoined(
          user.roomsJoined?.some((r) => r.roomId === result.roomDetails.roomId)
        );
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // handle join room
  const handleJoin = async () => {
    if (joining) {
      return;
    }
    setJoining(true);

    try {
      dispatch(setRoomsJoined([...user.roomsJoined, { roomId: roomId }]));
      dispatch(
        setCurrentRoom({
          currentRoomId: room.roomId,
          currentRoomName: room.roomName,
          currentRoomPfp: room.roomPfp,
        })
      );

      socket.emit("joinRoom", {
        roomId: roomId,
        username: user.username,
      });

      setIsJoined(true);
    } catch (error) {
      console.error("Error joining room:", error);
      setIsJoined(false);
    } finally {
      setJoining(false);
    }
  };

  // leave room
  const handleLeaveRoom = async () => {
    if (leaving) {
      return;
    }
    setLeaving(true);

    try {
      dispatch(
        setRoomsJoined(user.roomsJoined.filter((r) => r.roomId !== roomId))
      );
      dispatch(clearCurrentRoom());

      socket.emit("leaveRoom", {
        roomId: roomId,
        username: user.username,
      });

      setIsJoined(false);
    } catch (error) {
      console.error("Error leaving room:", error);
      setIsJoined(true);
    } finally {
      setLeaving(false);
    }
  };

  // handle open chat
  const handleOpenChat = () => {
    dispatch(
      setCurrentRoom({
        currentRoomId: room.roomId,
        currentRoomName: room.roomName,
        currentRoomPfp: room.roomPfp,
      })
    );
    navigate("/chat/" + room.roomId);
  };

  // delete room
  const handleDeleteRoom = async () => {
    try {
      const result = await deleteRoom(room.roomId);

      if (result.success) {
        dispatch(clearCurrentRoom());
        navigate("/rooms");
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // handle change edit state
  const handleChangeEditState = (isEditing) => {
    setValue("roomDescription", room.roomDescription);
    setValue("roomName", room.roomName);

    if (isEditing) {
      setImage(room.roomPfp);
      setCheckEdit(true);
    } else {
      clearErrors();
      setCheckEdit(false);
      setImage("");
    }
  };

  // auto resize textarea
  const autoResize = (el) => {
    if (!el) {
      return;
    }

    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  return (
    <div className="w-full flex flex-col bg-[var(--app-bg)]">
      <div className="flex items-center h-20 mb-4">
        <button
          className="cursor-pointer border-none text-[var(--secondary-text)] rounded-full mx-2 hover:text-[var(--send-button-hover)]"
          onClick={() => navigate(-1)}
        >
          <FontAwesomeIcon
            icon={faChevronLeft}
            className="w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10"
          />
        </button>
        <span className="text-[var(--secondary-text)] text-lg md:text-xl lg:text-2xl font-semibold">
          Room Description
        </span>
      </div>

      {!checkEdit && (
        <div className="flex flex-col items-center overflow-y-scroll">
          <div className="flex justify-between items-center w-4/5 mx-4">
            <div className="flex items-center">
              <img
                src={room.roomPfp}
                className="h-15 w-15 md:h-20 md:w-20 lg:h-24 lg:w-24 xl:h-32 xl:w-32 rounded-full object-cover border-2 border-[var(--pfp-border)]"
                alt="Room Profile"
              />

              <div className="ml-4 md:ml-6 lg:ml-8 flex flex-col justify-center">
                <div className="flex">
                  <span
                    className="text-2xl md:text-3xl font-semibold block overflow-hidden 
                  whitespace-nowrap overflow-ellipsis max-h-10 md:max-h-12 lg:max-h-16 text-[var(--secondary-text)]"
                  >
                    {room.roomName}
                  </span>

                  <div className="flex items-center justify-center relative">
                    <FontAwesomeIcon
                      icon={faUsers}
                      className="ml-2 mr-2 md:ml-3 lg:ml-4 text-[var(--accent-blue-soft)] w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5"
                    />
                    <span className="text-base md:text-lg lg:text-xl truncate text-[var(--secondary-text)]">
                      {room.roomMembers?.length}
                    </span>
                  </div>
                </div>

                <div className="flex items-center mb-2 md:mb-3 lg:mb-4">
                  <FontAwesomeIcon
                    icon={faCrown}
                    className="mr-2 text-[var(--accent-gold)] w-2.5 h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4"
                  />
                  <span className="text-sm md:text-base lg:text-lg text-[var(--message-timestamp)] truncate">
                    @{room.roomOwner}
                  </span>
                </div>

                <div>
                  {isJoined ? (
                    <>
                      {room.roomOwner !== user.username && (
                        <Button
                          className="mr-2"
                          onClick={handleLeaveRoom}
                          disabled={leaving}
                        >
                          {leaving ? "Leaving..." : "Leave Room"}
                        </Button>
                      )}

                      <Button onClick={handleOpenChat}>Open Chat</Button>
                    </>
                  ) : (
                    <Button onClick={handleJoin} disabled={joining}>
                      {joining ? "Joining..." : "Join"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div
            className="w-4/5 mx-4 my-4 md:my-8 p-2 md:p-4 text-lg md:text-xl
            text-[var(--secondary-text)] bg-[var(--sidebar-panel-bg)] rounded-lg md:rounded-xl
            whitespace-pre-line break-words"
          >
            <div className="min-h-[20vh]">
              {room.roomDescription ? (
                room.roomDescription
              ) : (
                <span className="text-[var(--form-placeholder)]">
                  No description...
                </span>
              )}
            </div>
          </div>

          {room.roomOwner === user.username && isJoined && (
            <div className="flex justify-end items-center w-4/5 mx-4">
              <Button onClick={() => handleChangeEditState(true)}>Edit</Button>
            </div>
          )}
        </div>
      )}

      {checkEdit && (
        <div className="overflow-y-scroll">
          <form
            className="overflow-auto flex flex-col items-center"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex justify-between items-center w-4/5 mx-4">
              <div className="flex items-center w-full">
                <div
                  className="relative
                            after:content-[''] 
                            after:absolute 
                            after:top-0 
                            after:right-0 
                            after:h-[25%] 
                            after:w-[25%] 
                            after:bg-white 
                            after:bg-[url('/assets/pen-solid.png')] 
                            after:bg-[length:60%] 
                            after:bg-no-repeat 
                            after:bg-center 
                            after:rounded-full 
                            after:invert-[0.7]
                            after:hue-rotate-[180deg]"
                >
                  <input
                    type="file"
                    accept="image/*"
                    id="roomPfpUpload"
                    className="absolute w-px h-px overflow-hidden"
                    onChange={(e) => handleUploadImage(e)}
                  />
                  <label
                    htmlFor="roomPfpUpload"
                    className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-32 xl:h-32 
                             rounded-full border-2 border-[var(--pfp-border)] cursor-pointer 
                             transition-all hover:border-gray-400 
                             relative overflow-hidden flex items-center justify-center"
                  >
                    <img
                      src={image ? image : "/assets/defaultPfp.png"}
                      alt="Room profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </label>
                </div>

                <div className="flex flex-col justify-center ml-4 md:ml-8 text-[var(--secondary-text)]">
                  <label className="w-full text-lg md:text-xl lg:text-2xl mb-2">
                    Room Name
                  </label>
                  <input
                    type="text"
                    spellCheck="false"
                    placeholder="Enter Room Name..."
                    className="bg-[var(--sidebar-panel-bg)] rounded-lg md:rounded-xl 
                    p-2 md:p-4 h-full border-none outline-none text-lg md:text-xl 
                    placeholder:text-base md:placeholder:text-lg 
                    placeholder:text-[var(--form-placeholder)]"
                    {...register("roomName", {
                      required: {
                        value: true,
                        message: "Room Name is required.",
                      },
                      minLength: {
                        value: 3,
                        message: "Minimum 3 characters are required.",
                      },
                      maxLength: {
                        value: 25,
                        message: "Maximum 25 characters are allowed.",
                      },
                    })}
                  />
                  {errors.roomName && (
                    <span className="text-[var(--error-message)] font-medium">
                      {errors.roomName.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="w-4/5 mx-4 my-4 md:my-8 flex flex-col justify-center text-[var(--secondary-text)]">
              <label className="w-full text-lg md:text-xl lg:text-2xl mb-2">
                Room Description
              </label>
              <textarea
                type="text"
                spellCheck="false"
                placeholder="Enter Room Description..."
                className="w-full min-h-[20vh] text-lg md:text-xl resize-none 
                bg-[var(--sidebar-panel-bg)] rounded-lg md:rounded-xl p-2 md:p-4 outline-none 
                border-none placeholder:text-base md:placeholder:text-lg 
                placeholder:text-[var(--form-placeholder)]"
                {...register("roomDescription", {
                  maxLength: {
                    value: 400,
                    message: "Maximum 400 characters are allowed.",
                  },
                })}
                ref={(e) => {
                  register("roomDescription").ref(e);
                  textareaRef.current = e;
                  autoResize(e);
                }}
                onInput={(e) => autoResize(e.target)}
              />
              {errors.roomDescription && (
                <span className="text-[var(--error-message)] font-medium">
                  {errors.roomDescription.message}
                </span>
              )}
            </div>

            <div className="flex justify-end items-center w-4/5 mx-4 gap-x-2">
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                Save Changes
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteRoom}
                disabled={isSubmitting}
              >
                Delete Room
              </Button>
              <Button onClick={() => handleChangeEditState(false)}>
                Cancel
              </Button>
            </div>

            {errors.myForm && (
              <div className="text-[var(--error-message)] font-medium mt-4">
                <FontAwesomeIcon icon={faCircleExclamation} className="mr-2" />
                <span>{errors.myForm.message}</span>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default AboutRoom;
