import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Check, Play, ChevronDown, ChevronUp, Smartphone, 
  BarChart3, ShieldCheck, ScanLine, Instagram, TrendingUp, 
  ArrowRight, Youtube, Globe, Wallet, Zap
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// --- Custom Icons ---
const TikTokIcon = ({ size = 24, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

// --- Animation Helpers ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const GlassCard = ({ children, className = "" }) => (
  <motion.div 
    whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
    className={`bg-white/70 backdrop-blur-lg border border-white/60 shadow-xl rounded-2xl ${className}`}
  >
    {children}
  </motion.div>
);

const GradientBlob = ({ color, className, style }) => (
  <motion.div 
    style={style}
    className={`absolute rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob ${color} ${className}`} 
  />
);

// --- Sub-Components ---

const LandingNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => navigate('/login');
  const handleRegister = () => navigate('/register');

  const scrollToSection = (id) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navLinks = [
    { label: 'Produk', id: 'features' },
    { label: 'Layanan', id: 'intro' },
    { label: 'Harga', id: 'pricing' },
    { label: 'FAQ', id: 'faq' },
    { label: 'Kontak', id: 'footer' },
  ];

  return (
    <>
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-emerald-500 origin-left z-[60]"
        style={{ scaleX: scrollYProgress }}
      />
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/85 backdrop-blur-xl shadow-lg py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => scrollToSection('hero')}
          >
             <img 
               src="/logo.png" 
               alt="FINET" 
               className="h-10 w-auto object-contain" 
               onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
             />
             <div className="hidden bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 rounded-lg text-white shadow-lg shadow-emerald-500/30 group-hover:rotate-12 transition-transform duration-300">
               <TrendingUp size={24} />
             </div>
             <span className="text-2xl font-bold text-emerald-950 tracking-tight">FINET</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            {navLinks.map((item) => (
              <button 
                key={item.label} 
                onClick={() => scrollToSection(item.id)}
                className="relative group hover:text-emerald-700 transition-colors"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button onClick={handleLogin} className="text-emerald-700 font-bold hover:text-emerald-900 transition-colors">Masuk</button>
            <motion.button 
              onClick={handleRegister} 
              whileHover={{ scale: 1.05, backgroundColor: "#047857" }} 
              whileTap={{ scale: 0.95 }} 
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-emerald-600/30 transition-all"
            >
              Daftar
            </motion.button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-gray-700" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: "auto" }} 
              exit={{ opacity: 0, height: 0 }} 
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden shadow-xl"
            >
              <div className="p-6 flex flex-col gap-4">
                {navLinks.map((item) => (
                  <button 
                    key={item.label} 
                    onClick={() => scrollToSection(item.id)}
                    className="text-gray-600 hover:text-emerald-600 font-medium text-lg text-left"
                  >
                    {item.label}
                  </button>
                ))}
                <div className="h-px bg-gray-100 my-2" />
                <button onClick={handleLogin} className="text-emerald-700 font-bold text-left text-lg">Masuk</button>
                <button onClick={handleRegister} className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold shadow-md w-full">Daftar</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

const LandingHero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative min-h-[800px] flex items-center px-6 md:px-12 overflow-hidden pt-20">
      <GradientBlob style={{ y: y1 }} color="bg-purple-300" className="top-0 left-0 w-[500px] h-[500px] -translate-x-1/3 -translate-y-1/3" />
      <GradientBlob style={{ y: y2 }} color="bg-emerald-300" className="bottom-0 right-0 w-[600px] h-[600px] translate-x-1/3 translate-y-1/3" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8 text-center lg:text-left">
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider backdrop-blur-sm mx-auto lg:mx-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Fitur Baru Tersedia v2.0
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
            Kendalikan <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700">Keuangan Anda</span> <br/>
            Hari Ini.
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="text-gray-600 text-lg max-w-lg leading-relaxed mx-auto lg:mx-0">
            Perbankan dengan otak cerdas. Mulai lacak, prediksi, dan kelola kekayaan Anda dengan alat otomatis berbasis AI kami yang canggih.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <motion.button 
              onClick={() => navigate('/login')} // Redirect ke login sesuai request
              whileHover={{ scale: 1.05, translateY: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-emerald-600 text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-emerald-600/40 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 group"
            >
              Mulai Gratis <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, translateY: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/60 backdrop-blur-md text-gray-800 border border-white/60 px-8 py-4 rounded-full font-bold hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Play size={20} className="fill-current text-emerald-600" /> Tonton Demo
            </motion.button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div variants={fadeInUp} className="pt-8 flex items-center gap-4 text-sm text-gray-500 justify-center lg:justify-start">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i*123}`} alt="User" />
                </div>
              ))}
            </div>
            <p>Dipercaya oleh <span className="font-bold text-gray-800">10.000+</span> pengguna</p>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 100, rotate: 5 }} animate={{ opacity: 1, x: 0, rotate: 0 }} transition={{ duration: 1, ease: "easeOut" }} className="relative hidden lg:block">
           <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="relative z-10">
             <GlassCard className="p-3 rotate-[-6deg] hover:rotate-0 transition-transform duration-500 border-2 border-white/50">
               <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                 <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent z-10"></div>
                 <img src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1000" alt="Dashboard" className="w-full h-[450px] object-cover scale-105 hover:scale-110 transition-transform duration-[2s]" />
                 <div className="absolute bottom-8 left-8 z-20 text-white">
                   <p className="text-sm font-medium opacity-90 mb-1">Total Tabungan</p>
                   <div className="flex items-end gap-3">
                    <p className="text-4xl font-bold tracking-tight">Rp 24.500.000</p>
                    <div className="bg-emerald-500/20 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-emerald-300 mb-1.5">+12.5%</div>
                   </div>
                 </div>
               </div>
             </GlassCard>

             {/* Floating Elements */}
             <motion.div animate={{ y: [0, 25, 0], x: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 7, delay: 1, ease: "easeInOut" }} className="absolute -right-12 top-16 z-20">
               <GlassCard className="p-5 flex items-center gap-4 pr-8">
                 <div className="bg-green-100 p-3 rounded-full text-green-600 shadow-inner"><TrendingUp size={24} /></div>
                 <div><p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Pemasukan</p><p className="font-bold text-xl text-emerald-600">+Rp 8.2jt</p></div>
               </GlassCard>
             </motion.div>

             <motion.div animate={{ y: [0, -15, 0], x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 5, delay: 0.5, ease: "easeInOut" }} className="absolute -left-8 bottom-24 z-20">
               <GlassCard className="p-4 flex items-center gap-3 pr-6">
                 <div className="bg-orange-100 p-2.5 rounded-full text-orange-600 shadow-inner"><Zap size={20} /></div>
                 <div><p className="text-xs text-gray-500 font-semibold">Hemat</p><p className="font-bold text-lg text-orange-600">30%</p></div>
               </GlassCard>
             </motion.div>
           </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon: Icon, title, description, index }) => (
  <motion.div 
    variants={fadeInUp}
    className="relative group h-full"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/5 rounded-2xl transform rotate-0 group-hover:rotate-2 transition-transform duration-500 ease-out"></div>
    <div className="h-full bg-white/80 backdrop-blur-xl border border-white/50 p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative z-10 flex flex-col">
      <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">{title}</h3>
      <p className="text-gray-500 leading-relaxed flex-1">{description}</p>
      
      <div className="mt-6 pt-6 border-t border-gray-100 flex items-center text-emerald-600 font-bold text-sm cursor-pointer group/link">
        Pelajari Selengkapnya <ArrowRight size={16} className="ml-2 group-hover/link:translate-x-1 transition-transform" />
      </div>
    </div>
  </motion.div>
);

const FeaturesStrip = () => (
  <section id="features" className="py-24 px-6 md:px-12 relative bg-white/30">
    <div className="max-w-7xl mx-auto">
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <FeatureCard 
          index={0}
          icon={BarChart3}
          title="Prediksi AI Canggih"
          description="Prediksi pengeluaran masa depan dengan akurasi 99% menggunakan algoritma machine learning canggih kami."
        />
        <FeatureCard 
          index={1}
          icon={ShieldCheck}
          title="Keamanan Tingkat Bank"
          description="Data keuangan Anda dienkripsi end-to-end 256-bit. Kami menjamin privasi data Anda 100%."
        />
        <FeatureCard 
          index={2}
          icon={ScanLine}
          title="Laporan Otomatis"
          description="Dapatkan wawasan mingguan otomatis yang dikirim ke email Anda. Pahami pola belanja Anda."
        />
      </motion.div>
    </div>
  </section>
);

const IntroSection = () => (
  <section id="intro" className="py-32 px-6 md:px-12 relative overflow-hidden">
    <div className="absolute top-1/2 right-0 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
    
    <div className="max-w-6xl mx-auto text-center space-y-16 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="space-y-6"
      >
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
          Rasakan Kekuatan <span className="text-emerald-600 underline decoration-emerald-300/50 underline-offset-4">FINET</span>
        </h2>
        <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          Lihat bagaimana dashboard kami menyederhanakan kehidupan keuangan Anda yang kompleks menjadi wawasan yang jelas dan dapat ditindaklanjuti dalam hitungan detik.
        </p>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
        className="relative group cursor-pointer rounded-3xl shadow-2xl shadow-emerald-900/20 overflow-hidden border-[6px] border-white bg-gray-900"
      >
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200" 
          alt="Dashboard Preview" 
          className="w-full opacity-90 transform group-hover:scale-105 transition-transform duration-[1.5s]"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <motion.div 
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="bg-white/90 backdrop-blur-xl p-8 rounded-full shadow-2xl"
          >
            <Play size={48} className="text-emerald-600 ml-1.5" fill="currentColor" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
);

const TierCard = ({ name, price, features, recommended, delay }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: delay }}
      whileHover={{ y: -12, scale: 1.02 }}
      className={`relative flex flex-col p-8 rounded-3xl transition-all duration-500 border
        ${recommended 
          ? 'bg-emerald-900 text-white border-emerald-700 shadow-2xl shadow-emerald-900/40 z-10 ring-4 ring-emerald-500/20' 
          : 'bg-white border-gray-100 text-gray-800 shadow-xl hover:shadow-2xl hover:border-emerald-200'
        }`}
    >
      {recommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1 animate-pulse">
          <Zap size={12} fill="currentColor" /> Paling Populer
        </div>
      )}
      
      <div className="mb-8 text-center border-b border-current/10 pb-6">
        <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 ${recommended ? 'text-emerald-300' : 'text-emerald-600'}`}>
          {name}
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-3xl font-extrabold tracking-tight">{price}</span>
          {price !== 'Rp 0' && <span className={`text-sm font-medium ${recommended ? 'text-emerald-200' : 'text-gray-400'}`}>/bln</span>}
        </div>
      </div>
      
      <div className="flex-1 space-y-4 mb-8">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className={`mt-1 p-0.5 rounded-full ${recommended ? 'bg-emerald-700 text-emerald-300' : 'bg-emerald-100 text-emerald-600'}`}>
               <Check size={12} strokeWidth={3} />
            </div>
            <span className={`text-sm leading-relaxed ${recommended ? 'text-emerald-50' : 'text-gray-600'}`}>
              <strong className={recommended ? "text-white" : "text-gray-900"}>{feature.label}:</strong> {feature.value}
            </span>
          </div>
        ))}
      </div>
      
      <button 
        onClick={() => navigate('/login')} // Redirect ke login untuk semua paket
        className={`w-full py-4 rounded-xl text-sm font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98]
        ${recommended 
          ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white hover:shadow-lg hover:shadow-emerald-500/30' 
          : 'bg-gray-50 text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200'
        }`}
      >
        Pilih {name}
      </button>
    </motion.div>
  );
};

const PricingSection = () => {
  const tiers = [
    {
      name: "Basic",
      price: "Rp 0",
      features: [
        { label: "Portofolio", value: "1 Portofolio" },
        { label: "Split Bill", value: "User Aplikasi" },
        { label: "Input Manual", value: "Unlimited" },
        { label: "Scan Struk", value: "10 scan/bln (+ads)" },
        { label: "Prediksi AI", value: "3 prediksi/bln" },
      ]
    },
    {
      name: "Focus",
      price: "Rp 30rb",
      features: [
        { label: "Portofolio", value: "3 Portofolio" },
        { label: "Split Bill", value: "User Aplikasi" },
        { label: "Input Manual", value: "Unlimited" },
        { label: "Scan Struk", value: "30 scan/bln" },
        { label: "Prediksi AI", value: "10 prediksi/bln" },
      ]
    },
    {
      name: "Clarity",
      price: "Rp 60rb",
      recommended: true,
      features: [
        { label: "Portofolio", value: "10 Portofolio" },
        { label: "Split Bill", value: "User & Guest" },
        { label: "Input Manual", value: "Unlimited" },
        { label: "Scan Struk", value: "80 scan/bln" },
        { label: "Prediksi AI", value: "25 + 3 LLM Report" },
      ]
    },
    {
      name: "Horizon",
      price: "Rp 120rb",
      features: [
        { label: "Portofolio", value: "Unlimited" },
        { label: "Split Bill", value: "User & Guest" },
        { label: "Input Manual", value: "Unlimited" },
        { label: "Scan Struk", value: "200 scan (Fair Use)" },
        { label: "Prediksi AI", value: "Unlimited + 10 LLM" },
      ]
    }
  ];

  return (
    <section id="pricing" className="py-32 px-4 md:px-8 relative bg-gradient-to-b from-white to-emerald-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Pilih Paket Anda</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Harga transparan untuk setiap tahap perjalanan finansial Anda. Batalkan kapan saja.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 items-start">
          {tiers.map((tier, idx) => (
            <TierCard key={idx} {...tier} delay={idx * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      initial={false}
      animate={{ backgroundColor: isOpen ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)" }}
      className="border border-gray-200/60 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-6 text-left gap-4"
      >
        <span className={`font-bold text-lg transition-colors ${isOpen ? 'text-emerald-700' : 'text-gray-800'}`}>
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, type: "spring" }}
          className={`p-2 rounded-full ${isOpen ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-100/50">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQSection = () => (
  <section id="faq" className="py-24 px-6 md:px-12">
    <div className="max-w-3xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Pertanyaan Umum</h2>
        <p className="text-gray-500">Punya pertanyaan? Kami punya jawabannya.</p>
      </div>
      <div className="space-y-4">
        <FAQItem 
          question="Apa itu Finet dan bagaimana cara kerja prediksi AI?" 
          answer="Finet adalah alat pelacak keuangan komprehensif. AI kami menganalisis kebiasaan belanja 12 bulan terakhir dan tagihan rutin Anda untuk memprediksi saldo rekening masa depan Anda dengan akurasi 99%, membantu Anda menghindari defisit sebelum terjadi." 
        />
        <FAQItem 
          question="Apakah kata sandi bank saya aman?" 
          answer="Ya, sangat aman. Kami menggunakan enkripsi tingkat bank 256-bit. Kami tidak pernah melihat atau menyimpan kredensial perbankan Anda; otentikasi ditangani langsung oleh mitra perbankan resmi kami yang teregulasi." 
        />
        <FAQItem 
          question="Bisakah saya mengelola banyak mata uang?" 
          answer="Tentu saja. Finet mendukung lebih dari 140 mata uang dengan pembaruan nilai tukar real-time, sempurna untuk pelancong atau freelancer internasional." 
        />
        <FAQItem 
          question="Apakah ada biaya tersembunyi?" 
          answer="Tidak sama sekali. Harga yang Anda lihat adalah harga yang Anda bayar. Tidak ada biaya setup, tidak ada biaya pembatalan, dan tidak ada biaya transaksi tambahan dari kami." 
        />
      </div>
    </div>
  </section>
);

const LandingFooter = () => (
  <footer id="footer" className="bg-emerald-950 text-white py-24 px-6 md:px-12 relative overflow-hidden">
    {/* Footer Background Glow */}
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
       <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-600/20 rounded-full blur-[120px]"></div>
       <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-600/20 rounded-full blur-[100px]"></div>
    </div>

    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
           <img 
             src="/logo.png" 
             alt="FINET" 
             className="h-10 w-auto object-contain brightness-0 invert" 
             onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
           />
           <div className="hidden bg-emerald-500 p-2 rounded-xl text-white shadow-lg shadow-emerald-500/20">
             <TrendingUp size={28} />
           </div>
           <span className="text-3xl font-bold tracking-wide">FINET</span>
        </div>
        <p className="text-emerald-100/70 leading-relaxed text-sm">
          Memberdayakan perjalanan keuangan Anda dengan kejelasan dan kendali. Bergabunglah dengan ribuan pengguna yang menabung lebih cerdas hari ini.
        </p>
        <div className="flex gap-3 pt-2">
           <a href="https://www.instagram.com/fiinnett/" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-3 rounded-xl hover:bg-emerald-500/80 hover:scale-110 transition-all group">
             <Instagram size={20} className="text-emerald-100 group-hover:text-white" />
           </a>
           <a href="https://www.youtube.com/@FinetAI" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-3 rounded-xl hover:bg-red-600/80 hover:scale-110 transition-all group">
             <Youtube size={20} className="text-emerald-100 group-hover:text-white" />
           </a>
           <a href="https://www.tiktok.com/@fiinnett?_t=ZS-90kTPvK5854&_r=1" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-3 rounded-xl hover:bg-black/80 hover:scale-110 transition-all group">
             <TikTokIcon size={20} className="text-emerald-100 group-hover:text-white" />
           </a>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <h4 className="font-bold text-lg text-white/90">Perusahaan</h4>
        {['Kebijakan Privasi', 'Tentang Kami', 'Karir', 'Hubungi Kami'].map(link => (
          <a key={link} href="/legal" className="text-emerald-100/60 hover:text-emerald-300 hover:translate-x-1 transition-all text-sm">{link}</a>
        ))}
      </div>

      <div className="md:col-span-2">
        <h4 className="font-bold text-xl mb-6">Tetap Terupdate</h4>
        <div className="bg-white/5 p-8 rounded-3xl backdrop-blur-sm border border-white/10 hover:border-emerald-500/30 transition-colors">
          <p className="text-emerald-100/80 mb-6">Berlangganan buletin kami untuk tips keuangan terbaru dan pembaruan fitur.</p>
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="relative flex-1">
              <input 
                type="email" 
                placeholder="Masukkan alamat email Anda" 
                className="w-full px-6 py-4 rounded-xl bg-emerald-900/50 border border-emerald-500/30 text-white placeholder-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
              />
            </div>
            <button className="bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-900/50 hover:shadow-emerald-500/20">
              Langganan
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-emerald-800/50 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-emerald-200/40 text-sm">
      <p>© 2024 FINET Inc. Hak cipta dilindungi undang-undang.</p>
      <div className="flex gap-6 mt-4 md:mt-0">
        <a href="/legal" className="hover:text-emerald-300 transition-colors">Syarat & Ketentuan</a>
        <a href="#" className="hover:text-emerald-300 transition-colors">Keamanan</a>
      </div>
    </div>
  </footer>
);

// --- Main Page ---

export default function LandingPage() {
  const navigate = useNavigate();

  // AUTH CHECK: Cek apakah user sudah login saat Landing Page dimuat
  useEffect(() => {
    const token = localStorage.getItem('finet_auth_token');
    if (token) {
      // Jika ada token, langsung lempar ke dashboard
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen font-sans bg-[#F3F8F3] overflow-x-hidden selection:bg-emerald-200 selection:text-emerald-900">
      <LandingNavbar />
      <LandingHero />
      <FeaturesStrip />
      <IntroSection />
      <PricingSection />
      <FAQSection />
      <LandingFooter />
    </div>
  );
}