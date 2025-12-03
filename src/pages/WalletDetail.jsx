import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, MoreHorizontal, Check, X, TrendingUp, TrendingDown, 
  ShoppingBag, Coffee, Car, Zap, Search, Filter, Download, Plus, 
  Trash2, Loader2, Calendar, DollarSign, Tag, FileText
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// --- CONSTANTS ---
const CATEGORIES = [
  { id: 'Shopping', name: 'Shopping', icon: ShoppingBag, color: 'bg-pink-500', textColor: 'text-pink-500' },
  { id: 'Food', name: 'Food & Drink', icon: Coffee, color: 'bg-orange-500', textColor: 'text-orange-500' },
  { id: 'Transport', name: 'Transport', icon: Car, color: 'bg-blue-500', textColor: 'text-blue-500' },
  { id: 'Bills', name: 'Bills', icon: Zap, color: 'bg-purple-500', textColor: 'text-purple-500' },
  { id: 'Other', name: 'Other', icon: MoreHorizontal, color: 'bg-gray-500', textColor: 'text-gray-500' },
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

// Safe Date Parser for Local Date
const parseLocalDate = (dateString) => {
  if (!dateString) return new Date();
  const rawDate = dateString.includes('T') ? dateString.split('T')[0] : dateString;
  const parts = rawDate.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateString);
};

// Helper to get today's date string YYYY-MM-DD
const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- COMPONENTS ---

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

const TransactionModal = ({ isOpen, onClose, onSuccess, initialData, walletId, currentBalance }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category_id: 'Shopping',
    expense_type: 'expense',
    date: getTodayString(),
    note: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (initialData) {
      const safeDate = initialData.date && initialData.date.includes('T') 
        ? initialData.date.split('T')[0] 
        : initialData.date || getTodayString();

      setFormData({
        name: initialData.name || '',
        price: initialData.price || '',
        category_id: initialData.category_id || 'Shopping',
        expense_type: initialData.expense_type || 'expense',
        date: safeDate,
        note: initialData.note || ''
      });
    } else {
      setFormData({
        name: '',
        price: '',
        category_id: 'Shopping',
        expense_type: 'expense',
        date: getTodayString(),
        note: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const updateWalletBalance = async (amountDiff, token) => {
    try {
      // Guard clause: don't update if difference is effectively zero
      if (Math.abs(amountDiff) < 0.01) return;
      
      const newBalance = Number(currentBalance) + Number(amountDiff);
      
      await axios.patch(`/wallet/${walletId}`, 
        { balance: newBalance }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to update wallet balance:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('finet_auth_token');
      const newPrice = Number(formData.price);
      
      // FIX: Force UTC Date to prevent "day before" bug
      // We manually construct the UTC date from the input value YYYY-MM-DD
      const [y, m, d] = formData.date.split('-').map(Number);
      const dateObj = new Date(Date.UTC(y, m - 1, d)); 
      const isoDate = dateObj.toISOString();

      const payload = {
        name: formData.name,
        price: newPrice,
        category_id: formData.category_id,
        expense_type: formData.expense_type,
        date: isoDate,
        note: formData.note,
        wallet_id: walletId
      };

      let amountDiff = 0;

      if (isEdit) {
        // Calculate difference for wallet
        const oldPrice = Number(initialData.price);
        const oldSigned = initialData.expense_type === 'income' ? oldPrice : -oldPrice;
        const newSigned = formData.expense_type === 'income' ? newPrice : -newPrice;
        
        // Diff = New - Old
        amountDiff = newSigned - oldSigned;

        await axios.patch(`/expense/${initialData._id || initialData.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        // Create new
        await axios.post('/expense', payload, { headers: { Authorization: `Bearer ${token}` } });
        
        // For new items: Add full amount to wallet
        amountDiff = formData.expense_type === 'income' ? newPrice : -newPrice;
      }
      
      // Update Wallet Balance if the amount actually changed
      if (amountDiff !== 0) {
        await updateWalletBalance(amountDiff, token);
      }
      
      onClose();
      // Delay success to ensure DB has time to process before refetch
      setTimeout(() => onSuccess(isEdit ? "Transaction Updated" : "Transaction Added"), 300);
    } catch (err) {
      console.error(err);
      alert("Failed to save transaction.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this transaction?")) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('finet_auth_token');
      await axios.delete(`/expense/${initialData._id || initialData.id}`, { headers: { Authorization: `Bearer ${token}` } });
      
      // Revert wallet balance
      const oldPrice = Number(initialData.price);
      const amountDiff = initialData.expense_type === 'income' ? -oldPrice : oldPrice;
      
      await updateWalletBalance(amountDiff, token);

      onClose();
      setTimeout(() => onSuccess("Transaction Deleted"), 300);
    } catch (err) {
      console.error(err);
      alert("Failed to delete.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{isEdit ? 'Edit Transaction' : 'New Transaction'}</h2>
          <button onClick={onClose}><X className="text-gray-400 hover:text-gray-600" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 mb-4">
            {['expense', 'income'].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({...formData, expense_type: type})}
                className={`flex-1 py-3 rounded-xl font-bold capitalize transition-all ${
                  formData.expense_type === type 
                    ? (type === 'expense' ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-green-500 text-white shadow-lg shadow-green-200')
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
              <input 
                type="number" 
                required
                step="any"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#557C67] outline-none font-bold text-lg"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#557C67] outline-none"
              placeholder="e.g. Groceries"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input 
                type="date" 
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#557C67] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                value={formData.category_id}
                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#557C67] outline-none bg-white"
              >
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
            <textarea 
              rows="2"
              value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#557C67] outline-none resize-none"
              placeholder="Additional details..."
            />
          </div>

          <div className="pt-4 flex gap-3">
            {isEdit && (
              <button 
                type="button" 
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-4 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
              >
                {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 size={20} />}
              </button>
            )}
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 py-4 rounded-xl bg-[#557C67] text-white font-bold shadow-lg shadow-[#557C67]/20 hover:bg-[#466554] transition-all active:scale-95 flex justify-center items-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : (isEdit ? 'Save Changes' : 'Add Transaction')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const BarChart = ({ data }) => {
  // Ensure array of 7 numbers
  const arr = Array.isArray(data) ? data.slice(0, 7).map(d => Number(d || 0)) : Array(7).fill(0);
  while (arr.length < 7) arr.unshift(0);

  // Pixel-based scaling for consistent rendering
  const USABLE_PX = 140;

  // Use absolute max to handle negative values if needed
  const max = Math.max(...arr.map(Math.abs)); 
  const safeMax = max === 0 ? 1 : max;

  // Day labels (Ending Today)
  const days = ['S','M','T','W','T','F','S'];
  const labels = [];
  const todayIndex = new Date().getDay();
  for (let i = 6; i >= 0; i--) {
    let dIndex = todayIndex - i;
    if (dIndex < 0) dIndex += 7;
    labels.push(days[dIndex]);
  }

  return (
    <div className="flex items-end justify-between h-40 gap-2 mt-4 px-2">
      {arr.map((amount, i) => {
        // Calculate height in pixels
        const absAmount = Math.abs(amount);
        let barPx = Math.round((absAmount / safeMax) * USABLE_PX);
        
        // Ensure even 0-value bars have a tiny visible line (4px)
        if (absAmount === 0) barPx = 4;
        barPx = Math.max(4, Math.min(barPx, USABLE_PX));

        return (
          <div key={i} className="flex flex-col items-center gap-2 w-full group cursor-pointer">
            <div className="relative w-full flex justify-end flex-col items-center h-full">
              {/* Tooltip */}
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] py-1 px-2 rounded mb-1 whitespace-nowrap z-10 pointer-events-none">
                {formatCurrency(amount)}
              </div>

              {/* Bar */}
              <div
                className={`w-full sm:w-8 rounded-t-lg transition-all duration-500 ${
                  i === 6 ? 'bg-[#557C67]' : 'bg-gray-200 group-hover:bg-[#557C67]/50'
                }`}
                style={{ height: `${barPx}px` }}
              ></div>
            </div>

            {/* Label */}
            <span className={`text-xs font-bold ${i === 6 ? 'text-[#557C67]' : 'text-gray-400'}`}>
              {labels[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const WalletDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // --- STATE ---
  const [wallet, setWallet] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // --- AUTO LOGOUT INTERCEPTOR ---
  // If ANY request fails with 401 Unauthorized, we redirect to login
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.warn("⚠️ Session expired (401). Redirecting to login.");
          localStorage.removeItem('finet_auth_token');
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  // --- DATA FETCHING ---
  const fetchData = async () => {
    const token = localStorage.getItem('finet_auth_token');
    
    // Check if token exists before trying to fetch
    if (!token) { 
      navigate('/login'); 
      return; 
    }

    try {
      setIsLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // 1. Fetch Specific Wallet Details
      let currentWallet = null;
      try {
        const walletRes = await axios.get(`/wallet/${id}`, config);
        currentWallet = walletRes.data.data || walletRes.data.wallet || walletRes.data;
      } catch (err) {
        // Fallback: fetch all and find
        console.warn("Could not fetch single wallet, trying list fallback...");
        const allWalletsRes = await axios.get('/wallet', config);
        const allWallets = allWalletsRes.data.data || allWalletsRes.data || [];
        if (Array.isArray(allWallets)) {
          currentWallet = allWallets.find(w => (w._id || w.id) === id);
        }
      }
      setWallet(currentWallet);

      // 2. Fetch All Expenses
      const expenseRes = await axios.get('/expense', config);
      
      let allExpenses = expenseRes.data.expense || expenseRes.data.data || expenseRes.data || [];
      if (!Array.isArray(allExpenses)) allExpenses = [];

      // Filter & Sort
      const walletExpenses = allExpenses.filter(e => e.wallet_id === id);
      walletExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setExpenses(walletExpenses);

    } catch (err) {
      console.error("Fetch Data Error:", err);
      // NOTE: 401 errors are handled by the interceptor above
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, navigate]);

  // --- CALCULATIONS ---
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    
    // Income/Expense Totals
    expenses.forEach(t => {
      const amt = Number(t.price);
      if (t.expense_type === 'income') income += amt;
      else expense += amt;
    });

    // Spending Activity (Last 7 days)
    const last7Days = Array(7).fill(0);
    const today = new Date();
    today.setHours(0,0,0,0); 

    expenses.forEach(t => {
      if (t.expense_type === 'expense' && t.date) {
        const tDate = parseLocalDate(t.date);
        
        // Use UTC date parts for stable daily difference
        const utc1 = Date.UTC(tDate.getFullYear(), tDate.getMonth(), tDate.getDate());
        const utc2 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
        const diffDays = Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24)); 
        
        if (diffDays >= 0 && diffDays < 7) {
          const index = 6 - diffDays; 
          last7Days[index] += Math.abs(Number(t.price));
        }
      }
    });

    // Top Categories
    const catMap = {};
    let totalExp = 0;
    expenses.forEach(t => {
      if (t.expense_type === 'expense') {
        const cat = t.category_id || 'Other';
        const amt = Number(t.price);
        catMap[cat] = (catMap[cat] || 0) + amt;
        totalExp += amt;
      }
    });

    const categories = Object.keys(catMap).map(key => {
      const config = CATEGORIES.find(c => c.id === key) || CATEGORIES.find(c => c.id === 'Other');
      const absAmount = Math.abs(catMap[key]);
      const absTotal = Math.abs(totalExp);
      return {
        id: key,
        name: config ? config.name : key,
        amount: catMap[key],
        percent: absTotal > 0 ? Math.round((absAmount / absTotal) * 100) : 0,
        color: config ? config.color : 'bg-gray-500',
        icon: config ? config.icon : MoreHorizontal
      };
    }).sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)).slice(0, 4);

    return { income, expense, last7Days, categories };
  }, [expenses]);

  const handleSuccess = (msg) => {
    setSuccessMsg(msg);
    setIsSuccessOpen(true);
    fetchData(); // Refresh data
    setTimeout(() => setIsSuccessOpen(false), 2000);
  };

  const openAdd = () => { setEditingTransaction(null); setIsTransactionModalOpen(true); };
  const openEdit = (t) => { setEditingTransaction(t); setIsTransactionModalOpen(true); };

  if (isLoading) {
    return <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center"><Loader2 className="animate-spin text-[#557C67]" size={40} /></div>;
  }

  if (!wallet) {
    return <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center flex-col gap-4 text-gray-500">
      <p>Wallet not found.</p>
      <button onClick={() => navigate('/dashboard')} className="text-[#557C67] hover:underline">Go Home</button>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans">
      <AnimatePresence>
        {isSuccessOpen && <SuccessModal isOpen={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} message={successMsg} />}
        {isTransactionModalOpen && (
          <TransactionModal 
            isOpen={isTransactionModalOpen} 
            onClose={() => setIsTransactionModalOpen(false)} 
            onSuccess={handleSuccess} 
            initialData={editingTransaction}
            walletId={id}
            currentBalance={wallet.balance} // Pass wallet balance for calculation
          />
        )}
      </AnimatePresence>

      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full hover:bg-gray-100 text-gray-600"><ArrowLeft size={22} /></button>
          <h1 className="text-lg font-bold text-gray-800">{wallet.name} Details</h1>
          <button onClick={openAdd} className="p-2 rounded-full hover:bg-gray-100 text-[#557C67]"><Plus size={24} /></button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Top Section: Card & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Wallet Card */}
            <div className="relative h-60 rounded-3xl overflow-hidden shadow-2xl shadow-[#557C67]/30 group transition-transform hover:scale-[1.02] duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-[#557C67] to-[#2d4639]"></div>
              <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/70 text-sm font-medium tracking-wider">Current Balance</p>
                    <h2 className="text-3xl font-bold mt-1">{formatCurrency(wallet.balance)}</h2>
                  </div>
                  <div className="italic font-bold text-2xl opacity-80">Wallet</div>
                </div>
                {/* Fallback styling for non-card wallets */}
                <div className="flex gap-4 items-center opacity-60">
                  <div className="w-12 h-8 bg-white/10 rounded-md"></div>
                  <span className="font-mono text-lg tracking-widest">**** ****</span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Name</p>
                    <p className="font-medium tracking-wide">{wallet.name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-col gap-4 justify-center">
               <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600"><TrendingUp size={24} /></div>
                   <div><p className="text-gray-500 text-sm font-medium">Total Income</p><h3 className="text-xl font-bold text-gray-900">+{formatCurrency(stats.income)}</h3></div>
                 </div>
               </div>
               <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600"><TrendingDown size={24} /></div>
                   <div><p className="text-gray-500 text-sm font-medium">Total Expense</p><h3 className="text-xl font-bold text-gray-900">-{formatCurrency(Math.abs(stats.expense))}</h3></div>
                 </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart & Categories */}
            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Spending Activity</h3>
                  <p className="text-sm text-gray-500">Last 7 days</p>
                </div>
              </div>
              
              <BarChart data={stats.last7Days} />
              
              <div className="mt-8 space-y-5">
                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Top Categories</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {stats.categories.length === 0 ? <p className="text-gray-400 text-sm italic">No expenses yet.</p> : 
                    stats.categories.map(cat => (
                      <div key={cat.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className={`w-10 h-10 rounded-full ${cat.color} bg-opacity-10 flex items-center justify-center ${cat.color.replace('bg-', 'text-')}`}>
                          <cat.icon size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-bold text-gray-700">{cat.name}</span>
                            <span className="text-sm font-bold text-gray-900">{cat.percent}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className={`${cat.color} h-2 rounded-full`} style={{ width: `${cat.percent}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Transactions</h3>
                <button 
                  onClick={openAdd}
                  className="px-3 py-1.5 bg-[#557C67] text-white text-xs font-bold rounded-lg hover:bg-[#456654] transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                {expenses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <FileText size={48} className="mb-2 opacity-20" />
                    <p className="text-sm">No transactions found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {expenses.map(t => {
                      const catConfig = CATEGORIES.find(c => c.id === t.category_id) || CATEGORIES.find(c => c.id === 'Other');
                      const Icon = catConfig ? catConfig.icon : MoreHorizontal;
                      
                      return (
                        <div key={t._id || t.id} onClick={() => openEdit(t)} className="flex justify-between items-center group cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.expense_type === 'expense' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                              <Icon size={18} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-gray-800 group-hover:text-[#557C67] transition-colors truncate max-w-[120px]">{t.name}</h4>
                              <p className="text-xs text-gray-500">{t.category_id} • {new Date(t.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <span className={`text-sm font-bold ${t.expense_type === 'expense' ? 'text-gray-900' : 'text-green-600'}`}>
                            {t.expense_type === 'expense' ? '-' : '+'}{formatCurrency(t.price)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WalletDetail;