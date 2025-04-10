import React, { useState } from 'react';
import axios from "axios"
import { updatepasswordRoute } from '../../../APIRoutes';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
export const UpdatePassword = () => {
    const navigate = useNavigate()
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    
    e.preventDefault();
    const email = localStorage.getItem("authEmail")
    const userId = localStorage.getItem("userId")
    // console.log("email",email);
    // console.log("userId",userId)
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setSuccess('');
      return;
    }

    try {
        const { data } = await axios.put(updatepasswordRoute(userId), { password });
        if (data.success === true) {
          toast.success("Password updated successfully");
          localStorage.removeItem("authEmail");
          localStorage.removeItem("userId");
          navigate("/login");
        } else {
          toast.error(data.message || "Password update failed");
        }
      } catch (err) {
        console.error("Error updating password:", err);
        toast.error(err?.response?.data?.message || "Something went wrong");
      }
    };
  

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md border">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Update Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium text-gray-700">New Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-xl transition"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};
