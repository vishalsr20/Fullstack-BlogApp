import { Link, useNavigate } from "react-router-dom";
import image from "../assets/nextStep-removebg-preview.png";
import { useState } from "react";
import Log from "../assets/login.jpg";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { LoginRoutes } from "../../APIRoutes";

const Login = () => {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const SubmitHandler = async (e) => {
    e.preventDefault();
    const { email, password } = values;

    if (Validation()) {
      try {
        const { data } = await axios.post(LoginRoutes, {
          email,
          password,
        });

        if (!data.success) {
          toast.error(data.message || "Invalid credentials");
        } else {
          localStorage.setItem("authToken", data.token);

          // Usually, you should not manually set HttpOnly cookies from the frontend
          // document.cookie line is not needed unless you're doing something specific
          // If needed, backend should handle `Set-Cookie` header with HttpOnly

          navigate("/profile");
        }
      } catch (error) {
        // console.error("Login Error:", error);

        if (error.response) {
          toast.error(error.response.data.message || "Login failed");
        } else {
          toast.error("Network error. Please try again.");
        }
      }
    }
  };

  const Validation = () => {
    const { email, password } = values;
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      toast.error("Please provide a valid email");
      return false;
    } else if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const ChangeHandler = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex mt-20 flex-col shadow-md shadow-teal-200 mx-auto lg:flex-row justify-center items-center max-w-4xl  border rounded-lg overflow-hidden">
      {/* Left Image Section */}
      <div className="hidden lg:block lg:w-1/2">
        <img
          src={Log}
          alt="Login Page Illustration"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 bg-gray-100 p-8 flex flex-col justify-center items-center">
        {/* Header */}
        <div className="flex items-center mb-6">
          <img
            src={image}
            alt="Logo"
            width={50}
            className="rounded-lg object-contain mr-3"
          />
          <h1 className="text-3xl font-bold text-gray-700 hover:text-teal-500 transition-all duration-200 cursor-pointer">
            Login
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={SubmitHandler} className="w-full space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            name="email"
            value={values.email}
            onChange={ChangeHandler}
            className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 focus:ring focus:ring-teal-200 focus:outline-none"
          />

          <input
            type="password"
            placeholder="Enter your password"
            name="password"
            value={values.password}
            onChange={ChangeHandler}
            className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 focus:ring focus:ring-teal-200 focus:outline-none"
          />

          <button
            type="submit"
            className="w-full bg-amber-400 text-white py-3 rounded-lg font-semibold hover:bg-amber-500 transition-all duration-200"
          >
            Sign In
          </button>
        </form>

        <div className="w-full border-t my-4 border-gray-300"></div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-500 font-semibold hover:underline"
            >
              Create Account
            </Link>
          </p>

          <Link to="/forgotpassword">
            <button className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-200">
              Forgotten Password
            </button>
          </Link>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Login;
