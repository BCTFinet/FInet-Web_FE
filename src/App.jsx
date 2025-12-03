import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import RegisterTerms from './pages/RegisterTerms';
import OtpVerification from './pages/OtpVerification'; // Import OTP Page
import Dashboard from './pages/Dashboard';
import Transaction from './pages/Transaction';
import WalletDetail from './pages/WalletDetail';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Settings from './pages/Settings';

// --- Auth Handler Component ---
const AuthHandler = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('finet_auth_token');
      const loginTime = localStorage.getItem('finet_login_time');
      
      if (token && loginTime) {
        const currentTime = Date.now();
        const timeElapsed = currentTime - parseInt(loginTime, 10);
        const TIMEOUT_DURATION = 60000; 

        if (timeElapsed > TIMEOUT_DURATION) {
          console.log("Session expired. Logging out...");
          localStorage.removeItem('finet_auth_token');
          localStorage.removeItem('finet_user');
          localStorage.removeItem('finet_login_time');
          alert("Session expired. Please log in again."); 
          navigate('/login');
        }
      }
    };
    checkAuthStatus();
    const interval = setInterval(checkAuthStatus, 5000);
    return () => clearInterval(interval);
  }, [navigate, location]);

  return children;
};

function App() {
  return (
    <Router>
      <AuthHandler>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/legal" element={<RegisterTerms />} />
          <Route path="/verify-otp" element={<OtpVerification />} /> {/* New Route */}
          
          {/* --- PRIVATE ROUTES --- */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transaction" element={<Transaction />} />
          <Route path="/wallet/:id" element={<WalletDetail />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AuthHandler>
    </Router>
  );
}

export default App;