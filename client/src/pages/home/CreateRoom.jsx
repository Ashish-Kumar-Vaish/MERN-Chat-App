import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faCloudUpload,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentRoom } from "../../redux/roomSlice.js";
import { setRoomsJoined } from "../../redux/userSlice.js";
import { createRoom } from "../../api/roomApi";
import Button from "../../components/ui/Button.jsx";

const CreateRoom = () => {
  const [image, setImage] = useState("");
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();
  const textareaRef = useRef(null);

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

  // submit create room form
  const onSubmit = async (data) => {
    try {
      const result = await createRoom({
        roomName: data.roomName,
        roomPfp: data.roomPfp,
        roomDescription: data.roomDescription,
        senderUsername: user.username,
      });

      if (result.success) {
        dispatch(
          setCurrentRoom({
            currentRoomId: result.roomId,
            currentRoomName: result.roomName,
            currentRoomPfp: result.roomPfp,
          })
        );

        dispatch(
          setRoomsJoined([...user.roomsJoined, { roomId: result.roomId }])
        );

        navigate("/about/" + result.roomId);
      } else {
        setError("myForm", { type: "string", message: result.error });
      }
    } catch (error) {
      setError("myForm", { type: "string", message: error.message });
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
    <div className="flex flex-col w-full bg-[var(--app-bg)]">
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
          Create Room
        </span>
      </div>

      <div className="overflow-auto">
        <form
          className="overflow-auto flex flex-col items-center"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex justify-between items-center w-4/5 mx-4">
            <div className="flex items-center">
              <div className="relative">
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
                  {image ? (
                    <>
                      <img
                        src={image}
                        alt="Room profile"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-[var(--sidebar-panel-bg)]">
                      <FontAwesomeIcon
                        icon={faCloudUpload}
                        className="text-[var(--secondary-text)] text-3xl md:text-4xl lg:text-5xl"
                      />
                    </div>
                  )}
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

          <Button type="submit" {...register("myForm")} disabled={isSubmitting}>
            Create Room
          </Button>

          {errors.myForm && (
            <div className="text-[var(--error-message)] font-medium mt-4">
              <FontAwesomeIcon icon={faCircleInfo} className="mr-2" />
              <span>{errors.myForm.message}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateRoom;
