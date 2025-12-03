import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Mail, AlertCircle } from 'lucide-react';
import axios from 'axios';

const OtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  // Get email passed from registration page
  const email = location.state?.email;

  // If no email (e.g., direct access), redirect back to register
  useEffect(() => {
    if (!email) {
      navigate('/register');
    } else {
      // Optional: Trigger send OTP immediately on mount if your flow requires it.
      // Usually, registration already sends one. If not, uncomment below:
      // handleResend(); 
    }
  }, [email, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    if (error) setError('');
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return;

    setIsLoading(true);
    setError('');

    try {
      // API Call to verify OTP
      // Note: Use relative path to leverage Vite proxy
      const response = await axios.post('/otp-verification/verify-otp-email', { email, otp: code });

      if (response.status === 200) {
        alert("Email verified successfully!");
        navigate('/login');
      }
    } catch (err) {
      console.error("OTP Verification Error:", err);
      if (err.response) {
        // Handle 400 or 500 errors
        setError(err.response.data?.message || "Invalid or expired OTP. Please try again.");
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // API Call to resend OTP
      const response = await axios.post('/otp-verification/send', { email });
      
      if (response.status === 200) {
        setTimer(60);
        alert("OTP has been resent to your email.");
      }
    } catch (err) {
      console.error("Resend OTP Error:", err);
      setError("Failed to send OTP. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-white">
      {/* Left Side - Visuals */}
      <div className="hidden lg:flex w-1/2 relative bg-emerald-900 overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=1000" 
          alt="Security" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
        />
        <div className="relative z-20 text-center px-10 max-w-lg">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-2xl">
            <Mail size={40} className="text-emerald-300" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Check Your Inbox</h1>
          <p className="text-emerald-100/80 text-lg">
            We've sent a verification code to <br/> <span className="font-bold text-white">{email}</span>
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-[#FFFCF8] relative">
        <div className="absolute top-0 left-0 w-full p-6">
          <button 
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors font-medium"
          >
            <ArrowLeft size={20} /> Back
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-20 py-12">
          <div className="max-w-md w-full mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Account</h2>
            <p className="text-gray-500 mb-8">Enter the 6-digit code to complete your registration.</p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center gap-2 text-red-600">
                <AlertCircle size={18} />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleVerify}>
              <div className="flex justify-between gap-2 sm:gap-3 mb-8">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => inputRefs.current[idx] = el}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-10 h-12 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 border-gray-200 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                ))}
              </div>

              <button 
                type="submit"
                disabled={isLoading || otp.some(d => !d)}
                className="w-full bg-emerald-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                Didn't receive the code?{' '}
                <button 
                  onClick={handleResend}
                  disabled={timer > 0 || isLoading}
                  className={`font-bold transition-colors ${timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-emerald-600 hover:underline'}`}
                >
                  {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;