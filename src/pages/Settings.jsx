import React, { useState, useEffect, useRef } from 'react';
import { 
  User,
  Mail,
  FileText,
  Save,
  Upload,
  Phone,
  Send,
  CheckCircle,
  LogOut,
  AlertTriangle,
  Shield,
  Loader2,
  Calendar,
  Lock,
  Menu,
  Settings as SettingsIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Sidebar from './Sidebar';

// --- CONFIGURATION ---
const CLOUD_NAME = "ducz7c1lr"; 
const UPLOAD_PRESET = "FinetFinancialAI"; 
// ---------------------

// --- Sub-Components ---

const SettingsTab = ({ icon: Icon, label, active, onClick, isDestructive }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left
      ${isDestructive 
        ? 'text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 mt-8' 
        : active 
          ? 'bg-[#557C67] text-white shadow-md' 
          : 'text-gray-600 hover:bg-gray-100'
      }
    `}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

// --- VIEW: EDIT PROFILE (Connected to API) ---
const EditProfileView = ({ userData, token, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
    dob: '',
    password: '',
    profile_image: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userData) {
      let formattedDob = '';
      if (userData.dob) {
        const d = new Date(userData.dob);
        if (!isNaN(d.getTime())) {
          formattedDob = d.toISOString().split('T')[0];
        }
      }

      setFormData({
        username: userData.username || userData.name || '',
        email: userData.email || '',
        phone_number: userData.phone_number || '',
        dob: formattedDob,
        password: '',
        profile_image: userData.profile_image || ''
      });
    }
  }, [userData]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImageUploading(true);

    try {
      // 1. Upload to Cloudinary
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", UPLOAD_PRESET);
      data.append("cloud_name", CLOUD_NAME);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        data
      );

      const newImageUrl = res.data.secure_url;
      console.log("✅ Image Uploaded to Cloudinary:", newImageUrl);

      // 2. Update Local State
      setFormData(prev => ({ ...prev, profile_image: newImageUrl }));

      // 3. AUTO-SAVE FULL PROFILE to Database
      // We send the ENTIRE form data, just with the new image.
      // This satisfies backends that require all fields to be present.
      const payload = {
        username: formData.username,
        email: formData.email,
        phone_number: Number(formData.phone_number),
        dob: formData.dob,
        profile_image: newImageUrl // Use the new URL explicitly
      };

      console.log("💾 Saving Profile with new Image to DB...", payload);
      
      const dbRes = await axios.patch('/user', payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      console.log("✅ Database Updated:", dbRes.data);
      onUpdateSuccess(true); // Silent success

    } catch (err) {
      console.error("Image upload/save failed", err);
      const errMsg = err.response?.data?.error?.message || err.message || "Failed to upload image.";
      alert(`Upload Error: ${errMsg}`);
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        phone_number: Number(formData.phone_number),
        dob: formData.dob,
        profile_image: formData.profile_image || "string"
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      await axios.patch('/user', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onUpdateSuccess(false); // Show alert
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update profile. Please check your inputs.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-8"
    >
      {/* Profile Image Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div 
          className="relative group cursor-pointer"
          onClick={() => !isImageUploading && fileInputRef.current?.click()}
        >
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200 relative">
            <img 
              src={formData.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`} 
              alt="Profile" 
              className={`w-full h-full object-cover transition-opacity ${isImageUploading ? 'opacity-50' : 'opacity-100'}`} 
            />
            {isImageUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Loader2 className="animate-spin text-white" size={24} />
              </div>
            )}
          </div>
          
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Upload size={24} className="text-white" />
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
            accept="image/*"
          />
        </div>
        
        <div className="text-center sm:text-left">
          <h3 className="text-xl font-bold text-gray-900">{formData.username || 'User'}</h3>
          <p className="text-gray-500 text-sm">{formData.email}</p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 text-[#557C67] text-sm font-medium hover:underline flex items-center gap-1 mx-auto sm:mx-0"
            disabled={isImageUploading}
          >
            {isImageUploading ? 'Uploading & Saving...' : 'Change Profile Picture'}
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Username</label>
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#557C67] outline-none" 
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#557C67] outline-none" 
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Phone Number</label>
          <div className="relative">
            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="number" 
              placeholder="e.g. 628123456789"
              value={formData.phone_number}
              onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#557C67] outline-none" 
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Date of Birth</label>
          <div className="relative">
            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="date" 
              value={formData.dob}
              onChange={(e) => setFormData({...formData, dob: e.target.value})}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#557C67] outline-none" 
            />
          </div>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">New Password (Optional)</label>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="password" 
              placeholder="Enter new password to update"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#557C67] outline-none" 
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSubmit}
          disabled={isLoading || isImageUploading}
          className="flex items-center gap-2 bg-[#557C67] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-[#456654] transition-all disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Save Profile Details
        </button>
      </div>
    </motion.div>
  );
};

// --- VIEW: CONTACT US ---
const ContactUsView = () => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className="flex flex-col lg:flex-row gap-8"
  >
    <div className="flex-1 space-y-6">
      <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
        <h3 className="text-lg font-bold text-[#557C67] mb-2">Get in touch</h3>
        <p className="text-gray-600 text-sm">We'd love to hear from you. Fill out this form and we'll get back to you shortly.</p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Subject</label>
          <input type="text" placeholder="What can we help you with?" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#557C67] outline-none bg-white" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Message</label>
          <textarea placeholder="Describe your issue or question..." className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#557C67] outline-none bg-white min-h-[200px] resize-none" />
        </div>
      </div>

      <button className="w-full bg-[#557C67] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-[#456654] transition-all flex items-center justify-center gap-2">
        <Send size={20} /> Send Message
      </button>
    </div>
  </motion.div>
);

// --- VIEW: TERMS ---
const TermsView = () => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col"
  >
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Terms and Conditions</h2>
    <div className="prose prose-emerald max-w-none text-gray-600 space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-4 mb-6">
      <p><strong>1. Introduction</strong><br/>Welcome to Finet. By accessing or using our website and services, you agree to be bound by these Terms and Conditions.</p>
      <p><strong>2. User Accounts</strong><br/>You are responsible for maintaining the confidentiality of your account and password.</p>
    </div>
  </motion.div>
);

// --- VIEW: PRIVACY ---
const PrivacyPolicyView = () => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col"
  >
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy Policy</h2>
    <div className="prose prose-emerald max-w-none text-gray-600 space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-4 mb-6">
      <p><strong>1. Information We Collect</strong><br/>We collect information you provide directly to us.</p>
    </div>
  </motion.div>
);

// --- MODAL: LOGOUT CONFIRMATION ---
const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.95, opacity: 0 }} 
        className="bg-white w-full max-w-sm rounded-2xl shadow-2xl relative z-10 p-6 text-center"
      >
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} className="text-red-500" />
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2">Log out of Finet?</h2>
        <p className="text-gray-500 text-sm mb-6">Are you sure you want to log out? You will need to sign in again to access your account.</p>
        
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">Log Out</button>
        </div>
      </motion.div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---

const Settings = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-Logout Interceptor
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('finet_auth_token');
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [navigate]);

  // Fetch User Data
  const fetchProfile = async () => {
    const token = localStorage.getItem('finet_auth_token');
    if (!token) {
      navigate('/login');
      return;
    }
    setAuthToken(token);

    try {
      const res = await axios.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profile = res.data.profile || res.data.data || res.data;
      setUserData(profile);
      localStorage.setItem('finet_user', JSON.stringify(profile));
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const handleLogoutConfirm = () => {
    localStorage.removeItem('finet_auth_token');
    localStorage.removeItem('finet_user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex font-sans overflow-hidden">
      
      <AnimatePresence>
        {isLogoutModalOpen && (
          <LogoutModal 
            isOpen={isLogoutModalOpen} 
            onClose={() => setIsLogoutModalOpen(false)} 
            onConfirm={handleLogoutConfirm} 
          />
        )}
      </AnimatePresence>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
        {/* Header with extra padding for mobile hamburger */}
        <header className="h-20 flex justify-end items-center px-8 bg-[#F1F5F9] shrink-0 border-b border-gray-200 lg:border-none pl-16 lg:pl-8">
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <h3 className="text-gray-800 font-bold text-sm">{userData ? (userData.username || userData.name) : 'User'}</h3>
              <p className="text-gray-500 text-xs font-medium">{userData ? userData.role : 'Member'}</p>
            </div>
            {/* Sync Header Image with UserData */}
            <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border-2 border-white shadow-sm">
              <img 
                src={userData?.profile_image && userData.profile_image !== "string" ? userData.profile_image : `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.username || 'User'}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 pt-0">
          <div className="max-w-7xl mx-auto">
            
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Settings Navigation Panel */}
              <div className="w-full lg:w-64 shrink-0 space-y-2">
                <SettingsTab 
                  icon={User} 
                  label="Edit Profile" 
                  active={activeTab === 'profile'} 
                  onClick={() => setActiveTab('profile')} 
                />
                <SettingsTab 
                  icon={Mail} 
                  label="Contact Us" 
                  active={activeTab === 'contact'} 
                  onClick={() => setActiveTab('contact')} 
                />
                <SettingsTab 
                  icon={FileText} 
                  label="Terms & Condition" 
                  active={activeTab === 'terms'} 
                  onClick={() => setActiveTab('terms')} 
                />
                <SettingsTab 
                  icon={Shield} 
                  label="Privacy Policy" 
                  active={activeTab === 'privacy'} 
                  onClick={() => setActiveTab('privacy')} 
                />
                <SettingsTab 
                  icon={LogOut} 
                  label="Log Out" 
                  isDestructive
                  onClick={() => setIsLogoutModalOpen(true)} 
                />
              </div>

              {/* Content Area */}
              <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 min-h-[600px]">
                <AnimatePresence mode="wait">
                  {activeTab === 'profile' && userData && (
                    <EditProfileView 
                      key="profile" 
                      userData={userData} 
                      token={authToken} 
                      onUpdateSuccess={(silent) => {
                        if (!silent) alert("Profile Updated Successfully!");
                        fetchProfile(); // Re-fetch to update Header Image
                      }}
                    />
                  )}
                  {activeTab === 'contact' && <ContactUsView key="contact" />}
                  {activeTab === 'terms' && <TermsView key="terms" />}
                  {activeTab === 'privacy' && <PrivacyPolicyView key="privacy" />}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;