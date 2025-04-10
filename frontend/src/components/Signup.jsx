import { Link, useNavigate } from "react-router-dom";
import image from "../assets/nextStep-removebg-preview.png";
import { useState } from "react";
import Sign from "../assets/signup.jpg";

import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SignUpRoutes } from "../../APIRoutes";
const Signup = () => {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmpassword: "",
  });

  const SubmitHandler = async (e) =>  {
    e.preventDefault();
    if(Validation()){
      // console.log(values)
      const {username , email, password} = values
      const {data} = await axios.post(SignUpRoutes,
       { username,email,password}
      )

      if(data.success == false){
        toast.error(data.message);
      }else{
        toast.success("Please verify OTP sent on your email")
        localStorage.setItem("userId",data.userId)
        navigate('/verifyOtp')
      }
    }
    

  }

  function Validation(){
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const{username , email, password, confirmpassword} = values
    if(username.length < 5){
      toast.error("Username must include at least 6 character")
      return false
    }else if (!email || !emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }else if(password !== confirmpassword){
      toast.error("Password and confirm password must be same")
      return false
    }
    return true;
  }

  function ChangeHandler(e) {
    setValues({
      ...values,
      [e.target.name]: e.target.value,
    });
  }

  return (
    <div className="flex flex-col lg:flex-row max-w-4xl mx-auto my-10 border rounded-lg shadow-lg overflow-hidden">
      {/* Left Image Section */}
      <div className="hidden lg:block lg:w-1/2">
        <img
          src={Sign}
          alt="Signup Illustration"
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
            Create Account
          </h1>
        </div>

        {/* Form */}
        <form
          onSubmit={SubmitHandler}
          className="w-full space-y-4"
        >
          {/* Name Input */}
          <input
            type="text"
            placeholder="Enter  username"
            name="username"
            onChange={(e) => ChangeHandler(e)}
            className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 focus:ring focus:ring-teal-200 focus:outline-none"
          />

          {/* Email Input */}
          <input
            type="email"
            placeholder="Enter your email"
            name="email"
            onChange={(e) => ChangeHandler(e)}
            className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 focus:ring focus:ring-teal-200 focus:outline-none"
          />

          {/* Password Input */}
          <input
            type="password"
            placeholder="Enter your password"
            name="password"
            onChange={(e) => ChangeHandler(e)}
            className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 focus:ring focus:ring-teal-200 focus:outline-none"
          />

          {/* Confirm Password Input */}
          <input
            type="password"
            placeholder="Confirm your password"
            name="confirmpassword"
            onChange={(e) => ChangeHandler(e)}
            className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 focus:ring focus:ring-teal-200 focus:outline-none"
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-amber-400 text-white py-3 rounded-lg font-semibold hover:bg-amber-500 transition-all duration-200"
          >
            Sign Up
          </button>
        </form>

        {/* Redirect to Login */}
        <p className="mt-4 text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-500 font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default Signup;
