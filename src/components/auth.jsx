import { FaEye, FaEyeSlash } from 'react-icons/fa';
import React, { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { googleSignIn } from "./google";
import { motion } from "framer-motion";

const AuthForms = ({ initialForm = "signin-form", onClose }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [formType, setFormType] = useState(initialForm);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setFormType(initialForm);
  }, [initialForm]);

  // Clear message when form type changes
  useEffect(() => {
    setMessage("");
  }, [formType]);

  const handleGoogleSuccess = async (response) => {
    setMessage(""); // Clear any previous messages
    setLoading(true);
    try {
      const data = await googleSignIn(response.credential);
      if (data?.success) {
        console.log("Login successful, navigating to dashboard...");
        window.location.href = "/home";
      } else {
        setMessage(data.message || "Login failed, please try again.");
      }
    } catch (error) {
      setMessage(error.message || "An unexpected error occurred.");
    }
  
    setLoading(false);
  };
  

  const handleSignIn = async (event) => {
    event.preventDefault();
    setMessage(""); // Clear message on new submission
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
          window.location.href = "/home";
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Error during signin:", error);
    }
    setLoading(false);
  };

  const handleOTP = async (event, type) => {
    event.preventDefault();
    setMessage(""); // Clear message on new submission
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/userExists`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.status === 400) {
        if (type === 'signup') {
          setMessage("Email Already registered")
        } else {
          generateOTP("This is your one time password to reset password",type);
        }
      } else {
        if (type === 'signup') {
          generateOTP("This is your one time password to register into printEase",type);
        } else {
          setMessage("Email is not registered")
        }
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setMessage("Something went wrong. Please try again.");
    }
  };

  const generateOTP = async (text,type) => {
    const otpResponse = await fetch(`${API_URL}/auth/generateOTP`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        text: text,
      }),
    });
    const otpData = await otpResponse.json();

    if (otpResponse.ok) {
      setMessage("OTP sent to your email");
      setLoading(false);
      if(type==='signup'){
        setFormType("otp-signup")
      }else{
        setFormType("otp-reset");
      }
    } else {
      setMessage(otpData.message || "Failed to send OTP");
    }
  }

  const verifyOtp = async (event, type) => {
    event.preventDefault();
    setMessage(""); // Clear message on new submission
    setLoading(true);
    console.log('otp is:'+otp);
    try {
      const response = await fetch(`${API_URL}/auth/verifyOTP`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const data = await response.json();
      if (response.status === 400) {
        setMessage(data.message);
      } else {
        if (type === "signup") {
          signUpUser();
        } else {
          setFormType("Enter-password");
        }
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
    }
    setLoading(false);
  };

  const signUpUser = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.status === 400) {
        setMessage(data.message);
      } else {
        window.location.href = "/home";
      }
    } catch (error) {
      console.error("Error during signup:", error);
    }
    setLoading(false);
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setMessage(""); // Clear message on new submission
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset_password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Password reset successful. Click below to sign in.");
      } else {
        setMessage(data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setMessage("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="flex justify-center items-center my-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl"
      >

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 pr-5">
            {formType === 'signin-form' ? 'Welcome Back' : 
             formType === 'signup-form' ? 'Create Account' :
             formType === 'reset-password-form' ? 'Reset Password' :
             formType.includes('otp') ? 'Verify OTP' : 'New Password'}
          </h2>
        </div>

        {formType === 'signin-form' && (
          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-2">
              <label className="text-base font-medium text-gray-700">Email</label>
              <input
                className="w-full px-6 py-4 text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent transition duration-200"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-base font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  className="w-full px-6 py-4 text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent transition duration-200"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash size={22} /> : <FaEye size={22} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 text-base bg-black text-white rounded-lg hover:bg-white hover:text-black border border-transparent hover:border-black transition-all duration-300"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {message && (
              <p className={`text-center ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}

            <div className="flex justify-between text-sm">
              <button
                type="button"
                onClick={() => setFormType('reset-password-form')}
                className="text-black hover:text-gray-700 underline decoration-gray-400 hover:decoration-gray-700 transition duration-200"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => setFormType('signup-form')}
                className="text-black hover:text-gray-700 underline decoration-gray-400 hover:decoration-gray-700 transition duration-200"
              >
                Create account
              </button>
            </div>
            <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setErrors({ submit: "Google login failed. Please try again." });
              }}
              useOneTap
              theme="outline"
              shape="rectangular"
              text="continue_with"
              width="100%"
            />
          </div>
          </form>
        )}

        {formType === 'signup-form' && (
          <form onSubmit={(e) => handleOTP(e, 'signup')} className="space-y-6">
            <div className="space-y-2">
              <label className="text-base font-medium text-gray-700">Email</label>
              <input
                className="w-full px-6 py-4 text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent transition duration-200"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-base font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  className="w-full px-6 py-4 text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent transition duration-200"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Choose a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash size={22} /> : <FaEye size={22} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 text-base bg-black text-white rounded-lg hover:bg-white hover:text-black border border-transparent hover:border-black transition-all duration-300"
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : 'Continue'}
            </button>

            {message && (
              <p className={`text-center ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                className="text-black hover:text-gray-700 underline decoration-gray-400 hover:decoration-gray-700 transition duration-200"
                onClick={() => setFormType("signin-form")}
              >
                Sign In
              </button>
            </p>
            <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setErrors({ submit: "Google login failed. Please try again." });
              }}
              useOneTap
              theme="outline"
              shape="rectangular"
              text="continue_with"
              width="100%"
            />
          </div>
          </form>
        )}

        {(formType === 'otp-signup' || formType === 'otp-reset') && (
          <form onSubmit={(e) => verifyOtp(e, formType === 'otp-signup' ? 'signup' : 'reset')} className="space-y-6">
            <div className="space-y-2">
              <label className="text-base font-medium text-gray-700">Enter OTP</label>
              <input
                className="w-full px-6 py-4 text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent transition duration-200"
                type="text"
                placeholder="Enter the OTP sent to your email"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 text-base bg-black text-white rounded-lg hover:bg-white hover:text-black border border-transparent hover:border-black transition-all duration-300"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            {message && (
              <p className={`text-center ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </form>
        )}

        {formType === 'reset-password-form' && (
          <form onSubmit={(e) => handleOTP(e, 'reset')} className="space-y-6">
            <div className="space-y-2">
              <label className="text-base font-medium text-gray-700">Email</label>
              <input
                className="w-full px-6 py-4 text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent transition duration-200"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 text-base bg-black text-white rounded-lg hover:bg-white hover:text-black border border-transparent hover:border-black transition-all duration-300"
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>

            {message && (
              <p className={`text-center ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}

            <button
              type="button"
              className="w-full text-center text-sm text-black hover:text-gray-700 underline decoration-gray-400 hover:decoration-gray-700 transition duration-200"
              onClick={() => setFormType('signin-form')}
            >
              Back to Sign In
            </button>
          </form>
        )}

        {formType === 'Enter-password' && (
          <form onSubmit={resetPassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-base font-medium text-gray-700">New Password</label>
              <div className="relative">
                <input
                  className="w-full px-6 py-4 text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent transition duration-200"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash size={22} /> : <FaEye size={22} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-base font-medium text-gray-700">Confirm New Password</label>
              <div className="relative">
                <input
                  className="w-full px-6 py-4 text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent transition duration-200"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? <FaEyeSlash size={22} /> : <FaEye size={22} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 text-base bg-black text-white rounded-lg hover:bg-white hover:text-black border border-transparent hover:border-black transition-all duration-300"
              disabled={loading}
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>

            {message && (
              <p className={`text-center ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default AuthForms;