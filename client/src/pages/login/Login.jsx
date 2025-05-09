import React, { useState, useEffect } from "react";
import "./login.css";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/userSlice.js";
import { useForm } from "react-hook-form";
import { loginUser, getVerifiedUserDetails } from "../../api/authApi";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();
  const [loginType, setLoginType] = useState("username");

  // navigate to "/" if already logged in
  useEffect(() => {
    if (localStorage.auth_token) {
      fetchData();
    }
  }, []);

  // fetch user data from server
  const fetchData = async () => {
    try {
      const result = await getVerifiedUserDetails(localStorage.auth_token);

      if (result.success) {
        dispatch(
          setUser({
            email: result.email,
            name: result.name,
            username: result.username,
            pfp: result.pfp,
          })
        );
        navigate("/");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // login user
  const onSubmit = async (data, e) => {
    try {
      const loginData =
        loginType === "email"
          ? { email: data.email.trim(), password: data.password.trim() }
          : { username: data.username.trim(), password: data.password.trim() };

      const result = await loginUser(loginData);

      if (result.success) {
        localStorage.setItem("auth_token", result.authtoken);
        dispatch(
          setUser({
            name: result.name,
            username: result.username,
            email: result.email,
            pfp: result.pfp,
          })
        );
        navigate("/");
      } else {
        setError("myform", { type: "string", message: result.error });
      }
    } catch (error) {
      setError("myform", { type: "string", message: error.message });
    }
  };

  return (
    <div className="login">
      <div className="container">
        <h1>Login</h1>
        <button
          type="button"
          className="loginTypeBtn"
          onClick={() =>
            loginType === "email"
              ? setLoginType("username")
              : setLoginType("email")
          }
        >
          Login Using {loginType === "email" ? "username" : "email"}?
        </button>

        <form className="myForm" onSubmit={handleSubmit(onSubmit)}>
          {loginType === "email" ? (
            <>
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                {...register("email", {
                  required: { value: true, message: "Email is required." },
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && <p className="err">{errors.email.message}</p>}
            </>
          ) : (
            <>
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                {...register("username", {
                  required: { value: true, message: "Username is required." },
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
              {errors.username && (
                <p className="err">{errors.username.message}</p>
              )}
            </>
          )}

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            {...register("password", {
              required: { value: true, message: "Password is required." },
              minLength: {
                value: 8,
                message: "Minimum 8 characters are required.",
              },
            })}
          />
          {errors.password && <p className="err">{errors.password.message}</p>}

          <button
            className="btn"
            type="submit"
            {...register("myform")}
            disabled={isSubmitting}
          >
            Submit
          </button>
          {errors.myform && <p className="err">{errors.myform.message}</p>}
        </form>
        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
