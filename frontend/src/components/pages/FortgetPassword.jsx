import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import Logo from "../../assets/techthinker.webp";
import image from "../../assets/forgotpassword.png";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../../../APIRoutes';
import 'react-toastify/dist/ReactToastify.css';

 const ForgotPassword = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "" });

  const SubmitHandler = async (e) => {
    e.preventDefault();
    const email = values.email;
    try {
      const { data } = await axios.post(forgotPassword, { email });
      if (data.success === true) {
        console.log("API response:", data);
        toast.success("OTP SENT. Check your email.");
        localStorage.setItem("authUserId", data.user._id);
        localStorage.setItem("resetEmail", email); 
      console.log("Saved userId:", localStorage.getItem("authUserId")); 
        navigate("/verifyotpforgotpassword");
      } else {
        toast.error(data.message || "User not registered.");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error(error.response.data.message || "User not registered.");
      } else {
        toast.error("Something went wrong.");
      }
    }
  };

  const ChangeHandler = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="flex mt-28 flex-col shadow-md shadow-teal-200 mx-auto lg:flex-row justify-center items-center max-w-4xl  border rounded-lg overflow-hidden">
      <div className="hidden lg:block lg:w-1/2">
        <img src={image} alt="Forgot Password Illustration" className="w-full h-full object-cover" />
      </div>

      <div className="w-full lg:w-1/2 bg-gray-100 p-8 flex flex-col justify-center items-center">
        <div className="flex items-center mb-6">
          <img src={Logo} alt="Logo" width={50} className="rounded-lg object-contain mr-3" />
          <h1 className="text-3xl font-bold text-gray-700 hover:text-teal-500 transition-all duration-200 cursor-pointer">
            Forgot Password
          </h1>
        </div>

        <form onSubmit={SubmitHandler} className="w-full space-y-4">
          <input
            type="email"
            placeholder="Enter your registered email"
            name="email"
            required
            onChange={ChangeHandler}
            className="w-full p-3 bg-white font-serif border text-black border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-teal-200 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full bg-amber-400 text-white py-3 rounded-lg font-semibold hover:bg-amber-500 transition-all duration-200"
          >
            Get OTP
          </button>
        </form>

        <div className="w-full border-t my-4 border-gray-300"></div>
      </div>

      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false}  />
    </div>
  );
};
export default ForgotPassword
