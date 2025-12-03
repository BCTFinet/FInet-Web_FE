import React, { useState, useEffect } from 'react';
import { 
  Plus,
  Eye,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Check,
  X,
  ChevronDown,
  Loader2,
  Pencil,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Sidebar from './Sidebar';

// --- HELPERS ---
const formatCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return 'Rp 0';
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

// --- CHART COMPONENT ---
const CustomChart = () => {
  const pointsIncome = "0,80 20,50 40,60 60,40 80,50 100,30 120,60 140,40 160,50 180,30 200,60 220,80";
  const pointsExpense = "0,90 20,70 40,85 60,75 80,95 100,60 120,80 140,70 160,85 180,60 200,75 220,95";

  return (
    <div className="w-full h-48 relative mt-6">
      <svg viewBox="0 0 220 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
        {[20, 40, 60, 80, 100].map(y => (
          <line key={y} x1="0" y1={y} x2="220" y2={y} stroke="#e5e7eb" strokeWidth="0.5" />
        ))}
        <path d={`M ${pointsIncome}`} fill="none" stroke="#84cc16" strokeWidth="2" vectorEffect="non-scaling-stroke" className="drop-shadow-sm" />
        <path d={`M ${pointsExpense}`} fill="none" stroke="#ef4444" strokeWidth="2" vectorEffect="non-scaling-stroke" className="drop-shadow-sm" />
      </svg>
      <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
      </div>
    </div>
  );
};

// --- MODAL: SUCCESS ---
const SuccessModal = ({ isOpen, onClose, message = "Success" }) => {
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
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        
        <h2 className="text-3xl font-bold text-[#6dad83] mb-6">{message}</h2>
        
        <div className="w-20 h-20 rounded-full border-4 border-[#6dad83] flex items-center justify-center mb-8">
          <Check size={40} className="text-[#6dad83]" strokeWidth={3} />
        </div>
        
        <div className="mt-auto">
           <img src="/logo.png" alt="FINET" className="h-12 w-auto brightness-0 invert opacity-40" />
        </div>
      </motion.div>
    </div>
  );
};

// --- MODAL: DELETE CONFIRMATION ---
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, walletName, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 p-6 flex flex-col items-center text-center">
        
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle size={32} className="text-red-500" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Wallet?</h3>
        <p className="text-gray-500 mb-6">
          Are you sure you want to delete <span className="font-bold text-gray-800">"{walletName}"</span>? This action cannot be undone.
        </p>

        <div className="flex gap-3 w-full">
           <button onClick={onClose} disabled={isLoading} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">Cancel</button>
           <button onClick={onConfirm} disabled={isLoading} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              Delete
           </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- MODAL: WALLET (CREATE & EDIT) ---
const WalletModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const isEditMode = !!initialData;
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setBalance(initialData.balance?.toString() || '');
    } else {
      setName('');
      setBalance('');
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!name || !balance) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('finet_auth_token');
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' 
        } 
      };
      
      const payload = {
        name: name,
        balance: Number(balance)
      };

      if (isEditMode) {
        await axios.patch(`/wallet/${initialData._id || initialData.id}`, payload, config);
      } else {
        await axios.post('/wallet', payload, config);
      }

      onClose();
      setTimeout(() => onSuccess(isEditMode ? "Wallet Updated" : "Wallet Created"), 300);
    } catch (err) {
      console.error("Wallet Error:", err);
      setError("Failed to save wallet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#F1F5F9] w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="text-center pt-8 pb-4 px-8 bg-[#F1F5F9]">
          <h2 className="text-3xl font-bold text-gray-800 mb-1">{isEditMode ? 'Edit Wallet' : 'Add Wallet'}</h2>
          <p className="text-gray-500 text-sm">Manage your financial portfolio.</p>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar space-y-5 bg-[#F1F5F9]">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Wallet Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Bank Jago" 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#557C67] focus:ring-2 focus:ring-[#557C67]/20 outline-none bg-white text-gray-700" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Currency</label>
              <div className="relative">
                <input type="text" value="(IDR) IDN Rupiah" readOnly className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed outline-none" />
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              {isEditMode ? 'Current Balance' : 'Initial Balance'} <span className="text-red-500">*</span>
            </label>
            <input 
              type="number" 
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="Ex: 1000000" 
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#557C67] focus:ring-2 focus:ring-[#557C67]/20 outline-none bg-white text-gray-700" 
            />
          </div>
        </div>

        <div className="p-6 pt-0 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end items-center bg-[#F1F5F9]">
           <button onClick={onClose} disabled={isLoading} className="w-full sm:w-auto px-8 py-3 rounded-xl border border-[#6dad83] text-[#6dad83] font-medium hover:bg-green-50 transition-colors">Cancel</button>
           <button onClick={handleSubmit} disabled={isLoading} className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#6dad83] text-white font-medium hover:bg-[#558b69] transition-colors shadow-lg shadow-green-900/10 flex items-center justify-center gap-2">
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              {isEditMode ? 'Save Changes' : 'Create Wallet'}
           </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- MODAL: AI FORECASTING ---
const AIForecastingModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;
  const handleSubmit = () => { onClose(); setTimeout(onSuccess, 300); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#F1F5F9] w-full max-w-4xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="text-center pt-8 pb-4 px-8 bg-[#F1F5F9]">
          <h2 className="text-3xl font-bold text-gray-800 mb-1">AI Forecasting</h2>
          <p className="text-gray-500 text-sm">We will help you manage your goals by data.</p>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar bg-[#F1F5F9]">
          <div className="flex justify-center items-center h-40 text-gray-400 italic">
             AI Feature coming soon...
          </div>
        </div>
        <div className="p-6 pt-0 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end items-center bg-[#F1F5F9]">
           <button onClick={onClose} className="w-full sm:w-auto px-8 py-3 rounded-xl border border-[#6dad83] text-[#6dad83] font-medium hover:bg-green-50 transition-colors">Close</button>
           <button onClick={handleSubmit} className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#6dad83] text-white font-medium hover:bg-[#558b69] transition-colors shadow-lg shadow-green-900/10">Generate</button>
        </div>
      </motion.div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ name: 'User', role: 'User' });
  
  // Data States
  const [wallets, setWallets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Modal States
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null); 
  const [deletingWallet, setDeletingWallet] = useState(null); 
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [isAIForecastOpen, setIsAIForecastOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Success");

  const extractArrayData = (response) => {
    if (!response || !response.data) return [];
    if (Array.isArray(response.data)) return response.data;
    if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
    if (response.data.wallets && Array.isArray(response.data.wallets)) return response.data.wallets;
    if (response.data.expenses && Array.isArray(response.data.expenses)) return response.data.expenses;
    return [];
  };

  const fetchData = async () => {
    const token = localStorage.getItem('finet_auth_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setIsLoadingData(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // 1. Fetch User Data from /auth/profile
      try {
        const userRes = await axios.get('/auth/profile', config);
        console.log("User Profile:", userRes.data); // Debug
        
        // --- FIXED: Extract data from 'profile' key based on screenshot ---
        const userProfile = userRes.data.profile || userRes.data.data || userRes.data;
        
        setUserData(userProfile);
        localStorage.setItem('finet_user', JSON.stringify(userProfile));
      } catch (userErr) {
        console.warn("Error fetching user profile:", userErr);
        const storedUser = localStorage.getItem('finet_user');
        if (storedUser) setUserData(JSON.parse(storedUser));
      }

      // 2. Fetch Wallets
      const walletRes = await axios.get('/wallet', config);
      const walletsData = extractArrayData(walletRes);
      setWallets(walletsData);
      
      const total = walletsData.reduce((acc, curr) => {
        const val = Number(curr.balance);
        return acc + (isNaN(val) ? 0 : val);
      }, 0);
      setTotalBalance(total);

      // 3. Fetch Expenses
      const expenseRes = await axios.get('/expense', config);
      const expensesData = extractArrayData(expenseRes);
      setExpenses(expensesData.slice(0, 5));

    } catch (err) {
      console.error("Fetch Data Error:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  // --- HANDLERS ---
  const openCreateWallet = () => {
    setEditingWallet(null);
    setIsWalletModalOpen(true);
  };

  const openEditWallet = (e, wallet) => {
    e.stopPropagation(); 
    setEditingWallet(wallet);
    setIsWalletModalOpen(true);
  };

  const openDeleteWallet = (e, wallet) => {
    e.stopPropagation(); 
    setDeletingWallet(wallet);
  };

  const confirmDeleteWallet = async () => {
    if (!deletingWallet) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('finet_auth_token');
      await axios.delete(`/wallet/${deletingWallet._id || deletingWallet.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDeletingWallet(null);
      handleSuccess("Wallet Deleted");
    } catch (err) {
      console.error("Delete Error", err);
      alert("Failed to delete wallet.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSuccess = (msg = "Success") => {
    setSuccessMessage(msg);
    setIsSuccessOpen(true);
    fetchData();
    setTimeout(() => setIsSuccessOpen(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex font-sans overflow-hidden">
      
      <AnimatePresence>
        {isWalletModalOpen && (
          <WalletModal 
            isOpen={isWalletModalOpen} 
            onClose={() => setIsWalletModalOpen(false)} 
            onSuccess={handleSuccess} 
            initialData={editingWallet}
          />
        )}
        
        {deletingWallet && (
          <DeleteConfirmModal 
            isOpen={!!deletingWallet}
            walletName={deletingWallet.name}
            onClose={() => setDeletingWallet(null)}
            onConfirm={confirmDeleteWallet}
            isLoading={isDeleting}
          />
        )}

        {isAIForecastOpen && <AIForecastingModal isOpen={isAIForecastOpen} onClose={() => setIsAIForecastOpen(false)} onSuccess={() => handleSuccess("Forecast Generated")} />}
        {isSuccessOpen && <SuccessModal isOpen={isSuccessOpen} message={successMessage} onClose={() => setIsSuccessOpen(false)} />}
      </AnimatePresence>

      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 flex justify-end items-center px-8 bg-[#F1F5F9]">
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              {/* Uses real username or fallback */}
              <h3 className="text-gray-800 font-bold text-sm">{userData.username || userData.name || 'User'}</h3>
              <p className="text-gray-500 text-xs font-medium">{userData.role || 'User'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border-2 border-white shadow-sm">
              <img 
                src={(userData.profile_image && userData.profile_image !== "string") ? userData.profile_image : `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username || 'User'}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 pt-0">
          <div className="flex flex-col xl:flex-row gap-8 max-w-[1600px] mx-auto">
            
            {/* LEFT COLUMN */}
            <div className="flex-1 space-y-6 min-w-0">
              
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 bg-[#557C67] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                  <div className="relative z-10">
                    <p className="text-white/80 text-sm font-medium mb-1">Total Balance</p>
                    <div className="flex items-end gap-3">
                      <div className="overflow-x-auto pb-1 -mb-1 max-w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight whitespace-nowrap">
                          {formatCurrency(totalBalance)}
                        </h2>
                      </div>
                      <div className="shrink-0 mb-2">
                         <span className="text-[#a3e635] text-xs sm:text-sm font-bold bg-white/10 px-2 py-1 rounded-lg flex items-center gap-1">
                           + <TrendingUp size={12} />
                         </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button onClick={openCreateWallet} className="sm:w-32 bg-[#557C67] rounded-2xl flex flex-col items-center justify-center gap-2 text-white shadow-lg hover:bg-[#456654] transition-colors p-4 sm:p-0">
                  <div className="p-2 bg-white/10 rounded-full">
                    <Plus size={24} />
                  </div>
                  <span className="text-sm font-medium">Add wallet</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoadingData ? (
                   <div className="col-span-2 text-center text-gray-400 py-10">Loading wallets...</div>
                ) : wallets.length === 0 ? (
                   <div className="col-span-2 text-center text-gray-400 py-10 bg-white rounded-xl border border-dashed border-gray-300">
                     No wallets found. Create one!
                   </div>
                ) : (
                  wallets.map(wallet => (
                    <div 
                      key={wallet._id || wallet.id} 
                      onClick={() => navigate(`/wallet/${wallet._id || wallet.id}`)}
                      className="bg-[#557C67] p-5 rounded-xl text-white shadow-md hover:translate-y-[-2px] transition-transform cursor-pointer group relative"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="font-medium truncate pr-4">{wallet.name}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => openEditWallet(e, wallet)}
                            className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 text-white transition-colors"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button 
                            onClick={(e) => openDeleteWallet(e, wallet)}
                            className="p-1.5 bg-red-500/80 rounded-lg hover:bg-red-500 text-white transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="overflow-x-auto pb-1 -mb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <h3 className="text-xl font-bold mb-4 whitespace-nowrap">{formatCurrency(wallet.balance)}</h3>
                      </div>
                      <button className="text-xs flex items-center gap-1 text-white/70 hover:text-white transition-colors">
                        Details <ChevronRight size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="bg-[#FCFDFD] p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-1">Budget Control</h3>
                <p className="text-xs text-gray-500 mb-4">Monthly Transaction Limit</p>
                <div className="flex justify-between items-end mb-2 flex-wrap gap-2">
                  <span className="text-xl font-bold text-gray-800">Rp. 50.000.000</span>
                  <span className="text-xs text-gray-400">of Rp. 150.000.000</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-[#557C67] h-2.5 rounded-full w-1/3" />
                </div>
              </div>

              <div className="bg-[#E8F5E9] p-6 rounded-2xl border border-[#557C67]/10 relative">
                <div className="flex flex-wrap justify-between items-start mb-4 gap-4">
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#84cc16] p-1.5 rounded-full text-white"><TrendingUp size={14} /></div>
                      <div>
                        <p className="text-[10px] text-gray-500">Income</p>
                        <p className="font-bold text-gray-800">--</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-[#ef4444] p-1.5 rounded-full text-white"><TrendingDown size={14} /></div>
                      <div>
                        <p className="text-[10px] text-gray-500">Expense</p>
                        <p className="font-bold text-gray-800">--</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 bg-white/50 p-1 rounded-lg ml-auto sm:ml-0">
                    <button className="px-3 py-1 text-xs font-medium bg-white shadow-sm rounded-md text-gray-700">Daily</button>
                    <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:bg-white/50 rounded-md">Weekly</button>
                    <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:bg-white/50 rounded-md">Monthly</button>
                  </div>
                </div>
                <CustomChart />
              </div>
            </div>

            <div className="w-full xl:w-96 flex flex-col gap-6">
              
              <div className="bg-[#FCFDFD] p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                <p className="text-sm text-gray-600 mb-2">Wanna see how much you have by the end of the month? Try out our</p>
                <h3 className="text-xl font-bold text-[#557C67] mb-4">AI Expenses Predictor!</h3>
                <button onClick={() => setIsAIForecastOpen(true)} className="w-full bg-[#557C67] text-white py-3 rounded-xl font-medium text-sm hover:bg-[#456654] transition-colors shadow-md">
                  Try now!
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800">Recent Activity</h3>
                  <button className="text-xs font-bold text-gray-400 hover:text-[#557C67]">See All</button>
                </div>
                <div className="relative border-l border-gray-200 ml-2 space-y-8 pb-2">
                  {expenses.length === 0 ? (
                    <p className="text-xs text-gray-400 pl-6">No recent transactions.</p>
                  ) : (
                    expenses.map((activity, idx) => (
                      <div key={activity._id || idx} className="relative pl-6">
                        <div className={`absolute -left-1.5 top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm bg-[#557C67]`}></div>
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-xs font-bold text-gray-800 block mb-0.5">
                              {activity.date ? new Date(activity.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Today'}
                            </span>
                            <h4 className="text-sm font-medium text-gray-700 leading-tight">{activity.title || activity.name || "Expense"}</h4>
                            <p className="text-xs text-gray-400 mt-1">{activity.category || "General"}</p>
                          </div>
                          <span className={`text-xs font-bold whitespace-nowrap text-red-500`}>
                            {formatCurrency(activity.amount)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;