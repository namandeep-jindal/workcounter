"use client";

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import QueryCard from "@/components/QueryCard";
import QueryModal from "@/components/QueryModal";
import SolutionModal from "@/components/SolutionModal";
import { Plus, Wallet, LayoutDashboard, Sparkles, Search, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { address, connect } = useWallet();
  const router = useRouter();

  // Mouse Parallax Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const springY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  useEffect(() => {
    fetch("/api/queries")
      .then((res) => res.json())
      .then((data) => {
        const queriesList = Array.isArray(data) ? data : [];
        console.log("WorkCounter: Marketplace Data Received", { count: queriesList.length });
        const liveQueries = queriesList.filter((b: any) => b.creationTxHash);
        console.log("WorkCounter: Filtered Live Queries", { count: liveQueries.length });
        setQueries(liveQueries);
        setLoading(false);
      })
      .catch((err) => {
        console.error("WorkCounter: Home Fetch Error", err);
        setLoading(false);
      });
  }, []);

  return (
    <main 
      onMouseMove={handleMouseMove}
      className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] overflow-hidden"
    >
      {/* Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
          animate={{ 
            x: [0, 100, -100, 0],
            y: [0, -100, 100, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-brand-500/5 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, -150, 150, 0],
            y: [0, 150, -150, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[120px]" 
        />
      </div>

      <QueryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <SolutionModal 
        isOpen={isSubModalOpen} 
        onClose={() => setIsSubModalOpen(false)} 
        queryId={selectedQuery?.queryId}
        queryTitle={selectedQuery?.title}
      />

      {/* Left Split: Fixed Hero / Nav */}
      <div className="w-full md:w-[42%] md:fixed md:h-screen p-10 md:p-16 bg-white/40 backdrop-blur-3xl flex flex-col justify-between z-10 border-r border-slate-100/50">
        <div>
          <div className="flex justify-between items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center font-black text-white text-3xl shadow-2xl shadow-emerald-200">
                W
              </div>
              <span className="text-3xl font-black tracking-tighter text-slate-900">WorkCounter</span>
            </motion.div>
            
            {address ? (
              <button 
                onClick={() => router.push('/dashboard')}
                className="soft-button bg-slate-50 text-slate-900 border-2 border-slate-100 hover:bg-slate-100 font-bold"
              >
                <LayoutDashboard size={20} />
                Manage
              </button>
            ) : (
              <button 
                onClick={connect}
                className="soft-button bg-primary-900 text-white shadow-xl shadow-slate-200 hover:bg-slate-800 font-bold"
              >
                <Wallet size={20} />
                Connect
              </button>
            )}
          </div>

          <div className="mt-24 md:mt-32 relative">
            <motion.div 
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              className="relative z-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-brand-100">
                <Sparkles size={14} />
                The Expert Exchange
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 leading-[0.9] mb-10 [text-wrap:balance]">
                Find Answers. <br /> 
                <span className="premium-gradient-text">Fund Expertise.</span>
              </h1>
              <p className="text-slate-500 text-xl md:text-2xl mb-14 max-w-lg leading-relaxed font-medium">
                WorkCounter: The professional marketplace for work queries. Secure rewards on Stellar and collaborate with world-class experts.
              </p>
            </motion.div>
            
            <div className="flex flex-col sm:flex-row gap-4 relative z-20">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="soft-button bg-brand-600 text-white px-10 py-5 text-xl flex items-center justify-center gap-3 shadow-2xl shadow-emerald-200 hover:bg-brand-700 transition-all font-black group"
              >
                <span>Post a Query</span>
                <Plus className="group-hover:rotate-90 transition-transform" size={24} />
              </button>
              <button 
                className="soft-button bg-white text-slate-900 border-2 border-slate-100 px-10 py-5 text-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all font-black"
              >
                <Search size={24} />
                <span>Browse</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="font-bold text-[10px] text-slate-400 uppercase tracking-[0.3em] mt-16 md:mt-0 flex justify-between items-center pt-10 border-t border-slate-100">
          <div className="flex items-center gap-6">
            <span>Stellar Soroban</span>
            <span>Escrow Audited</span>
          </div>
          <span className="flex items-center gap-2 text-emerald-500">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            Live
          </span>
        </div>
      </div>

      {/* Right Split: Scrollable Feed */}
      <div className="w-full md:w-[58%] md:ml-[42%] p-8 md:p-20 bg-[#f8fafc] min-h-screen relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-16 sticky top-0 bg-[#f8fafc]/90 backdrop-blur-xl z-20 py-8">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Active Queries</h2>
            <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest">Global expert network</p>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-slate-100 rounded-3xl shadow-xl shadow-slate-100">
            <div className="w-3 h-3 bg-brand-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            <span className="font-black text-slate-900 text-base">{queries.length} Open</span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-brand-100 border-t-brand-600 rounded-full mb-6" 
              />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing with Stellar...</p>
            </div>
          ) : queries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
              <p className="text-slate-400 font-bold text-xl mb-4">No active queries found.</p>
              <p className="text-slate-300">Be the first to post a query to WorkCounter.</p>
            </div>
          ) : (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              className="space-y-10"
            >
              {queries.map((q, i) => (
                <motion.div
                  key={q.queryId}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <QueryCard 
                    {...q}
                    onSolve={() => {
                      setSelectedQuery(q);
                      setIsSubModalOpen(true);
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
