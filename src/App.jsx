import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import QRScan from "./pages/QR-Scan";
import OTPVerify from "./pages/OTP-Verify";
import Dashboard from "./pages/Dashboard";
import ElectionForm from "./pages/election/Election-Form";
import OptionForm from "./pages/election/Option-Form";
import GenerateKey from "./pages/election/Generate-Key";
import ElectionDetail from "./pages/election/Election-Detail";
import ElectionUpdate from "./pages/election/Election-Update";
import ManageRequest from "./pages/election/Manage-Request";
import JoinElection from "./pages/voter/Join-Election";
import JoinedElectionDetail from "./pages/voter/Joined-Election-Detail";

function App() {
  return (
    <Router>
      <Routes>
        {/* General */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Navigate to="/" replace />} /> 
        <Route path="/register" element={<Register />} />
        <Route path="/qr-scan/:userId" element={<QRScan />} />
        <Route path="/otp-verify/:userId" element={<OTPVerify />} />
        <Route path="/dashboard/:userId" element={<Dashboard />} />
        {/* Admin Module */}
        <Route path="/election-form/:userId" element={<ElectionForm />} />
        <Route path="/option-form/:userId/:electionId" element={<OptionForm />} />
        <Route path="/generate-key/:userId/:electionId" element={<GenerateKey />} />
        <Route path="/election/:userId/detail/:electionId" element={<ElectionDetail />} />
        <Route path="/election/:userId/update/:electionId" element={<ElectionUpdate />} />
        <Route path="/election/:userId/manage-requests/:electionId" element={<ManageRequest />} />
        {/* Voter Module */}
        <Route path="/voter/join/:userId" element={<JoinElection />} />
        <Route path="/election/:userId/join/:voterId/:electionId/detail" element={<JoinedElectionDetail />} />
      </Routes>
    </Router>
  );
}

export default App;