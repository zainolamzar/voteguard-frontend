import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Notification from "../components/ui/notification";

const apiUrl = import.meta.env.VITE_BE_URL;

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = { username, password };

    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setNotification({ 
          message: "Login successful! Redirecting...", 
          type: "success" 
        });

        setTimeout(() => {
          if (!result.user.otp_secret) {
            navigate(`/qr-scan/${result.user.user_id}`);
          } else {
            navigate(`/otp-verify/${result.user.user_id}`);
          }
        }, 1500);
      } else {
        setNotification({ 
          message: `Login failed: ${result.message}`, 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Error during login:", error);
      setNotification({ 
        message: "An error occurred. Please try again.", 
        type: "error" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F5F5] font-roboto">
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      <div className="p-8 w-full max-w-md bg-white shadow-lg rounded-md">
        <div className="flex justify-center mb-2">
          <div className="relative">
            <div className="absolute inset-0 rounded-full border-4 border-white"></div>
            <img
              src="/src/assets/main-logo.png"
              alt="Voteguard Logo"
              className="h-16 w-16 object-cover z-10 relative rounded-full"
            />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-[#003366] text-center mb-6">Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="block text-[#003366] text-lg font-medium mb-2">Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              className="w-full px-4 py-3 border border-[#00897B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00897B] text-gray-700"
            />
          </div>
          
          <div className="form-group relative">
            <label className="block text-[#003366] text-lg font-medium mb-2">Password:</label>
            <input
              type={passwordVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full px-4 py-3 border border-[#00897B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00897B] text-gray-700 pr-12"
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute right-3 top-[70%] transform -translate-y-1/2 text-[#003366] text-xl"
            >
              {passwordVisible ? "🙊" : "🙈"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#003366] text-white font-bold rounded-md hover:bg-[#00529B] transition duration-300"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")} className="text-[#003366] font-medium hover:underline cursor-pointer">
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;