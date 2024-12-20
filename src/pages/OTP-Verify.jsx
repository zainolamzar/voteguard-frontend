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
    <div className="otpverify-container">
      <h2>Verify OTP</h2>
      <p>Enter the One Time Password from your Google Authenticator app.</p>
      <form onSubmit={handleSubmit} className="otp-form">
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          maxLength="6"
          required
        />
        <button type="submit">Verify OTP</button>
      </form>
    </div>
  );
};

export default OTPVerify;