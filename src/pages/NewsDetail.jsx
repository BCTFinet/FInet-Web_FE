import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Newspaper, 
  Settings, 
  ArrowLeft,
  Menu,
  Share2,
  Bookmark,
  Clock,
  User
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- Mock Data ---
const ARTICLE_DATA = {
  id: 1,
  title: "Creating a Clear and Concise Yearly Budgeting Plan",
  category: "Financial Tips",
  author: "Admin",
  role: "Financial Advisor",
  date: "19 September 2025",
  readTime: "4 min read",
  image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000",
  content: [
    { type: 'paragraph', text: "Budgeting doesn't have to be a headache. In fact, a clear and concise yearly budgeting plan is the cornerstone of financial freedom. It allows you to track your spending, identify areas where you can save, and ultimately reach your financial goals faster." },
    { type: 'heading', text: "Why You Need a Yearly Budget" },
    { type: 'paragraph', text: "Many people operate on a month-to-month basis, but looking at the bigger picture is crucial. A yearly budget helps you anticipate large expenses like insurance premiums, holiday gifts, or car maintenance that might otherwise catch you off guard." },
    { type: 'quote', text: "A budget is telling your money where to go instead of wondering where it went." },
    { type: 'paragraph', text: "Start by listing your total expected income for the year. Then, categorize your expenses into 'Needs' (rent, utilities, groceries) and 'Wants' (dining out, entertainment). Don't forget the most important category: 'Savings & Investments'." },
    { type: 'heading', text: "The 50/30/20 Rule" },
    { type: 'paragraph', text: "A popular method is the 50/30/20 rule: 50% of your income goes to needs, 30% to wants, and 20% to savings. Adjust these percentages based on your personal goals and cost of living, but use them as a baseline to ensure you aren't overspending." }
  ]
};

const RELATED_ARTICLES = [
  {
    id: 2,
    title: "Investing 101: How to Start Your Journey",
    category: "Investment",
    date: "20 Sep 2025",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 3,
    title: "Understanding Tax Deductions",
    category: "Taxes",
    date: "21 Sep 2025",
    image: "https://images.unsplash.com/photo-1554224154-260327c00c4b?auto=format&fit=crop&q=80&w=1000"
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

const NewsDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [userData, setUserData] = useState({ name: 'User', role: 'Web Developer' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('finet_auth_token');
    if (!token) navigate('/login');
    
    const storedUser = localStorage.getItem('finet_user');
    if (storedUser) setUserData(JSON.parse(storedUser));
    
    // Scroll to top when opening a new article
    window.scrollTo(0, 0);
  }, [navigate, id]);

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
          <SidebarItem icon={Newspaper} label="News" active onClick={() => navigate('/news')} />
          <SidebarItem icon={Settings} label="Settings" />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
        
        {/* Header */}
        <header className="h-20 flex justify-between items-center px-6 md:px-8 bg-[#F1F5F9] shrink-0 border-b border-gray-200/50">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-600" onClick={() => setSidebarOpen(!sidebarOpen)}>
               <Menu size={24} />
            </button>
            <button 
              onClick={() => navigate('/news')}
              className="flex items-center gap-2 text-gray-500 hover:text-[#557C67] transition-colors font-medium"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to News</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-[#557C67] transition-colors">
              <Bookmark size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-[#557C67] transition-colors">
              <Share2 size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border-2 border-white shadow-sm ml-2">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" />
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <article className="max-w-4xl mx-auto p-6 md:p-10 pb-20">
            
            {/* Hero Image & Category */}
            <div className="relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden shadow-xl mb-10">
              <img 
                src={ARTICLE_DATA.image} 
                alt={ARTICLE_DATA.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
                <span className="inline-block bg-[#557C67] text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                  {ARTICLE_DATA.category}
                </span>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-2">
                  {ARTICLE_DATA.title}
                </h1>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center justify-between gap-6 border-b border-gray-100 pb-8 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Author" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{ARTICLE_DATA.author}</p>
                  <p className="text-xs text-gray-500">{ARTICLE_DATA.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={16} />
                  <span>{ARTICLE_DATA.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{ARTICLE_DATA.readTime}</span>
                </div>
              </div>
            </div>

            {/* Body Text */}
            <div className="prose prose-lg prose-emerald max-w-none text-gray-600 leading-relaxed">
              {ARTICLE_DATA.content.map((block, index) => {
                if (block.type === 'heading') {
                  return <h2 key={index} className="text-2xl font-bold text-gray-900 mt-10 mb-4">{block.text}</h2>;
                }
                if (block.type === 'quote') {
                  return (
                    <blockquote key={index} className="border-l-4 border-[#557C67] pl-6 py-2 my-8 bg-gray-50 rounded-r-xl italic text-gray-800 font-medium">
                      "{block.text}"
                    </blockquote>
                  );
                }
                return <p key={index} className="mb-6">{block.text}</p>;
              })}
            </div>

            {/* Related Articles */}
            <div className="mt-20 pt-10 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">More Like This</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {RELATED_ARTICLES.map(article => (
                  <div 
                    key={article.id} 
                    onClick={() => navigate(`/news/${article.id}`)}
                    className="group cursor-pointer flex gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
                  >
                    <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-[#557C67] text-xs font-bold mb-1 uppercase">{article.category}</span>
                      <h4 className="font-bold text-gray-800 group-hover:text-[#557C67] transition-colors line-clamp-2 mb-2">
                        {article.title}
                      </h4>
                      <span className="text-xs text-gray-400">{article.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </article>
        </div>
      </main>
    </div>
  );
};

// Simple Helper Icon
const CalendarIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

export default NewsDetail;