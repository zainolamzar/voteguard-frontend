import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/QR-Scan.css";

const QRScan = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const { userId } = useParams(); // Get user ID from URL
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      navigate("/");
    } else {
      const fetchQrCode = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/users/${userId}/generate-qr`);
          if (response.ok) {
            const data = await response.json();
            setQrCodeUrl(data.qrCodeUrl);
          } else {
            console.error("Error response:", await response.json());
            alert("Unable to generate QR code. Please try again.");
          }
        } catch (error) {
          console.error("Error fetching QR code:", error);
          alert("An error occurred while fetching the QR code.");
        }
      };
  
      fetchQrCode();
    }
  }, [userId, navigate]);

  const handleProceed = () => {
    navigate(`/otp-verify/${userId}`);
  };

  return (
    <div className="qrscan-container">
      <h2>Scan QR Code</h2>
      <p>Scan this QR code using your Google Authenticator app.</p>
      {qrCodeUrl ? (
        <img src={qrCodeUrl} alt="QR Code" className="qr-image" />
      ) : (
        <p>Loading QR code...</p>
      )}
      <button onClick={handleProceed} className="proceed-button">
        Proceed
      </button>
    </div>
  );
};

export default QRScan;