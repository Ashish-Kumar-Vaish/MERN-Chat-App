import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { setUser } from "../../redux/userSlice.js";
import { socket } from "../../socketIO/socket.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { editUser } from "../../api/userApi.js";
import Button from "../../components/ui/Button.jsx";

const Profile = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [checkEdit, setCheckEdit] = useState(false);
  const [image, setImage] = useState("");
  const [isHidden, setIsHidden] = useState(true);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  // Censor email function
  const censorEmail = (email) => {
    const first = email.slice(0, 2);
    const last = email.slice(-4);
    return first + "*".repeat(email.length - 6) + last;
  };

  // File to base64
  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  // Upload image handler
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

  // Change edit state handler
  const handleChangeEditState = (val) => {
    setValue("name", user.name);
    setValue("username", user.username);

    if (val === "true") {
      setImage(user.pfp);
      setCheckEdit(true);
    } else {
      clearErrors();
      setCheckEdit(false);
      setImage("");
    }
  };

  // On submit handler
  const onSubmit = async (data) => {
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
        setError("myForm", { type: "string", message: result.error });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col">
      <span className="text-lg md:text-xl lg:text-2xl font-semibold mb-8">
        Profile
      </span>

      {!checkEdit && (
        <>
          <div className="flex">
            <img
              src={user.pfp}
              alt="profile"
              className="h-32 w-32 sm:h-40 sm:w-40 rounded-full object-cover border-2 border-[var(--pfp-border)]"
            />
            <div className="flex flex-col ml-8 gap-2">
              <span className="bg-[var(--sidebar-panel-bg)] rounded-lg p-2 text-lg">
                {user.name}
              </span>
              <span className="bg-[var(--sidebar-panel-bg)] rounded-lg p-2 text-lg">
                @{user.username}
              </span>
              <span className="bg-[var(--sidebar-panel-bg)] text-[var(--dimmed-text)] rounded-lg p-2 text-lg flex items-center">
                {isHidden ? censorEmail(user.email) : user.email}
                <button
                  type="button"
                  className="ml-2 cursor-pointer"
                  onClick={() => setIsHidden(!isHidden)}
                >
                  {isHidden ? (
                    <FontAwesomeIcon icon={faEyeSlash} />
                  ) : (
                    <FontAwesomeIcon icon={faEye} />
                  )}
                </button>
              </span>
            </div>
          </div>

          <div className="flex mt-8">
            <Button onClick={() => handleChangeEditState("true")}>Edit</Button>
          </div>
        </>
      )}

      {checkEdit && (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="flex">
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
                id="fileUpload"
                onChange={handleUploadImage}
                className="absolute w-px h-px overflow-hidden"
              />

              <label
                htmlFor="fileUpload"
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 border-[var(--pfp-border)] 
                         cursor-pointer transition-all duration-200 hover:border-gray-400 
                         relative overflow-hidden bg-gray-100 flex items-center justify-center"
              >
                <img
                  src={image ? image : "/assets/defaultPfp.png"}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              </label>
            </div>

            <div className="flex flex-col ml-8 gap-2">
              <div className="bg-[var(--sidebar-panel-bg)] rounded-lg p-2 text-lg">
                <input
                  type="text"
                  placeholder="Enter Name..."
                  className="w-full outline-none"
                  {...register("name", {
                    required: "Name is required.",
                    minLength: { value: 3, message: "Min 3 characters" },
                    maxLength: { value: 20, message: "Max 20 characters" },
                  })}
                />
              </div>
              {errors.name && (
                <span className="text-[var(--error-message)] text-sm font-medium">
                  {errors.name.message}
                </span>
              )}

              <div className="flex items-center bg-[var(--sidebar-panel-bg)] rounded-lg p-2 text-lg">
                <span className="text-[var(--dimmed-text)]">@</span>
                <input
                  type="text"
                  placeholder="Enter Username..."
                  className="w-full outline-none"
                  {...register("username", {
                    required: "Username is required.",
                    minLength: { value: 3, message: "Min 3 characters" },
                    maxLength: { value: 20, message: "Max 20 characters" },
                    validate: (val) => {
                      if (!/^\S*$/.test(val)) return "No whitespace allowed";
                      if (!/^[a-z0-9_]+$/.test(val))
                        return "Only lowercase, numbers, underscore";
                    },
                  })}
                />
              </div>
              {errors.username && (
                <span className="text-[var(--error-message)] text-sm font-medium">
                  {errors.username.message}
                </span>
              )}

              <div className="flex items-center bg-[var(--sidebar-panel-bg)] rounded-lg p-2 text-lg text-[var(--dimmed-text)]">
                <span>{isHidden ? censorEmail(user.email) : user.email}</span>
                <button
                  type="button"
                  onClick={() => setIsHidden(!isHidden)}
                  className="ml-2"
                >
                  {isHidden ? (
                    <FontAwesomeIcon icon={faEyeSlash} />
                  ) : (
                    <FontAwesomeIcon icon={faEye} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex mt-8 gap-x-2">
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              Save Changes
            </Button>
            <Button
              variant="danger"
              onClick={() => handleChangeEditState("false")}
            >
              Cancel
            </Button>
          </div>

          {errors.myForm && (
            <span className="text-[var(--error-message)] text-base font-medium mt-4">
              {errors.myForm.message}
            </span>
          )}
        </form>
      )}
    </div>
  );
};

export default Profile;
