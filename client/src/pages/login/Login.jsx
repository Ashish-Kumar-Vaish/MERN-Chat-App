import React, { useEffect } from "react";
import "./login.css";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/userSlice.js";
import { useForm } from "react-hook-form";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  // navigate to "/" if already logged in
  useEffect(() => {
    if (localStorage.auth_token) {
      fetchData();
    }
  }, []);

  // fetch user data from server
  const fetchData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        {
          method: "GET",
          headers: { token: localStorage.auth_token },
        }
      );

      const result = await response.json();

      if (response.status === 200 && result.success) {
        dispatch(
          setUser({
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
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: data.username.trim(),
            password: data.password.trim(),
          }),
        }
      );

      const result = await response.json();

      if (response.status === 200 && result.success) {
        localStorage.setItem("auth_token", result.authtoken);
        dispatch(
          setUser({
            name: result.name,
            username: result.username,
            pfp: result.pfp,
          })
        );
        navigate("/");
      } else {
        setError("myform", { type: "string", message: "Login failed" });
      }
    } catch (error) {
      setError("myform", { type: "string", message: error.message });
    }
  };

  return (
    <div className="login">
      <div className="container">
        <h1>Login</h1>
        <form className="myForm" onSubmit={handleSubmit(onSubmit)}>
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
          {errors.username && <p className="err">{errors.username.message}</p>}

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
