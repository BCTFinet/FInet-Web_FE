import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { TrendingUp, ArrowLeft, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// --- COMPONENTS ---

// Success Modal
const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }} 
        className="bg-[#F1F5F9] w-full max-w-md rounded-3xl shadow-2xl relative z-10 p-8 flex flex-col items-center justify-center min-h-[300px]"
      >
        <h2 className="text-3xl font-bold text-[#6dad83] mb-6">Login Successful!</h2>
        
        <div className="w-20 h-20 rounded-full border-4 border-[#6dad83] flex items-center justify-center mb-8">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Check size={40} className="text-[#6dad83]" strokeWidth={3} />
          </motion.div>
        </div>
        
        <p className="text-gray-500 text-center mb-6">Welcome back! Redirecting to dashboard...</p>

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

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  // 1. Auth Check on Mount & Handle Google Callback
  useEffect(() => {
    // Check if we are coming back from Google with a token in the URL
    const queryParams = new URLSearchParams(location.search);
    const urlToken = queryParams.get('token') || queryParams.get('access_token');

    if (urlToken) {
      handleTokenLogin(urlToken);
    } else {
      // Regular auth check
      const token = localStorage.getItem('finet_auth_token');
      if (token) {
        navigate('/dashboard');
      }
    }
  }, [navigate, location]);

  const handleTokenLogin = async (token) => {
    setIsLoading(true);
    localStorage.setItem('finet_auth_token', token);
    
    // Clear URL parameters to clean up
    window.history.replaceState({}, document.title, window.location.pathname);

    try {
      // Fetch User Profile with the new token
      // CHANGED: Extract data from 'profile' key
      const profileResponse = await axios.get('/auth/profile', {
         headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = profileResponse.data.profile || profileResponse.data.data || profileResponse.data;

      if (profileResponse.status === 200) {
         localStorage.setItem('finet_user', JSON.stringify(userData));
      }
    } catch (profileErr) {
      console.warn("Could not fetch profile details:", profileErr);
      // Fallback: We don't have email from URL, so we set a generic user
      localStorage.setItem('finet_user', JSON.stringify({ name: 'User', email: 'Google User' }));
    }

    setIsLoading(false);
    setShowSuccess(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log("Attempting login with:", { email });

      // Authenticate
      const loginResponse = await axios.post('/auth/login', 
        {
          email: email,
          password: password
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log("Login Success:", loginResponse);

      // FIX: Check for 201 as well (Backend sends 201 Created for login)
      if (loginResponse.status === 200 || loginResponse.status === 201) {
        const token = loginResponse.data.token || loginResponse.data.access_token || 'session-token';
        
        // Store Token
        localStorage.setItem('finet_auth_token', token);

        // Fetch Profile Immediately
        try {
          // CHANGED: Extract data from 'profile' key
          const profileResponse = await axios.get('/auth/profile', {
             headers: { Authorization: `Bearer ${token}` }
          });
          
          const userData = profileResponse.data.profile || profileResponse.data.data || profileResponse.data;

          if (profileResponse.status === 200) {
             localStorage.setItem('finet_user', JSON.stringify(userData));
          }
        } catch (profileErr) {
          console.warn("Could not fetch profile details:", profileErr);
        }

        setIsLoading(false);
        setShowSuccess(true);
        setTimeout(() => {
           navigate('/dashboard');
        }, 3000);
      }
    } catch (err) {
      console.error("Login Error Full:", err);
      
      let errorMsg = "An unexpected error occurred.";

      if (err.response) {
        // Backend returned an error response
        console.log("Error Response Data:", err.response.data);
        console.log("Error Status:", err.response.status);

        if (err.response.data && err.response.data.message) {
           errorMsg = err.response.data.message;
        } else if (err.response.status === 401) {
          errorMsg = "Invalid email or password.";
        } else if (err.response.status === 400) {
          errorMsg = "Please fill in all fields correctly.";
        } else if (err.response.status === 500) {
           errorMsg = "Server error (500). Please try again later.";
           if (typeof err.response.data === 'string') {
             console.log("Server raw error:", err.response.data);
           }
        } else {
          errorMsg = `Login failed (${err.response.status}).`;
        }
      } else if (err.request) {
        errorMsg = "Network error. Cannot reach the server.";
      } 

      setError(errorMsg);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // We pass a 'redirect_url' parameter.
    // This tells the backend: "After you get the token from Google, please redirect back here with ?token=..."
    // We use the current origin + /login to handle the callback logic in this same file.
    const redirectUrl = `${window.location.origin}/login`;
    window.location.href = `https://finet-api.vercel.app/auth/google?redirect_url=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen flex font-sans bg-white">
      
      {/* Success Modal Overlay */}
      <AnimatePresence>
        {showSuccess && <SuccessModal isOpen={showSuccess} />}
      </AnimatePresence>

      {/* Left Side - Image & Branding (Hidden on Mobile) */}
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
              Kendalikan <span className="text-emerald-300">Keuangan</span> Anda.
            </h1>
            <p className="text-lg text-emerald-100/80 leading-relaxed">
              Kelola pengeluaran dan tabungan Anda dengan teknologi AI tercanggih.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form (Mobile Optimized) */}
      <div className="w-full lg:w-1/2 flex flex-col bg-[#FFFCF8] relative overflow-y-auto">
        {/* Mobile Header / Back Button */}
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors bg-white/80 p-2 rounded-full backdrop-blur-sm md:bg-transparent md:p-0"
          >
            <ArrowLeft size={20} /> <span className="hidden md:inline">Kembali</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-20 py-12">
          <motion.div 
            className="max-w-md w-full mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            
            {/* Mobile Logo Display */}
            <div className="flex justify-center mb-8">
              <div className="bg-emerald-50 p-3 rounded-2xl shadow-sm">
                 <img 
                   src="/logo.png" 
                   alt="FINET Logo" 
                   className="h-12 w-auto object-contain" 
                   onError={(e) => {
                     e.target.style.display = 'none';
                     e.target.nextSibling.style.display = 'block';
                   }}
                 />
                 {/* Fallback Icon */}
                 <TrendingUp size={32} className="hidden text-emerald-600" />
              </div>
            </div>

            <motion.div variants={itemVariants} className="text-center mb-8">
               <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Selamat Datang Kembali!</h2>
               <p className="text-gray-500 mt-2 text-sm md:text-base">Masuk untuk mengakses dashboard Anda</p>
            </motion.div>

            <motion.button 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm mb-6 font-medium text-sm md:text-base"
            >
              <GoogleIcon />
              Lanjutkan dengan Google
            </motion.button>

            <motion.div variants={itemVariants} className="relative flex items-center gap-4 mb-6">
               <div className="h-px bg-gray-200 flex-1"></div>
               <span className="text-xs text-gray-400 uppercase font-medium">Atau</span>
               <div className="h-px bg-gray-200 flex-1"></div>
            </motion.div>

            {/* Error Message */}
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

            <form onSubmit={handleLogin} className="space-y-5">
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-gray-700 placeholder-gray-400"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-gray-700 placeholder-gray-400"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <Link to="/forgot-password" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Lupa Password?</Link>
                </div>
              </motion.div>

              <motion.button 
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-600/40 transform transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Memproses..." : "Masuk"}
              </motion.button>
            </form>

            <motion.div variants={itemVariants} className="mt-8 text-center text-sm md:text-base text-gray-600">
              Belum punya akun? <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline">Daftar Sekarang</Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;