import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import QRScan from "./pages/QR-Scan";
import OTPVerify from "./pages/OTP-Verify";
import Dashboard from "./pages/Dashboard";
import ElectionForm from "./pages/election/Election-Form";
import OptionForm from "./pages/election/Option-Form";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/qr-scan/:userId" element={<QRScan />} />
        <Route path="/otp-verify/:userId" element={<OTPVerify />} />
        <Route path="/dashboard/:userId" element={<Dashboard />} />
        <Route path="/election-form/:userId" element={<ElectionForm />} />
        <Route path="/option-form/:userId/:electionId" element={<OptionForm />} />
      </Routes>
    </Router>
  );
}

export default App;