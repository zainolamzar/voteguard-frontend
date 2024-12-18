import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/QR-Scan.css";

const QRScan = () => {
  const [qrCodeUrl] = useState("https://via.placeholder.com/200");
  const navigate = useNavigate();

  const handleProceed = () => {
    navigate("/otp-verify");
  };

  return (
    <div className="qrscan-container">
      <h2>Scan QR Code</h2>
      <p>Scan this QR code using your Google Authenticator app.</p>
      <img src={qrCodeUrl} alt="QR Code" className="qr-image" />
      <button onClick={handleProceed} className="proceed-button">
        Proceed
      </button>
    </div>
  );
};

export default QRScan;