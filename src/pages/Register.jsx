import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, ArrowLeft, Eye, EyeOff, Check, AlertCircle, X } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// --- COMPONENTS ---

// 1. Success Modal (Ported from Dashboard.jsx)
const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }} 
        className="bg-[#F1F5F9] w-full max-w-md rounded-3xl shadow-2xl relative z-10 p-8 flex flex-col items-center justify-center min-h-[300px]"
      >
        <h2 className="text-3xl font-bold text-[#6dad83] mb-6">Account Created!</h2>
        
        <div className="w-20 h-20 rounded-full border-4 border-[#6dad83] flex items-center justify-center mb-8">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Check size={40} className="text-[#6dad83]" strokeWidth={3} />
          </motion.div>
        </div>
        
        <p className="text-gray-500 text-center mb-6">Redirecting you to login...</p>

        <div className="mt-auto">
           <img src="/logo.png" alt="FINET" className="h-12 w-auto brightness-0 invert opacity-40" />
        </div>
      </motion.div>
    </div>
  );
};

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // Success Modal State
  const [error, setError] = useState(''); 
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    dob: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const isFormValid = 
    formData.username && 
    formData.email && 
    formData.phoneNumber && 
    formData.dob &&
    formData.password && 
    formData.password === formData.confirmPassword && 
    formData.agreeTerms;

  useEffect(() => {
    const token = localStorage.getItem('finet_auth_token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setError('');

    try {
      const phoneString = formData.phoneNumber.replace(/\D/g, '');
      const phoneNumber = phoneString ? parseInt(phoneString, 10) : null;
      const dateObj = new Date(formData.dob);
      const dobISO = dateObj.toISOString(); 

      const payload = {
        email: formData.email,
        password: formData.password,
        username: formData.username,
        phone_number: phoneNumber,
        dob: dobISO, 
        profile_image: null
      };

      const response = await axios.post('/auth/register', payload);

      if (response.status === 200 || response.status === 201) {
        // Show Success Modal
        setShowSuccess(true);
        // Navigate after 2.5 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      }
    } catch (err) {
      console.error("Registration Error:", err);
      if (err.response) {
        if (err.response.status === 409) {
          setError("Email already exists. Please use a different email.");
        } else if (err.response.status === 400) {
          const data = err.response.data;
          let errorMessage = "Invalid data provided.";
          if (Array.isArray(data.message)) {
             errorMessage = data.message.join(', ');
          } else if (typeof data.message === 'string') {
             errorMessage = data.message;
          }
          setError(`Error: ${errorMessage}`);
        } else {
          setError("Registration failed. Please try again.");
        }
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = 'https://finet-api.vercel.app/auth/google'; 
  };

  return (
    <div className="min-h-screen flex font-sans bg-white">
      
      {/* Success Modal Overlay */}
      <AnimatePresence>
        {showSuccess && <SuccessModal isOpen={showSuccess} />}
      </AnimatePresence>

      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 relative bg-emerald-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000" 
          alt="Financial Planning" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
        />
        <div className="relative z-20 flex flex-col justify-center px-16 text-white h-full max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
               <img src="/logo.png" alt="Logo" className="h-16 w-auto brightness-0 invert" />
            </div>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Join the <span className="text-emerald-300">Revolution</span>.
            </h1>
            <p className="text-lg text-emerald-100/80 leading-relaxed">
              Register today and start your journey towards financial freedom with AI-driven insights.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-[#FFFCF8] relative">
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20 pointer-events-none">
           <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors pointer-events-auto bg-white/80 p-2 rounded-full backdrop-blur-sm md:bg-transparent md:p-0"
          >
            <ArrowLeft size={20} /> <span className="hidden md:inline">Back to Home</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="min-h-full flex flex-col justify-center px-6 sm:px-12 md:px-20 py-20 lg:py-12">
            <motion.div 
              className="max-w-md w-full mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              
              <div className="flex justify-center mb-8 lg:hidden">
                <div className="bg-emerald-50 p-3 rounded-2xl shadow-sm">
                   <img src="/logo.png" alt="FINET" className="h-12 w-auto object-contain" />
                </div>
              </div>

              <motion.div variants={itemVariants} className="text-center mb-8">
                 <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Create Account</h2>
                 <p className="text-gray-500 mt-2 text-sm md:text-base">Fill in your details to get started.</p>
              </motion.div>

              <motion.button 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleRegister} 
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm mb-6 font-medium text-sm md:text-base"
              >
                <GoogleIcon /> Register with Google
              </motion.button>

              <motion.div variants={itemVariants} className="relative flex items-center gap-4 mb-6">
                 <div className="h-px bg-gray-200 flex-1"></div>
                 <span className="text-xs text-gray-400 uppercase font-medium">OR</span>
                 <div className="h-px bg-gray-200 flex-1"></div>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-600"
                  >
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleRegister} className="space-y-4">
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                  <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Unique Username" className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-gray-700" required />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-gray-700" required />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-gray-700" required />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-2 px-3 py-3 bg-white border border-gray-200 rounded-xl text-gray-600">
                      <span className="text-lg">🇮🇩</span><span className="font-medium text-sm">+62</span>
                    </div>
                    <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="81234567890" className="flex-1 px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-gray-700" required />
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Password" className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-gray-700" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm" className={`w-full px-4 py-3 rounded-xl bg-white border focus:ring-2 outline-none transition-all text-gray-700 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20'}`} required />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="flex items-start gap-3 pt-2">
                  <div className="relative flex items-center mt-1">
                    <input type="checkbox" name="agreeTerms" id="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 bg-white transition-all checked:border-emerald-500 checked:bg-emerald-500 hover:border-emerald-400"/>
                    <Check size={12} className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={4} />
                  </div>
                  <label htmlFor="agreeTerms" className="text-sm text-gray-600 cursor-pointer select-none">I agree to the <Link to="/legal" target="_blank" className="text-emerald-600 font-bold hover:underline">Terms & Conditions</Link> and <Link to="/legal" target="_blank" className="text-emerald-600 font-bold hover:underline">Privacy Policy</Link>.</label>
                </motion.div>

                <motion.div variants={itemVariants} className="pt-4">
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit" 
                    disabled={!isFormValid || isLoading} 
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transform transition-all ${!isFormValid || isLoading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/30 hover:shadow-emerald-600/40'}`}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </motion.button>
                </motion.div>
              </form>

              <motion.div variants={itemVariants} className="mt-8 mb-8 text-center text-sm md:text-base text-gray-600">
                Already have an account? <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline">Sign In</Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;