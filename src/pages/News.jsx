import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Newspaper, 
  Settings, 
  Search,
  Menu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Mock Data ---
const ARTICLES = [
  {
    id: 1,
    title: "Creating a Clear and Concise Yearly Budgeting Plan",
    category: "Financial Tips",
    author: "Admin",
    date: "19 September 2025",
    readTime: "4 minutes read",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 2,
    title: "Investing 101: How to Start Your Journey",
    category: "Investment",
    author: "Admin",
    date: "20 September 2025",
    readTime: "6 minutes read",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 3,
    title: "Understanding Tax Deductions for Freelancers",
    category: "Taxes",
    author: "Admin",
    date: "21 September 2025",
    readTime: "5 minutes read",
    image: "https://images.unsplash.com/photo-1554224154-260327c00c4b?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 4,
    title: "The Psychology of Spending: Why We Buy What We Buy",
    category: "Behavioral Finance",
    author: "Admin",
    date: "22 September 2025",
    readTime: "7 minutes read",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 5,
    title: "Crypto for Beginners: Risks and Rewards",
    category: "Crypto",
    author: "Admin",
    date: "23 September 2025",
    readTime: "8 minutes read",
    image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 6,
    title: "Saving for Retirement: It's Never Too Early",
    category: "Retirement",
    author: "Admin",
    date: "24 September 2025",
    readTime: "5 minutes read",
    image: "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?auto=format&fit=crop&q=80&w=1000"
  }
];

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-all border-l-4 ${active ? 'border-white bg-white/10' : 'border-transparent hover:bg-white/5'}`}
  >
    <Icon size={24} className="text-white" />
    <span className="text-white font-medium text-lg">{label}</span>
  </div>
);

const NewsCard = ({ article }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/news/${article.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all group flex flex-col h-full cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={article.image} 
          alt={article.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#557C67]">
          {article.category}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-[#557C67] transition-colors">
          {article.title}
        </h3>
        
        <div className="mt-auto space-y-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-medium text-gray-700">{article.author}</span>
            <span>•</span>
            <span>{article.date}</span>
            <span>•</span>
            <span>{article.readTime}</span>
          </div>
          
          <button className="bg-[#6dad83] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#558b69] transition-colors w-fit">
            Read More
          </button>
        </div>
      </div>
    </div>
  );
};

const News = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ name: 'User', role: 'Web Developer' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('finet_auth_token');
    if (!token) navigate('/login');
    
    const storedUser = localStorage.getItem('finet_user');
    if (storedUser) setUserData(JSON.parse(storedUser));
  }, [navigate]);

  const filteredArticles = ARTICLES.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#557C67] flex flex-col shadow-xl transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-24 flex items-center justify-center">
          <div className="flex flex-col items-center">
             <img src="/logo.png" alt="FINET" className="h-10 w-auto brightness-0 invert" />
             <span className="text-white text-xs tracking-[0.2em] mt-1 opacity-80">FINET</span>
          </div>
        </div>

        <nav className="flex-1 mt-8 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" onClick={() => navigate('/dashboard')} />
          <SidebarItem icon={ArrowRightLeft} label="Transaction" onClick={() => navigate('/transaction')} />
          <SidebarItem icon={Newspaper} label="News" active />
          <SidebarItem icon={Settings} label="Settings" onClick={() => navigate('/settings')} />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
        
        {/* Header & Search Bar */}
        <header className="h-auto lg:h-24 flex flex-col lg:flex-row justify-between items-start lg:items-center px-4 lg:px-8 py-4 lg:py-0 bg-[#F1F5F9] shrink-0 gap-4">
          
          {/* Mobile Menu Toggle */}
          <div className="flex items-center justify-between w-full lg:w-auto lg:hidden">
             <button className="text-gray-600" onClick={() => setSidebarOpen(!sidebarOpen)}>
               <Menu size={24} />
             </button>
             <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden border-2 border-white shadow-sm">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" />
             </div>
          </div>

          {/* Search Bar (Centered on Desktop) */}
          <div className="w-full lg:max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search through our news pages" 
              className="w-full pl-12 pr-4 py-3 rounded-xl border-none shadow-sm bg-white text-gray-700 focus:ring-2 focus:ring-[#557C67]/20 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* User Profile (Desktop Only) */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-right">
              <h3 className="text-gray-800 font-bold text-sm">{userData.name}</h3>
              <p className="text-gray-500 text-xs font-medium">{userData.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border-2 border-white shadow-sm">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 pt-0 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-10">
            
            {/* Featured Banner */}
            <div className="bg-[#557C67] rounded-3xl p-8 lg:p-12 text-white shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
              <div className="relative z-10 max-w-2xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">What is Finet?</h1>
                <p className="text-white/90 text-lg leading-relaxed mb-6">
                  Finet is your all-in-one financial companion designed to simplify wealth management. From tracking daily expenses to AI-powered forecasting, we empower you to make smarter financial decisions with clarity and confidence.
                </p>
                <button className="bg-white text-[#557C67] px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors shadow-md">
                  Learn More About Us
                </button>
              </div>
            </div>

            {/* Latest Articles Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Latest Articles</h2>
              
              {filteredArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map(article => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  <p>No articles found matching "{searchQuery}"</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default News;