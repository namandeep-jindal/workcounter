"use client";

import { useWallet } from "@/context/WalletContext";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  Users, 
  DollarSign, 
  ExternalLink, 
  ChevronDown, 
  CheckCircle,
  Trash2,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { approveWorkOnChain } from "@/lib/stellar";

export default function Dashboard() {
  const { address, loading: authLoading, disconnect } = useWallet();
  const [postedQueries, setPostedQueries] = useState<any[]>([]);
  const [solutions, setSolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("queries");
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !address) {
      router.push("/");
    }
  }, [address, authLoading, router]);

  useEffect(() => {
    if (address) {
      const fetchData = async () => {
        try {
          const [bReq, sReq] = await Promise.all([
            fetch(`/api/queries?poster=${address}`),
            fetch(`/api/solutions?hunter=${address}`)
          ]);
          const [bData, sData] = await Promise.all([
            bReq.json(),
            sReq.json()
          ]);
          const queriesList = Array.isArray(bData) ? bData : [];
          const solutionsList = Array.isArray(sData) ? sData : [];
          
          console.log("WorkCounter: Dashboard Data Loaded", { queries: queriesList.length, solutions: solutionsList.length });
          
          // Relaxed filter: show queries even without hash if they exist in DB
          setPostedQueries(queriesList); 
          setSolutions(solutionsList);
        } catch (e: any) {
          console.error("WorkCounter: Dashboard Fetch Error", e);
          alert("Failed to load dashboard data: " + e.message);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [address]);

  const handleDeleteQuery = async (dbId: string) => {
    if (!confirm("Are you sure you want to remove this query? This will hide it from the platform.")) return;
    try {
      const res = await fetch(`/api/queries/${dbId}`, { method: "DELETE" });
      if (res.ok) {
        setPostedQueries(prev => prev.filter(b => b._id !== dbId));
      } else {
        alert("Failed to delete query");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting query");
    }
  };

  const handleApprove = async (subId: string, expert: string, queryId: string | number, onChainIndex: number, amount: string) => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert("Please enter a valid payout amount.");
      return;
    }

    if (queryId === undefined || queryId === null) {
      alert("Error: This query is missing its on-chain ID. It may have been created during a simulation phase. Please create a new query to test payouts.");
      return;
    }

    if (onChainIndex === undefined || onChainIndex === null || isNaN(Number(onChainIndex))) {
      alert("Error: This solution is missing its on-chain index.");
      return;
    }

    if (!confirm(`Are you sure you want to approve this solution? This will release the funds to ${expert}.`)) return;

    try {
      const txResult = await approveWorkOnChain(Number(queryId), Number(onChainIndex), amount);
      const res = await fetch(`/api/solutions/${subId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posterAddress: address })
      });

      if (res.ok) {
        alert("Expert reward released successfully!");
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
      alert("Error approving solution: " + (e as any).message);
    }
  };

  if (authLoading || !address) return null;

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc]">
      
      {/* Left Split: Dashboard Sidebar */}
      <div className="w-full md:w-[38%] md:fixed md:h-screen p-10 md:p-16 border-r border-slate-100 bg-white flex flex-col z-10">
        
        <div className="flex items-center gap-4 mb-20 cursor-pointer group" onClick={() => router.push('/')}>
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white transition-transform group-hover:-translate-x-1">
            <ArrowLeft size={20} />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">Marketplace</span>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-emerald-100">
            W
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">WorkCounter Dashboard</h1>
        </div>

        <div className="mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-slate-100">
            Professional Workspace
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-slate-900 leading-[0.9] mb-10">
            Manage <br /> Your Work.
          </h1>
          <div className="flex gap-2 p-1.5 bg-slate-100 rounded-[28px] border-2 border-slate-100 mb-10">
            <button 
              onClick={() => setActiveTab("queries")}
              className={`px-8 py-3.5 rounded-[22px] font-black text-sm uppercase tracking-widest transition-all ${activeTab === "queries" ? "bg-white text-slate-900 shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-600"}`}
            >
              My Queries
            </button>
            <button 
              onClick={() => setActiveTab("solutions")}
              className={`px-8 py-3.5 rounded-[22px] font-black text-sm uppercase tracking-widest transition-all ${activeTab === "solutions" ? "bg-white text-slate-900 shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-600"}`}
            >
              My Expertise
            </button>
          </div>

          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-10 overflow-hidden shadow-inner">
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-2">Connected Expert</p>
            <p className="text-slate-900 font-mono text-xs break-all font-black">
              {address}
            </p>
          </div>

          <button 
            onClick={disconnect}
            className="soft-button bg-white text-red-500 border-2 border-red-50 hover:bg-red-50 w-full justify-center py-4 font-black text-sm"
          >
            Disconnect Wallet
          </button>
        </div>

        <div className="mt-auto pt-10 border-t border-slate-100">
          <div className="grid grid-cols-2 gap-6">
            <StatCard title="Queries" value={postedQueries.length} icon={<Briefcase className="text-brand-600" />} />
            <StatCard title="Solutions" value={solutions.length} icon={<Sparkles className="text-indigo-500" />} />
          </div>
        </div>

      </div>

      {/* Right Split: Dashboard Content */}
      <div className="w-full md:w-[62%] md:ml-[38%] p-8 md:p-20 bg-[#f8fafc] min-h-screen relative">
        <div className="flex justify-between items-center mb-16 sticky top-0 bg-[#f8fafc]/90 backdrop-blur-xl z-20 py-6">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Active Track</h2>
            <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-widest">Real-time collaboration</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "queries" ? (
            <motion.div 
              key="queries"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 gap-12"
            >
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <Briefcase size={24} className="text-brand-600" />
                    My Posted Queries
                  </h2>
                  <div className="h-1 flex-grow mx-6 bg-slate-100 rounded-full" />
                </div>
                <div className="space-y-6">
                  {postedQueries.length === 0 ? (
                    <EmptyState message="You haven't posted any work queries yet." />
                  ) : (
                    postedQueries.map((b: any, i) => (
                      <DashboardItem 
                        key={i} 
                        title={b.title} 
                        subtitle={b.reward + " WRKC Reward"} 
                        status={b.status === "Active" ? "Open" : b.status} 
                        queryId={b.queryId}
                        dbId={b._id}
                        isPoster={true}
                        onApprove={handleApprove}
                        onDelete={handleDeleteQuery}
                      />
                    ))
                  )}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div 
              key="solutions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 gap-12"
            >
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <Sparkles size={24} className="text-indigo-500" />
                    My Expertise History
                  </h2>
                  <div className="h-1 flex-grow mx-6 bg-slate-100 rounded-full" />
                </div>
                <div className="space-y-6">
                  {solutions.length === 0 ? (
                    <EmptyState message="You haven't provided any expert solutions yet." />
                  ) : (
                    solutions.map((s: any, i) => (
                      <DashboardItem 
                        key={i} 
                        title={s.proofText ? (s.proofText.slice(0, 45) + "...") : (s.ipfsLink?.slice(0, 45) + "...")} 
                        subtitle={"Query Ref: #" + s.queryId} 
                        status={s.approved ? "Approved" : "Pending Verification"} 
                        link={s.ipfsLink}
                      />
                    ))
                  )}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      className="p-6 bg-white rounded-3xl border-2 border-slate-50 shadow-xl shadow-slate-200/30 group transition-colors hover:border-brand-500/50"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center transition-colors group-hover:bg-brand-50">
          {icon}
        </div>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{title}</p>
      </div>
      <p className="text-3xl font-black text-slate-900">{value}</p>
    </motion.div>
  );
}

function DashboardItem({ title, subtitle, status, link, queryId, dbId, isPoster, onApprove, onDelete }: any) {
  const [showSubs, setShowSubs] = useState(false);
  const [subs, setSubs] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [payoutAmounts, setPayoutAmounts] = useState<Record<string, string>>({});

  const fetchSubs = async () => {
    if (!showSubs && isPoster && queryId !== undefined && queryId !== null) {
      setLoadingSubs(true);
      try {
        console.log(`WorkCounter: Fetching submissions for query #${queryId}`);
        const res = await fetch(`/api/solutions?queryId=${queryId}`);
        const data = await res.json();
        console.log(`WorkCounter: Received ${Array.isArray(data) ? data.length : 0} submissions`);
        setSubs(Array.isArray(data) ? data : []);
      } catch (e: any) {
        console.error("WorkCounter: Fetch Subs Error", e);
      } finally {
        setLoadingSubs(false);
      }
    }
    setShowSubs(!showSubs);
  };

  return (
    <div className="space-y-3">
      <div 
        onClick={fetchSubs}
        className="soft-card !p-6 flex justify-between items-center group cursor-pointer border-2 hover:border-brand-500 shadow-lg shadow-slate-100/50"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
            {isPoster ? <Briefcase size={24} /> : <Sparkles size={24} />}
          </div>
          <div>
            <h4 className="font-black text-slate-900 group-hover:text-brand-600 transition-colors flex items-center gap-2 text-lg">
              {title}
              {(link || isPoster) && <ExternalLink size={14} className="text-slate-300" />}
            </h4>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-[0.2em]">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${
            status === "Approved" || status === "Open" 
              ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
              : "bg-indigo-50 text-indigo-600 border border-indigo-100"
          }`}>
            {status}
          </div>
          {isPoster && onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(dbId); }}
              className="p-2.5 hover:bg-red-50 text-red-400 rounded-xl transition-colors border-2 border-transparent hover:border-red-100"
              title="Remove Query"
            >
              <Trash2 size={18} />
            </button>
          )}
          {isPoster && (
            <ChevronDown size={22} className={`text-slate-300 transition-transform ${showSubs ? "rotate-180" : ""}`} />
          )}
        </div>
      </div>

      {showSubs && isPoster && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="pl-8 space-y-4 overflow-hidden mt-4"
        >
          {loadingSubs ? (
            <div className="text-sm text-slate-400 font-bold animate-pulse py-4">Searching for expert solutions...</div>
          ) : subs.length === 0 ? (
            <div className="text-sm text-slate-400 italic py-4 font-medium px-6 border-l-4 border-slate-100">No solutions provided by experts yet.</div>
          ) : (
            subs.map((s, i) => (
               <div key={i} className="bg-white border-2 border-slate-100 p-8 rounded-[32px] shadow-xl shadow-slate-200/40 flex flex-col gap-6 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Expert ID</p>
                    <p className="text-sm font-black text-slate-900 bg-slate-50 px-4 py-2 rounded-xl inline-block">{s.expert?.slice(0, 12)}...{s.expert?.slice(-12)}</p>
                    <div className="mt-6">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Solution Narrative</p>
                       <p className="text-base text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 font-medium italic">
                        "{s.proofText || "The expert provided a direct solution without additional notes."}"
                      </p>
                    </div>
                  </div>
                  {s.approved && (
                    <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full uppercase tracking-widest flex items-center gap-2 shadow-sm">
                      <CheckCircle size={14} />
                      Selected Expert
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-4 pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-6">
                    {s.ipfsLink && (
                      <a href={s.ipfsLink} target="_blank" className="text-xs font-black text-brand-600 hover:text-brand-700 flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ExternalLink size={16} />
                        </div>
                        View Full Solution
                      </a>
                    )}
                  </div>
                  
                  {!s.approved && status !== "Approved" && (
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">$</span>
                        <input 
                          type="number"
                          placeholder="Amount"
                          value={payoutAmounts[s._id] || ""}
                          onChange={(e) => setPayoutAmounts(prev => ({ ...prev, [s._id]: e.target.value }))}
                          className="bg-slate-50 border-2 border-slate-100 rounded-2xl pl-8 pr-4 py-3 text-sm w-32 focus:outline-none focus:border-brand-500 font-black"
                        />
                      </div>
                      <button 
                        onClick={() => onApprove(s._id, s.expert, queryId, s.onChainIndex, payoutAmounts[s._id])}
                        className="bg-brand-600 text-white text-xs font-black px-8 py-3.5 rounded-2xl hover:bg-brand-700 transition-all shadow-xl shadow-emerald-100 active:scale-[0.98]"
                      >
                        Approve & Pay Expert
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="border-4 border-dashed border-slate-100 rounded-[40px] p-16 text-center">
      <p className="text-slate-400 font-black text-sm uppercase tracking-widest">{message}</p>
    </div>
  );
}

