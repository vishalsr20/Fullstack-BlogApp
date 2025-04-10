import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { verifyOtpPasswordRoute } from "../../../APIRoutes";



const OtpForgotPassword = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6 || isNaN(otp)) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    const userId = localStorage.getItem("authUserId");
    if (!userId) {
      toast.error("User ID not found. Please start the process again.");
      return;
    }

    try {
      // console.log("Sending payload to backend:", { userId, otp });

      const { data } = await axios.post(verifyOtpPasswordRoute, { userId, otp });

      if (data.success) {
        toast.success("OTP verified successfully!");
        localStorage.removeItem("authUserId"); // Clear it after success
        setTimeout(() => {
          navigate("/updatePassword");
        }, 1000);
      } else {
        toast.error(data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      // console.error("OTP verification error:", error);
      toast.error(
        error.response?.data?.message || "Something went wrong. Try again."
      );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Verify OTP
        </h2>
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={handleOtpChange}
            maxLength={6}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-200"
          />
          <button
            type="submit"
            className="w-full bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition duration-200"
          >
            Verify OTP
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Didn’t receive the OTP?{" "}
          <button
            onClick={() =>
              toast.info("Resend OTP feature is under development.")
            }
            className="text-teal-500 font-semibold hover:underline"
          >
            Resend OTP
          </button>
        </p>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default OtpForgotPassword;
