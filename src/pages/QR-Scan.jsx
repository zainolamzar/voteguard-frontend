import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Notification from "@/components/ui/notification";

const apiUrl = import.meta.env.VITE_BE_URL;

const QRScan = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const { userId } = useParams(); // Get user ID from URL
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      navigate("/");
    } else {
      const fetchQrCode = async () => {
        try {
          const response = await fetch(`${apiUrl}/api/users/${userId}/generate-qr`);
          if (response.ok) {
            const data = await response.json();
            setQrCodeUrl(data.qrCodeUrl);
          } else {
            console.error("Error response:", await response.json());
            setNotification({ 
              message: "Unable to generate QR code. Please try again.", 
              type: "error" 
            });
          }
        } catch (error) {
          console.error("Error fetching QR code:", error);
          setNotification({ 
            message: "An error occurred while fetching the QR code.", 
            type: "error" 
          });
        }
      };

      fetchQrCode();
    }
  }, [userId, navigate]);

  const handleProceed = () => {
    navigate(`/otp-verify/${userId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F5] font-roboto p-6">
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-[#003366] mb-4">Setup OTP Authentication</h2>
        <p className="text-gray-600 text-lg mb-6">
          Scan the QR code below using your Google Authenticator app to enable two-factor authentication.
        </p>
        {qrCodeUrl ? (
          <img
            src={qrCodeUrl}
            alt="QR Code"
            className="w-48 h-48 mx-auto border-4 border-[#00897B] rounded-md shadow-md mb-6"
          />
        ) : (
          <p className="text-gray-500 text-lg">Loading QR code...</p>
        )}
        <button
          onClick={handleProceed}
          className="w-full py-3 bg-[#003366] text-white font-bold rounded-md hover:bg-[#00529B] transition duration-300"
        >
          Proceed
        </button>
      </div>
    </div>
  );
};

export default QRScan;