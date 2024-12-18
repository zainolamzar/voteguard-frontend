import React, { useState } from "react";
import "../styles/OTP-Verify.css";

const OTPVerify = () => {
  const [otp, setOtp] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted OTP:", otp);
    // Add backend call here
    alert(`OTP ${otp} submitted!`);
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