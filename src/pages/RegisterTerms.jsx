import React, { useState } from 'react';
import { ArrowLeft, FileText, Shield, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONTENT COMPONENTS ---

const TermsContent = () => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className="space-y-6"
  >
    <div className="prose prose-emerald max-w-none text-gray-600 space-y-4">
      <h3 className="text-xl font-bold text-gray-900">Terms and Conditions</h3>
      <p><strong>1. Introduction</strong><br/>Welcome to Finet. By accessing or using our website and services, you agree to be bound by these Terms and Conditions.</p>
      
      <p><strong>2. User Accounts</strong><br/>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
      
      <p><strong>3. Privacy Policy</strong><br/>Your use of our services is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.</p>
      
      <p><strong>4. Financial Advice Disclaimer</strong><br/>The content provided on Finet is for informational purposes only and does not constitute professional financial advice. Always consult with a qualified financial advisor before making investment decisions.</p>
      
      <p><strong>5. AI Forecasting</strong><br/>Our AI forecasting features are based on historical data and predictive models. We do not guarantee the accuracy of these predictions and cannot be held liable for any financial losses incurred based on these forecasts.</p>
      
      <p><strong>6. Limitation of Liability</strong><br/>Finet shall not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>
      
      <p><strong>7. Changes to Terms</strong><br/>We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new Terms and Conditions on this page.</p>
      
      <p className="text-sm text-gray-400 pt-4">Last updated: September 2025</p>
    </div>
  </motion.div>
);

const PrivacyContent = () => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className="space-y-6"
  >
    <div className="prose prose-emerald max-w-none text-gray-600 space-y-4">
      <h3 className="text-xl font-bold text-gray-900">Privacy Policy</h3>
      <p><strong>1. Information We Collect</strong><br/>We collect information you provide directly to us, such as when you create an account, use our interactive features, or communicate with us. This may include your name, email address, and financial transaction data.</p>
      
      <p><strong>2. How We Use Your Information</strong><br/>We use the information we collect to operate, maintain, and improve our services, such as providing personalized financial insights and AI-powered forecasting.</p>
      
      <p><strong>3. Data Security</strong><br/>We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing and against accidental loss, destruction, or damage.</p>
      
      <p><strong>4. Sharing of Information</strong><br/>We do not sell your personal information to third parties. We may share information with service providers who perform services on our behalf, but they are not authorized to use or disclose the information except as necessary to perform services on our behalf or comply with legal requirements.</p>
      
      <p><strong>5. Your Rights</strong><br/>You have the right to access, correct, or delete your personal information. You may also have the right to restrict or object to certain processing of your information.</p>
      
      <p><strong>6. Updates to this Policy</strong><br/>We may update this Privacy Policy from time to time. If we make material changes, we will notify you by email or by posting a notice on our website.</p>
      
      <p><strong>7. Contact Us</strong><br/>If you have any questions about this Privacy Policy, please contact us at support@finet.id.</p>

      <p className="text-sm text-gray-400 pt-4">Last updated: October 2025</p>
    </div>
  </motion.div>
);

// --- MAIN PAGE COMPONENT ---

const RegisterTerms = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('terms');

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans flex flex-col">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button 
               onClick={() => navigate('/register')}
               className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors flex items-center gap-2"
             >
               <ArrowLeft size={20} />
               <span className="font-medium text-sm">Back to Register</span>
             </button>
          </div>
          <div className="flex items-center gap-2">
             <img src="/logo.png" alt="Finet" className="h-8 w-auto" />
             <span className="font-bold text-xl text-[#557C67]">FINET</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Legal Information</h1>
            <p className="text-gray-500">Please read our terms and privacy policy carefully.</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex justify-center mb-8">
            <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 inline-flex">
              <button 
                onClick={() => setActiveTab('terms')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all
                  ${activeTab === 'terms' 
                    ? 'bg-[#557C67] text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-50'}
                `}
              >
                <FileText size={18} />
                Terms & Conditions
              </button>
              <button 
                onClick={() => setActiveTab('privacy')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all
                  ${activeTab === 'privacy' 
                    ? 'bg-[#557C67] text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-50'}
                `}
              >
                <Shield size={18} />
                Privacy Policy
              </button>
            </div>
          </div>

          {/* Document Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="h-[600px] overflow-y-auto custom-scrollbar p-8 md:p-12 bg-white">
              <AnimatePresence mode="wait">
                {activeTab === 'terms' ? (
                  <TermsContent key="terms" />
                ) : (
                  <PrivacyContent key="privacy" />
                )}
              </AnimatePresence>
            </div>
            
            {/* Footer Acceptance Area */}
            <div className="bg-gray-50 p-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-gray-600 text-sm">
                <CheckCircle className="text-[#557C67]" size={20} />
                <span>By creating an account, you automatically agree to these terms.</span>
              </div>
              <button 
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-8 py-3 bg-[#557C67] hover:bg-[#456654] text-white font-bold rounded-xl transition-all shadow-lg shadow-green-900/10"
              >
                I Understand
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default RegisterTerms;