import React, { useState } from "react";
import "./Profile.css";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { setUser } from "../../../redux/userSlice.js";
import { socket } from "../../../socketIO/socket.js";

const Profile = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [checkEdit, setCheckEdit] = useState(false);
  const [image, setImage] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

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
      setValue("pfp", basefile);
    };

    base64Pfp();
  };

  // handle change edit state
  const handleChangeEditState = (tf) => {
    setValue("name", user.name);
    setValue("username", user.username);
    setImage(user.pfp);

    if (tf == "true") {
      setCheckEdit(true);
    } else {
      clearErrors();
      setCheckEdit(false);
    }
  };

  // handle edit user
  const onSubmit = async (data, e) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/editUser`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            username: data.username,
            pfp: data.pfp,
            senderUsername: user.username,
          }),
        }
      );

      const result = await response.json();

      if (response.status === 200 && result.success) {
        dispatch(
          setUser({
            name: result.user.name,
            username: result.user.username,
            pfp: result.user.pfp,
          })
        );
        setCheckEdit(false);
        socket.emit("updatePfp", {
          username: result.user.username,
          newPfpUrl: result.user.pfp,
        });
        navigate("/settings/profile");
      } else {
        setError("myForm", { type: "string", message: result.err });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="profile">
      {!checkEdit && (
        <>
          <div className="pfpAndUser">
            <img src={user.pfp} className="pfp" />
            <div className="nameContainer">
              <span className="name">{user.name}</span>
              <span className="username">{"@" + user.username}</span>
            </div>
          </div>
          <div className="buttonWrapper">
            <button
              className="btn"
              onClick={() => handleChangeEditState("true")}
            >
              Edit
            </button>
          </div>
        </>
      )}
      {checkEdit && (
        <>
          <form className="myForm" onSubmit={handleSubmit(onSubmit)}>
            <div className="pfpAndUser">
              <div className="pfpWrapper">
                <input
                  type="file"
                  accept="image/*"
                  className="pfp"
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
              <div className="nameContainer">
                <div className="formName">
                  <input
                    type="text"
                    spellCheck="false"
                    placeholder="Enter Name..."
                    {...register("name", {
                      required: {
                        value: true,
                        message: "Name is required.",
                      },
                      minLength: {
                        value: 3,
                        message: "Minimum 3 characters required.",
                      },
                      maxLength: {
                        value: 20,
                        message: "Maximum 20 characters allowed.",
                      },
                    })}
                  />
                </div>
                {errors.name && (
                  <span className="errorMsg">{errors.name.message}</span>
                )}
                <div className="formUsername">
                  <span>@</span>
                  <input
                    type="text"
                    spellCheck="false"
                    placeholder="Enter Username..."
                    {...register("username", {
                      required: {
                        value: true,
                        message: "Username is required.",
                      },
                      minLength: {
                        value: 3,
                        message: "Minimum 3 characters required.",
                      },
                      maxLength: {
                        value: 20,
                        message: "Maximum 20 characters allowed.",
                      },
                    })}
                  />
                </div>
                {errors.username && (
                  <span className="errorMsg">{errors.username.message}</span>
                )}
              </div>
            </div>

            <div className="buttonWrapper">
              <button
                className="btn"
                type="submit"
                {...register("myForm")}
                disabled={isSubmitting}
              >
                Save Changes
              </button>
              <button
                className="btn red"
                onClick={() => handleChangeEditState("false")}
              >
                Cancel
              </button>
            </div>
            {errors.myForm && (
              <span className="errorMsg">{errors.myForm.message}</span>
            )}
          </form>
        </>
      )}
    </div>
  );
};

export default Profile;
