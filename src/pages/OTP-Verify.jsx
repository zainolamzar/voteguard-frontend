import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../pages/OTP-Verify.css";

const apiUrl = import.meta.env.VITE_BE_URL;

const OTPVerify = () => {
  const [otp, setOtp] = useState("");
  const { userId } = useParams(); // Get user ID from URL
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/users/${userId}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      });

      const result = await response.json();
      if (response.ok) {
        alert("OTP Verified!");
        navigate(`/dashboard/${userId}`);
      } else {
        alert("OTP verification failed: " + result.message);
      }
    } catch (error) {
      console.error("Error during OTP verification:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F5F5] font-roboto p-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-[#003366] mb-4">Verify OTP</h2>
        <p className="text-gray-600 text-lg mb-6">
          Please enter the 6-digit code from your Google Authenticator app.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              maxLength="6"
              required
              className="w-full px-4 py-3 border border-[#00897B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00897B] text-gray-700 text-center text-2xl tracking-widest"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-[#003366] text-white font-bold rounded-md hover:bg-[#00529B] transition duration-300"
          >
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default OTPVerify;