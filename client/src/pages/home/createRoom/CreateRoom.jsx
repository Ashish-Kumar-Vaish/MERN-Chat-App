import React, { useState } from "react";
import "./CreateRoom.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentRoom } from "../../../redux/roomSlice.js";
import { createRoom } from "../../../api/roomApi";

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

  // convert file to base64
  const convertToBase64 = (pfp) => {
    return new Promise((resolve, reject) => {
      if (!pfp) return resolve(null);

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
  const onSubmit = async (data, e) => {
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
        navigate("/about/" + result.roomId);
      } else {
        setError("myForm", { type: "string", message: result.error });
      }
    } catch (error) {
      setError("myForm", { type: "string", message: error.message });
    }
  };

  return (
    <div className="createRoom">
      <div className="topArea">
        <button className="backBtn" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <span>Create Room</span>
      </div>
      <div className="container">
        <form
          className="myForm"
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="room">
            <div className="roomDetail">
              <input
                type="file"
                accept="image/*"
                className="roomProfilePicture"
                onChange={(e) => handleUploadImage(e)}
                style={
                  image
                    ? { backgroundImage: `url(${image})` }
                    : {
                        backgroundImage: `url("/assets/arrow-up-from-bracket-solid.png")`,
                        backgroundColor: "rgb(255, 255, 255)",
                        backgroundSize: "60%",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        filter: "invert(70%) sepia(30%) hue-rotate(180deg)",
                      }
                }
              />

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
                      message: "Minimum 3 characters are required.",
                    },
                    maxLength: {
                      value: 25,
                      message: "Maximum 25 characters are allowed.",
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
                  value: 400,
                  message: "Maximum 400 characters are allowed.",
                },
              })}
            />
            {errors.roomDescription && (
              <span className="errorMsg">{errors.roomDescription.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn"
            {...register("myform")}
            disabled={isSubmitting}
          >
            Create Room
          </button>
          {errors.myForm && (
            <span className="errorMsg">{errors.myForm.message}</span>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateRoom;
