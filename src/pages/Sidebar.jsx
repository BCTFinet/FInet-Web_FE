import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Newspaper, 
  Settings,
  X,
  Menu
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarItem = ({ icon: Icon, label, path, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === path || (path === '/dashboard' && location.pathname === '/');
  
  return (
    <div 
      onClick={onClick ? onClick : undefined}
      className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-all border-l-4 ${
        isActive 
          ? 'border-white bg-white/10' 
          : 'border-transparent hover:bg-white/5'
      }`}
    >
      <Icon size={24} className="text-white" />
      <span className="text-white font-medium text-lg">{label}</span>
    </div>
  );
};

const SidebarContent = ({ onClose }) => {
  const navigate = useNavigate();
  
  const handleNav = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <>
      <div className="h-24 flex items-center justify-center relative">
        <div className="flex flex-col items-center">
           <img src="/logo.png" alt="FINET" className="h-10 w-auto brightness-0 invert" />
           <span className="text-white text-xs tracking-[0.2em] mt-1 opacity-80">FINET</span>
        </div>
        {/* Close Button inside Drawer */}
        {onClose && (
          <button 
            onClick={onClose} 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white lg:hidden"
          >
            <X size={24} />
          </button>
        )}
      </div>
      <nav className="flex-1 mt-8 space-y-2">
        <SidebarItem 
          icon={LayoutDashboard} 
          label="Dashboard" 
          path="/dashboard" 
          onClick={() => handleNav('/dashboard')} 
        />
        <SidebarItem 
          icon={ArrowRightLeft} 
          label="Transaction" 
          path="/transaction" 
          onClick={() => handleNav('/transaction')} 
        />
        <SidebarItem 
          icon={Newspaper} 
          label="News" 
          path="/news" 
          onClick={() => handleNav('/news')}
        />
        <SidebarItem 
          icon={Settings} 
          label="Settings" 
          path="/settings" 
          onClick={() => handleNav('/settings')} 
        />
      </nav>
    </>
  );
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* MOBILE TRIGGER BUTTON (Floating) */}
      {/* This ensures the menu is accessible on any page that includes <Sidebar /> */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-5 left-4 z-40 p-2 bg-white text-gray-600 rounded-lg shadow-md lg:hidden border border-gray-100 hover:bg-gray-50"
        aria-label="Open Menu"
      >
        <Menu size={24} />
      </button>

      {/* DESKTOP SIDEBAR (Static) */}
      <aside className="w-64 bg-[#557C67] flex-col hidden lg:flex shadow-xl z-20 shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* MOBILE SIDEBAR (Drawer) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
            />
            
            {/* Drawer */}
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-[#557C67] z-[60] flex flex-col shadow-2xl lg:hidden"
            >
              <SidebarContent onClose={() => setIsOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;