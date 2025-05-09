import React from "react";
import "./signup.css";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { signupUser } from "../../api/authApi";

const Signup = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  // signup user
  const onSubmit = async (data, e) => {
    try {
      const result = await signupUser({
        email: data.email.trim(),
        username: data.username.trim(),
        password: data.password.trim(),
      });

      if (result.success) {
        navigate("/login");
      } else {
        setError("myForm", { type: "string", message: result.error });
      }
    } catch (error) {
      setError("myForm", { type: "string", message: error.message });
    }
  };

  return (
    <div className="signup">
      <div className="container">
        <h1>Sign Up</h1>
        <form className="myForm" onSubmit={handleSubmit(onSubmit)}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            {...register("email", {
              required: { value: true, message: "Email is required." },
              pattern: {
                value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && <p className="err">{errors.email.message}</p>}

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
            {...register("myForm")}
            disabled={isSubmitting}
          >
            Submit
          </button>
          {errors.myForm && <p className="err">{errors.myForm.message}</p>}
        </form>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
