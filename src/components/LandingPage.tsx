import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Zap, Shield, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SelasarLogo } from './SelasarLogo';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-primary selection:text-black font-sans relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ 
        backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`, 
        backgroundSize: '24px 24px' 
      }} />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-0 z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight mb-6 text-white/90">
              Selamat datang di <span className="inline-block pr-6 font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-300 to-white uppercase italic tracking-tight">Selasar</span><br />
              Galeri Seni Digital Anda
            </h1>
            
            <p className="text-white/40 text-lg md:text-xl max-w-2xl mb-12 font-regular leading-relaxed">
              Bebaskan kreativitas Anda dan ciptakan mahakarya dengan AI di Selasar. Bagikan karya seni digital Anda dengan dunia di galeri unik tempat inovasi bertemu seni.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-6 mb-24">
              <Link 
                to="/dashboard" 
                className="px-8 py-4 bg-white text-black rounded-full font-bold text-sm tracking-tight hover:bg-white/90 transition-all flex items-center gap-2"
              >
                Buat Karya
              </Link>
              <Link 
                to="/gallery" 
                className="px-8 py-4 bg-[#1A1A1A] border border-white/5 text-white rounded-full font-bold text-sm tracking-tight hover:bg-white/5 transition-all flex items-center gap-2 group"
              >
                Jelajahi Galeri
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Art Cards (The Fan) */}
        <div className="relative w-full max-w-6xl mx-auto h-[400px] md:h-[600px] overflow-visible">
          <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 flex items-end justify-center w-full gap-[-50px] md:gap-[-100px]">
            {/* Left Card 2 */}
            <motion.div 
              initial={{ rotate: -25, y: 100, opacity: 0 }}
              animate={{ rotate: -15, y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="w-48 h-64 md:w-72 md:h-96 rounded-3xl overflow-hidden border border-white/10 shadow-2xl -mr-20 z-10 hidden sm:block"
            >
              <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </motion.div>
            
            {/* Left Card 1 */}
            <motion.div 
              initial={{ rotate: -15, y: 80, opacity: 0 }}
              animate={{ rotate: -8, y: -20, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="w-48 h-64 md:w-80 md:h-[450px] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl -mr-16 z-20"
            >
              <img src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=2564&auto=format&fit=crop" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </motion.div>

            {/* Center Card */}
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: -60, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="w-56 h-80 md:w-96 md:h-[550px] rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-[0_0_80px_rgba(255,255,255,0.05)] z-40 relative"
            >
              <img src="https://images.unsplash.com/photo-1633167606207-d840b5070fc2?q=80&w=2564&auto=format&fit=crop" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                <p className="text-white font-bold text-2xl">Sun Chase</p>
                <p className="text-white/40 text-sm">Noah Wilson</p>
              </div>
            </motion.div>

            {/* Right Card 1 */}
            <motion.div 
              initial={{ rotate: 15, y: 80, opacity: 0 }}
              animate={{ rotate: 8, y: -20, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="w-48 h-64 md:w-80 md:h-[450px] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl -ml-16 z-20"
            >
              <img src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2564&auto=format&fit=crop" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </motion.div>

            {/* Right Card 2 */}
            <motion.div 
              initial={{ rotate: 25, y: 100, opacity: 0 }}
              animate={{ rotate: 15, y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="w-48 h-64 md:w-72 md:h-96 rounded-3xl overflow-hidden border border-white/10 shadow-2xl -ml-20 z-10 hidden sm:block"
            >
              <img src="https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=2564&auto=format&fit=crop" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats/Social Proof Section (Subtle) */}
      <section className="relative z-10 py-24 bg-[#0A0A0A] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <p className="text-3xl font-bold mb-1">50rb+</p>
            <p className="text-white/20 text-xs font-bold uppercase tracking-widest">Kreasi</p>
          </div>
          <div>
            <p className="text-3xl font-bold mb-1">12rb+</p>
            <p className="text-white/20 text-xs font-bold uppercase tracking-widest">Seniman</p>
          </div>
          <div>
            <p className="text-3xl font-bold mb-1">80rb</p>
            <p className="text-white/20 text-xs font-bold uppercase tracking-widest">Anggota Global</p>
          </div>
          <div>
            <p className="text-3xl font-bold mb-1">99%</p>
            <p className="text-white/20 text-xs font-bold uppercase tracking-widest">Ulasan Positif</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-40 px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <div className="space-y-10 text-center md:text-left">
            <h2 className="text-4xl md:text-6xl font-bold leading-tight">
              Ruang Pamer <br/> 
              <span className="text-white/40 italic text-3xl md:text-5xl">Imajinasi Tanpa Batas</span>
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Selasar adalah panggung digital bagi para kreator untuk mengekspresikan visi mereka. Kami membangun komunitas di mana setiap karya dihargai dan setiap piksel memiliki cerita.
            </p>
            <div className="flex justify-center md:justify-start gap-4">
              <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold">Inspirasi Global</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold">Koneksi Kreativitas</span>
              </div>
            </div>
          </div>
            <div className="relative aspect-square group">
              <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full animate-pulse group-hover:bg-primary/30 transition-colors" />
                <div className="relative w-full h-full bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden flex items-center justify-center p-8">
                <img 
                  src="https://images.unsplash.com/photo-1642427749670-f20e2e76ed8c?q=80&w=2564&auto=format&fit=crop" 
                  alt="Mandala Digital" 
                  className="w-full h-full object-cover rounded-2xl opacity-80 group-hover:opacity-100 transition-opacity"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent flex flex-col justify-end p-10">
                   <SelasarLogo className="w-14 h-14 mb-4 drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]" />
                   <p className="text-white font-extrabold text-2xl tracking-tighter uppercase italic">Mandala Digital</p>
                   <p className="text-white/50 text-sm font-medium">Manifestasi Imajinasi Tanpa Batas</p>
                </div>
              </div>
            </div>
        </div>
      </section>
    </div>
  );
};
