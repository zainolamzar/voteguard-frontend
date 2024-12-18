import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import QRScan from "./pages/QR-Scan"
import OTPVerify from "./pages/OTP-Verify"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp-verify" element={<OTPVerify />} />
        <Route path="/qr-scan" element={<QRScan />} />
      </Routes>
    </Router>
  );
}

export default App;