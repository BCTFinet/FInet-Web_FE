import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, KeyRound, CheckCircle, Eye, EyeOff, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- Handlers ---

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1000);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 1000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(4);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex font-sans bg-white">
      {/* Left Side - Branding (Same as Login/Register) */}
      <div className="hidden lg:flex w-1/2 relative bg-emerald-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000" 
          alt="Financial Planning" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
        />
        <div className="relative z-20 flex flex-col justify-center px-16 text-white h-full max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
             <img src="/logo.png" alt="Logo" className="h-16 w-auto brightness-0 invert" />
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Don't Worry, We've Got <span className="text-emerald-300">You Covered.</span>
          </h1>
          <p className="text-lg text-emerald-100/80 leading-relaxed">
            Recover access to your account securely and get back to managing your finances in no time.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-[#FFFCF8] relative">
        {/* Back Button */}
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
          <button 
            onClick={() => step === 1 ? navigate('/login') : setStep(step - 1)}
            className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors pointer-events-auto bg-white/80 p-2 rounded-full backdrop-blur-sm md:bg-transparent md:p-0"
          >
            <ArrowLeft size={20} /> <span className="hidden md:inline">{step === 1 ? 'Back to Login' : 'Back'}</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-20 py-12">
          <div className="max-w-md w-full mx-auto">
            
            {/* Mobile Logo */}
            <div className="flex justify-center mb-8 lg:hidden">
               <div className="bg-emerald-50 p-3 rounded-2xl shadow-sm">
                  <TrendingUp size={32} className="text-emerald-600" />
               </div>
            </div>

            <AnimatePresence mode="wait">
              
              {/* STEP 1: EMAIL INPUT */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Forgot Password?</h2>
                    <p className="text-gray-500 mt-2">Enter your email address to reset your password.</p>
                  </div>

                  <form onSubmit={handleEmailSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                          required
                        />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-emerald-500 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-70"
                    >
                      {isLoading ? "Sending Code..." : "Send Reset Code"}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* STEP 2: OTP VERIFICATION */}
              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Enter OTP</h2>
                    <p className="text-gray-500 mt-2">We sent a 4-digit code to <span className="font-bold text-gray-700">{email}</span></p>
                  </div>

                  <form onSubmit={handleOtpSubmit} className="space-y-8">
                    <div className="flex justify-center gap-4">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-${idx}`}
                          type="text"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          className="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all bg-white"
                        />
                      ))}
                    </div>
                    <button 
                      type="submit" 
                      disabled={isLoading || otp.some(d => !d)}
                      className="w-full bg-emerald-500 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Verifying..." : "Verify Code"}
                    </button>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Didn't receive code? <button type="button" className="text-emerald-600 font-bold hover:underline">Resend</button></p>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* STEP 3: NEW PASSWORD */}
              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Reset Password</h2>
                    <p className="text-gray-500 mt-2">Create a new strong password for your account.</p>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                          required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border focus:ring-2 outline-none transition-all
                            ${confirmPassword && newPassword !== confirmPassword 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                              : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20'}`
                          }
                          required
                        />
                      </div>
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-red-500 mt-1 ml-1">Passwords do not match</p>
                      )}
                    </div>

                    <button 
                      type="submit" 
                      disabled={isLoading || !newPassword || newPassword !== confirmPassword}
                      className="w-full bg-emerald-500 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Resetting..." : "Reset Password"}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* STEP 4: SUCCESS */}
              {step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={48} className="text-emerald-600" strokeWidth={3} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h2>
                  <p className="text-gray-500 mb-8">Your password has been successfully updated. You can now log in with your new password.</p>
                  
                  <button 
                    onClick={() => navigate('/login')}
                    className="w-full bg-emerald-500 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
                  >
                    Back to Login
                  </button>
                </motion.div>
              )}

            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;