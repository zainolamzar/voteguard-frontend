import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const apiUrl = import.meta.env.VITE_BE_URL;

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    repeat_password: "",
  });
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [passwordValid, setPasswordValid] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasSymbol: false,
    hasNumber: false,
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Check password validity only when password is being entered
    if (name === "password") {
      checkPasswordValidity(value);
    }
  };

  // Validate password based on the requirements
  const checkPasswordValidity = (password) => {
    setPasswordValid({
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasNumber: /\d/.test(password),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.repeat_password) {
      alert("Passwords do not match!");
      return;
    }

    const { repeat_password, ...payload } = formData;

    try {
      const response = await fetch(`${apiUrl}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Registration successful");
        navigate(`/login`);
      } else {
        alert("Registration failed: " + result.message);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-roboto">
      <div className="w-full max-w-md p-8">
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
        <h2 className="text-3xl font-bold text-[#003366] text-center mb-6">
          Register
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group grid grid-cols-2 gap-4">
            {/* First Name and Last Name side by side */}
            <div>
              <label className="block text-sm font-medium text-gray-600">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter first name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-[#00897B] focus:border-[#00897B]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter last name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-[#00897B] focus:border-[#00897B]"
                required
              />
            </div>
          </div>

          {/* Username */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-600">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-[#00897B] focus:border-[#00897B]"
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-[#00897B] focus:border-[#00897B]"
              required
            />
          </div>

          <div className="form-group grid grid-cols-2 gap-4">
            {/* Password and Repeat Password side by side */}
            <div>
              <label className="block text-sm font-medium text-gray-600">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-[#00897B] focus:border-[#00897B]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Repeat Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="repeat_password"
                value={formData.repeat_password}
                onChange={handleChange}
                placeholder="Repeat password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-[#00897B] focus:border-[#00897B]"
                required
              />
            </div>
          </div>

          {/* Show Password Checkbox */}
          <div className="flex items-center space-x-2 mt-2">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="h-4 w-4"
            />
            <label className="text-sm text-gray-600">Show Password</label>
          </div>

          {/* Password Requirements */}
          <div className="mt-4 text-sm text-gray-600 rounded bg-[#EBEBEB] p-2">
            <p>Password must include:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li className={passwordValid.hasUpperCase ? "text-green-500" : "text-red-500"}>
                1 or more uppercase letters
              </li>
              <li className={passwordValid.hasLowerCase ? "text-green-500" : "text-red-500"}>
                1 or more lowercase letters
              </li>
              <li className={passwordValid.hasSymbol ? "text-green-500" : "text-red-500"}>
                1 or more symbols (e.g., !@#$%^&*)
              </li>
              <li className={passwordValid.hasNumber ? "text-green-500" : "text-red-500"}>
                1 or more numbers
              </li>
            </ul>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full bg-[#003366] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#002244] focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
            disabled={
              !passwordValid.hasUpperCase ||
              !passwordValid.hasLowerCase ||
              !passwordValid.hasSymbol ||
              !passwordValid.hasNumber
            }
          >
            Register
          </button>
        </form>

        {/* Navigation to Login */}
        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-[#003366] font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;