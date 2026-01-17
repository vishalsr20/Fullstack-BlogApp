import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { VerifyOtpRoute } from "../../APIRoutes";

const Otp = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔒 Protect OTP page
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("Session expired. Please signup again.");
      navigate("/signup");
    }
  }, [navigate]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6 || isNaN(otp)) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("User not found. Please signup again.");
      navigate("/signup");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(VerifyOtpRoute, {
        userId,
        otp,
      });

      if (data.success) {
        toast.success("Email verified successfully!");
        localStorage.removeItem("userId");
        navigate("/login");
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Invalid or expired OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex mt-20 justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Verify OTP
        </h2>

        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-200"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition duration-200
              ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-teal-500 hover:bg-teal-600 text-white"}
            `}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Didn’t receive the OTP?{" "}
          <button
            onClick={() => toast.info("Resend OTP coming soon")}
            className="text-teal-500 font-semibold hover:underline"
          >
            Resend OTP
          </button>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Otp;
