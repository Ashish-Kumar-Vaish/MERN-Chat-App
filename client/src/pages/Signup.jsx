import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { signupUser } from "../api/authApi";
import Button from "../components/ui/Button";

const Signup = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  // signup user
  const onSubmit = async (data) => {
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
    <div className="flex flex-col items-center w-screen h-screen bg-[var(--login-bg)]">
      <h1 className="text-3xl md:text-4xl text-[var(--primary-text)] text-center my-6 font-bold">
        Sign Up
      </h1>

      <div
        className="flex flex-col items-center justify-between w-[90%] md:w-[55%] lg:w-[35%] p-6 
      border border-[var(--dimmed-text)] rounded-lg bg-[var(--app-bg)]"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col w-[80%] gap-2"
        >
          <label className="text-[var(--primary-text)] text-sm">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="bg-[var(--sidebar-panel-bg)] text-[var(--primary-text)] border border-[var(--dimmed-text)] rounded-lg p-2"
            {...register("email", {
              required: { value: true, message: "Email is required." },
              pattern: {
                value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && (
            <span className="text-[var(--error-message)] text-sm text-center">
              {errors.email.message}
            </span>
          )}

          <label className="text-[var(--primary-text)] text-sm">Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            className="bg-[var(--sidebar-panel-bg)] text-[var(--primary-text)] border border-[var(--dimmed-text)] rounded-lg p-2"
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
                if (!/^\S*$/.test(value))
                  return "Username cannot contain whitespace";
                if (!/^[a-z0-9_]+$/.test(value))
                  return "Only lowercase letters, numbers, and underscores are allowed";
              },
            })}
          />
          {errors.username && (
            <span className="text-[var(--error-message)] text-sm text-center">
              {errors.username.message}
            </span>
          )}

          <label className="text-[var(--primary-text)] text-sm">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="bg-[var(--sidebar-panel-bg)] text-[var(--primary-text)] border border-[var(--dimmed-text)] rounded-lg p-2"
            {...register("password", {
              required: { value: true, message: "Password is required." },
              minLength: {
                value: 8,
                message: "Minimum 8 characters are required.",
              },
            })}
          />
          {errors.password && (
            <span className="text-[var(--error-message)] text-sm text-center">
              {errors.password.message}
            </span>
          )}

          <Button
            variant="primary"
            disabled={isSubmitting}
            type="submit"
            className="w-full mt-4"
            {...register("myform")}
          >
            Submit
          </Button>

          {errors.myForm && (
            <span className="text-[var(--error-message)] text-sm text-center mb-2">
              {errors.myForm.message}
            </span>
          )}
        </form>

        <span className="text-[var(--primary-text)] text-sm mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[var(--primary-button-bg)] hover:underline"
          >
            Login
          </Link>
        </span>
      </div>
    </div>
  );
};

export default Signup;
