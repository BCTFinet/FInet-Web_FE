import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Newspaper, 
  Settings, 
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Image as ImageIcon,
  Menu,
  Plus,
  X,
  Check,
  Loader2,
  Receipt
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Sidebar from './Sidebar';

// --- CONSTANTS & MOCKS ---
const FRIENDS = [
  { id: 1, name: "Chris", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chris" },
  { id: 2, name: "Stanley", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Stanley" },
  { id: 3, name: "Owen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Owen" },
];

const DEFAULT_RECEIPT_ITEMS = [
  { id: 1, name: "Detroit-Style Pizza", price: 51000, qty: 1, total: 51000 },
  { id: 2, name: "Ice Lemon Tea", price: 8000, qty: 1, total: 8000 },
];

const SPLIT_BILLS = [
  { 
    id: 1, user: "Owen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Owen", date: "10-09-25", total: "Rp 100.000,00",
    items: [
      { name: "Detroit-Style Pizza", qty: "⅓", price: "Rp 17.000" },
      { name: "Lemon Tea", qty: "1", price: "Rp 8.000" },
    ]
  },
];

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

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- COMPONENTS ---

const SplitBillCard = ({ bill }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-[#EAECEB] rounded-2xl p-4 transition-all duration-300 hover:shadow-md border border-transparent hover:border-gray-200">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-3">
          <img src={bill.avatar} alt={bill.user} className="w-10 h-10 rounded-full border border-gray-300 bg-white" />
          <div className="overflow-hidden">
            <p className="text-xs text-gray-600 truncate"><span className="font-bold text-gray-800">{bill.user}</span> sent a bill</p>
            <p className="text-sm font-bold text-gray-900">{bill.total}</p>
          </div>
        </div>
        <div className="text-right shrink-0 ml-2">
          <p className="text-xs text-gray-500 mb-1">{bill.date}</p>
          <div className="flex items-center justify-end text-gray-400">
             {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && bill.items.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-4 pt-4 border-t border-gray-300/50 space-y-2">
              {bill.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-xs">
                  <span className="text-gray-700 flex-1 truncate pr-2">{item.name}</span>
                  <div className="flex gap-2 text-right shrink-0">
                    <span className="text-gray-500 w-8 text-right">x {item.qty}</span>
                    <span className="font-medium text-gray-900 w-16">{item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SuccessModal = ({ isOpen, onClose, message = "Success" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#F1F5F9] w-full max-w-md rounded-3xl shadow-2xl relative z-10 p-8 flex flex-col items-center justify-center min-h-[300px]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
        <h2 className="text-3xl font-bold text-[#6dad83] mb-6">{message}</h2>
        <div className="w-20 h-20 rounded-full border-4 border-[#6dad83] flex items-center justify-center mb-8"><Check size={40} className="text-[#6dad83]" strokeWidth={3} /></div>
        <div className="mt-auto"><img src="/logo.png" alt="FINET" className="h-12 w-auto brightness-0 invert opacity-40" /></div>
      </motion.div>
    </div>
  );
};

// --- ADD TRANSACTION MODAL ---
const AddTransactionModal = ({ isOpen, onClose, initialMode = 'manual', onSuccess, wallets }) => {
  const [mode, setMode] = useState(initialMode); 
  const [scannedImage, setScannedImage] = useState(null);
  
  // Manual Form State
  const [manualForm, setManualForm] = useState({
    wallet_id: wallets.length > 0 ? (wallets[0]._id || wallets[0].id) : '',
    expense_type: 'expense',
    date: getTodayString(),
    price: '',
    name: '',
    category_id: 'Shopping',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleManualSubmit = async () => {
    if(!manualForm.price || !manualForm.name) {
      alert("Please fill in price and title");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('finet_auth_token');
      const newPrice = Number(manualForm.price);
      
      const [y, m, d] = manualForm.date.split('-').map(Number);
      const dateObj = new Date(Date.UTC(y, m - 1, d)); 
      const isoDate = dateObj.toISOString();

      const payload = {
        ...manualForm,
        price: newPrice,
        date: isoDate,
      };

      await axios.post('/expense', payload, { headers: { Authorization: `Bearer ${token}` } });

      const amountDiff = manualForm.expense_type === 'income' ? newPrice : -newPrice;
      const currentWallet = wallets.find(w => (w._id || w.id) === manualForm.wallet_id);
      
      if (currentWallet) {
        const newBalance = Number(currentWallet.balance) + amountDiff;
        await axios.patch(`/wallet/${manualForm.wallet_id}`, 
          { balance: newBalance }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      onClose();
      setTimeout(() => onSuccess("Transaction Added"), 300);

    } catch (err) {
      console.error(err);
      alert("Failed to add transaction");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setScannedImage(reader.result); setMode('scanner-result'); };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Card */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.95, opacity: 0 }} 
        className={`bg-white w-full rounded-3xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] transition-all duration-300 ${['scanner-result'].includes(mode) ? 'max-w-4xl' : 'max-w-xl'}`}
      >
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {mode === 'manual' ? 'Add Transaction' : 'Scan Receipt'}
            </h2>
            <p className="text-gray-500 text-xs mt-1">Keep track of your expenses.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Mode Switcher */}
        {['manual', 'scanner'].includes(mode) && (
          <div className="px-6 pt-4">
            <div className="bg-gray-100 p-1 rounded-xl flex text-sm font-medium relative">
              <button onClick={() => setMode('manual')} className={`flex-1 py-2 rounded-lg z-10 text-center transition-colors ${mode==='manual'?'text-white':'text-gray-500'}`}>Manual Input</button>
              <button onClick={() => setMode('scanner')} className={`flex-1 py-2 rounded-lg z-10 text-center transition-colors ${mode==='scanner'?'text-white':'text-gray-500'}`}>Scanner</button>
              <motion.div 
                className="absolute top-1 bottom-1 bg-[#557C67] rounded-lg shadow-sm" 
                layoutId="pill" 
                initial={false} 
                animate={{ 
                  left: mode==='manual' ? 4 : '50%', 
                  width: 'calc(50% - 4px)' 
                }} 
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            
            {/* MANUAL MODE */}
            {mode === 'manual' && (
              <motion.div key="manual" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                
                {/* Row 1: Wallet & Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Wallet</label>
                    <div className="relative">
                      <select 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#557C67] outline-none appearance-none transition-all"
                        value={manualForm.wallet_id}
                        onChange={(e) => setManualForm({...manualForm, wallet_id: e.target.value})}
                      >
                        {wallets.map(w => <option key={w._id || w.id} value={w._id || w.id}>{w.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Type</label>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      {['expense', 'income'].map(t => (
                         <button 
                           key={t}
                           onClick={() => setManualForm({...manualForm, expense_type: t})}
                           className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${manualForm.expense_type === t ? (t === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'bg-white text-green-600 shadow-sm') : 'text-gray-500'}`}
                         >
                           {t}
                         </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row 2: Nominal */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                    <input 
                      type="number"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#557C67] outline-none text-lg font-bold text-gray-800 placeholder-gray-300" 
                      placeholder="0"
                      value={manualForm.price}
                      onChange={(e) => setManualForm({...manualForm, price: e.target.value})}
                    />
                  </div>
                </div>

                {/* Row 3: Title & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Title</label>
                     <input 
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#557C67] outline-none" 
                        placeholder="e.g. Lunch at McD"
                        value={manualForm.name}
                        onChange={(e) => setManualForm({...manualForm, name: e.target.value})}
                      />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#557C67] outline-none text-sm"
                      value={manualForm.date}
                      onChange={(e) => setManualForm({...manualForm, date: e.target.value})}
                    />
                  </div>
                </div>

                {/* Row 4: Category */}
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                   <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {['Shopping','Food','Transport','Bills','Other'].map(c => (
                        <button
                          key={c}
                          onClick={() => setManualForm({...manualForm, category_id: c})}
                          className={`py-2 rounded-lg text-xs font-medium border transition-all ${manualForm.category_id === c ? 'bg-[#557C67] text-white border-[#557C67]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                          {c}
                        </button>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}

            {/* SCANNER UI */}
            {mode === 'scanner' && (
              <motion.div key="scanner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-6">
                <div 
                  className="w-full aspect-[4/3] bg-gray-50 border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-[#557C67] hover:bg-[#557C67]/5 transition-all group" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ImageIcon size={32} className="text-[#557C67]" />
                  </div>
                  <p className="text-gray-800 font-medium">Click to Upload Receipt</p>
                  <p className="text-gray-400 text-xs mt-1">Supports JPG, PNG</p>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect}/>
                </div>
              </motion.div>
            )}

            {/* SCANNER RESULT (Demo Only) */}
            {mode === 'scanner-result' && (
              <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col md:flex-row gap-6 h-full">
                <div className="w-full md:w-1/2 bg-black rounded-xl overflow-hidden shadow-lg relative aspect-[3/4] md:aspect-auto">
                   <img src={scannedImage || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c"} className="absolute inset-0 w-full h-full object-contain" alt="Receipt" />
                </div>
                <div className="flex-1 flex flex-col">
                   <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 flex-1">
                      <h3 className="font-bold text-gray-700 border-b border-gray-200 pb-2 mb-3">Extracted Items</h3>
                      <div className="space-y-3">
                         {DEFAULT_RECEIPT_ITEMS.map(i => (
                           <div key={i.id} className="flex justify-between text-sm">
                             <span className="text-gray-600">{i.name} <span className="text-xs text-gray-400">x{i.qty}</span></span>
                             <span className="font-medium">Rp {i.price.toLocaleString()}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                   <div className="text-center text-xs text-gray-400 italic">
                     * Scanner functionality coming soon to backend
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-2 bg-white rounded-b-3xl border-t border-gray-100 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
           <button onClick={onClose} className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">Cancel</button>
           <button 
             onClick={mode === 'manual' ? handleManualSubmit : onClose} 
             disabled={isLoading} 
             className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#557C67] text-white font-bold hover:bg-[#456654] transition-all shadow-lg shadow-[#557C67]/20 flex items-center justify-center gap-2"
           >
             {isLoading ? <Loader2 className="animate-spin" size={20}/> : (mode === 'manual' ? 'Save Transaction' : 'Close')}
           </button>
        </div>
      </motion.div>
    </div>
  );
};

const Transaction = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ name: 'User', role: 'User' });
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'manual' });
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  
  // Real Data
  const [wallets, setWallets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);

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

  const fetchData = async () => {
    const token = localStorage.getItem('finet_auth_token');
    if (!token) return navigate('/login');

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const userRes = await axios.get('/auth/profile', config);
      const userProfile = userRes.data.profile || userRes.data.data || userRes.data;
      setUserData(userProfile);

      const walletRes = await axios.get('/wallet', config);
      const walletsData = walletRes.data.data || walletRes.data.wallets || [];
      setWallets(walletsData);
      
      const total = walletsData.reduce((acc, curr) => acc + (Number(curr.balance) || 0), 0);
      setTotalBalance(total);

      const expenseRes = await axios.get('/expense', config);
      const allExpenses = expenseRes.data.expense || expenseRes.data.data || [];
      setExpenses(allExpenses);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, [navigate]);

  const handleSuccess = (msg) => { 
    fetchData(); // Refresh Data
    setIsSuccessOpen(true); 
    setTimeout(() => setIsSuccessOpen(false), 2000); 
  };

  // Group Expenses by Category for UI
  const groupedExpenses = useMemo(() => {
    const groups = {};
    expenses.forEach(e => {
      const cat = e.category_id || 'Other';
      if (!groups[cat]) groups[cat] = { name: cat, total: 0, items: [] };
      
      groups[cat].items.push(e);
      if (e.expense_type === 'expense') groups[cat].total -= Number(e.price);
      else groups[cat].total += Number(e.price);
    });
    return Object.values(groups);
  }, [expenses]);

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex font-sans overflow-hidden">
      <AnimatePresence>
        {modalState.isOpen && <AddTransactionModal key={modalState.mode} isOpen={modalState.isOpen} initialMode={modalState.mode} onClose={() => setModalState({ ...modalState, isOpen: false })} onSuccess={handleSuccess} wallets={wallets} />}
        {isSuccessOpen && <SuccessModal isOpen={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} />}
      </AnimatePresence>

      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 flex justify-end items-center px-4 md:px-8 bg-[#F1F5F9] shrink-0 pl-16 lg:pl-8">
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
               <h3 className="text-gray-800 font-bold text-sm">{userData.username || userData.name}</h3>
               <p className="text-gray-500 text-xs font-medium">{userData.role || 'User'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border-2 border-white shadow-sm">
               <img src={userData.profile_image || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"} alt="Profile" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 pt-0">
          <div className="flex flex-col xl:flex-row gap-8 max-w-[1600px] mx-auto h-full">
            {/* LEFT COLUMN - Sticky on Desktop, Stacked on Mobile */}
            <div className="w-full xl:w-[400px] flex flex-col gap-6 shrink-0">
              {/* Scanner Card */}
              <div className="bg-[#6dad83] rounded-3xl p-8 text-center text-white shadow-lg flex flex-col items-center justify-center gap-4 min-h-[200px] md:min-h-[250px] relative overflow-hidden">
                <div className="relative z-10">
                   <h2 className="text-2xl font-bold mb-2">Snap. Scan. Sorted</h2>
                   <p className="text-white/90 text-sm leading-relaxed max-w-xs mx-auto mb-4">Upload your bill or invoice image...</p>
                   <button onClick={() => setModalState({ isOpen: true, mode: 'scanner' })} className="bg-[#557C67] hover:bg-[#456654] text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 mx-auto">
                     <Receipt size={18} /> Scan My Bills
                   </button>
                </div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              </div>

              {/* Split Bill Card (Demo) */}
              <div className="bg-[#FCFDFD] rounded-3xl p-6 shadow-sm border border-gray-100 flex-1 min-h-[300px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Split Requests</h3>
                  <span className="text-xs bg-[#557C67] text-white px-2 py-0.5 rounded-full">Demo</span>
                </div>
                <div className="space-y-4 overflow-y-auto max-h-[300px] xl:max-h-none custom-scrollbar pr-2">
                  {SPLIT_BILLS.map(bill => <SplitBillCard key={bill.id} bill={bill} />)}
                  <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 text-center text-gray-400 text-sm">
                    No new requests
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - Main Content */}
            <div className="flex-1 bg-[#FCFDFD] rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col overflow-hidden min-h-[500px]">
              <div className="shrink-0 mb-6 border-b border-gray-100 pb-6">
                <div className="flex flex-wrap justify-between items-end gap-4 mb-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Total Balance</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{formatCurrency(totalBalance)}</h2>
                  </div>
                  <button onClick={() => setModalState({ isOpen: true, mode: 'manual' })} className="px-6 py-3 bg-[#557C67] text-white rounded-xl text-sm font-bold hover:bg-[#456654] shadow-lg shadow-[#557C67]/20 flex items-center gap-2 transition-transform active:scale-95">
                    <Plus size={18} /> Add Transaction
                  </button>
                </div>
                
                {/* Balance Bar Visual */}
                <div className="w-full h-3 rounded-full bg-gray-100 flex overflow-hidden">
                  <div className="w-[60%] h-full bg-[#84cc16]"></div>
                  <div className="w-[20%] h-full bg-[#a855f7]"></div>
                  <div className="w-[20%] h-full bg-[#ef4444]"></div>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-gray-500 font-medium">
                   <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#84cc16]"></div> Income</div>
                   <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#ef4444]"></div> Expense</div>
                </div>
              </div>
              
              {/* Transactions List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 md:pr-2">
                <div className="space-y-8">
                  {groupedExpenses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                      <p>No transactions found.</p>
                      <button onClick={() => setModalState({ isOpen: true, mode: 'manual' })} className="text-[#557C67] font-bold text-sm mt-2 hover:underline">Add your first one</button>
                    </div>
                  ) : (
                    groupedExpenses.map(group => (
                      <div key={group.name}>
                        <div className="flex justify-between items-center mb-3 bg-gray-50 p-2 rounded-lg">
                           <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide flex items-center gap-2">
                             <div className="w-2 h-4 bg-[#557C67] rounded-full"></div>
                             {group.name}
                           </h3>
                           <span className={`font-bold text-sm ${group.total >= 0 ? 'text-green-600' : 'text-red-500'}`}>{formatCurrency(group.total)}</span>
                        </div>
                        <div className="space-y-3">
                          {group.items.map(item => (
                            <div key={item._id || item.id} className="flex justify-between items-center group hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 p-3 rounded-xl cursor-pointer transition-all">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.expense_type === 'expense' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                                   {item.expense_type === 'expense' ? <ArrowRightLeft size={16} /> : <TrendingUp size={16} />}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-gray-800 font-bold text-sm truncate">{item.name}</h4>
                                  <p className="text-xs text-gray-400 font-mono mt-0.5">{new Date(item.date).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <span className={`font-bold text-sm whitespace-nowrap ${item.expense_type === 'expense' ? 'text-gray-900' : 'text-green-600'}`}>
                                {item.expense_type === 'expense' ? '-' : '+'}{formatCurrency(item.price)}
                              </span>
                            </div>
                          ))}
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

export default Transaction;