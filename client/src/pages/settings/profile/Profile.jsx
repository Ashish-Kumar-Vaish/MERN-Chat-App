import React, { useState } from "react";
import "./Profile.css";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { setUser } from "../../../redux/userSlice.js";
import { socket } from "../../../socketIO/socket.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { editUser } from "../../../api/userApi.js";

const Profile = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
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
  const [isHidden, setIsHidden] = useState(true);

  // Function to censor email
  const censorEmail = (email) => {
    const firstPart = email.slice(0, 2);
    const lastPart = email.slice(-4);
    const middlePart = email.slice(2, email.length - 4);

    return firstPart + "*".repeat(middlePart.length) + lastPart;
  };

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

    (async () => {
      const basefile = await convertToBase64(file);
      setImage(basefile);
      setValue("pfp", basefile);
    })();
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
      const result = await editUser({
        name: data.name,
        username: data.username,
        pfp: data.pfp,
      });

      if (result.success) {
        dispatch(
          setUser({
            name: result.user.name,
            username: result.user.username,
            email: user.email,
            pfp: result.user.pfp,
          })
        );

        setCheckEdit(false);

        socket.emit("updatePfp", {
          username: result.user.username,
          newPfpUrl: result.user.pfp,
        });

        navigate("/settings/profile", { replace: true });
      } else {
        setError("myForm", { type: "string", message: result.err });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="profile">
      {!checkEdit && (
        <>
          <div className="pfpAndUser">
            <div className="pfpAndEdit">
              <img src={user.pfp} className="pfp" />
            </div>
            <div className="nameContainer">
              <span className="name">{user.name}</span>
              <span className="username">{"@" + user.username}</span>
              <span className="email">
                {isHidden ? censorEmail(user.email) : user.email}

                <button onClick={() => setIsHidden(!isHidden)}>
                  {isHidden ? (
                    <FontAwesomeIcon icon={faEyeSlash} />
                  ) : (
                    <FontAwesomeIcon icon={faEye} />
                  )}
                </button>
              </span>
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
                      message: "Minimum 3 characters are required.",
                    },
                    maxLength: {
                      value: 20,
                      message: "Maximum 20 characters are allowed.",
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
                      message: "Minimum 3 characters are required.",
                    },
                    maxLength: {
                      value: 20,
                      message: "Maximum 20 characters are allowed.",
                    },
                    validate: (value) => {
                      if (!/^\S*$/.test(value)) {
                        return "Username cannot contain whitespace";
                      }
                      if (!/^[a-z0-9_]+$/.test(value)) {
                        return "Only lowercase letters, numbers, and underscores are allowed";
                      }
                    },
                  })}
                />
              </div>
              {errors.username && (
                <span className="errorMsg">{errors.username.message}</span>
              )}

              <span className="email">
                {isHidden ? censorEmail(user.email) : user.email}

                <button type="button" onClick={() => setIsHidden(!isHidden)}>
                  {isHidden ? (
                    <FontAwesomeIcon icon={faEyeSlash} />
                  ) : (
                    <FontAwesomeIcon icon={faEye} />
                  )}
                </button>
              </span>
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
              type="button"
              onClick={() => handleChangeEditState("false")}
            >
              Cancel
            </button>
          </div>
          {errors.myForm && (
            <span className="errorMsg">{errors.myForm.message}</span>
          )}
        </form>
      )}
    </div>
  );
};

export default Profile;
