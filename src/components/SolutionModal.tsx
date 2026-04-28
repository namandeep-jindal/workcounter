"use client";

import { useWallet } from "@/context/WalletContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, ShieldAlert, Sparkles } from "lucide-react";
import { useState } from "react";
import { submitWorkOnChain, createTrustline } from "@/lib/stellar";

interface SolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  queryId: string;
  queryTitle: string;
}

export default function SolutionModal({ isOpen, onClose, queryId, queryTitle }: SolutionModalProps) {
  const { address, connect } = useWallet();
  const [loading, setLoading] = useState(false);
  const [ipfsLink, setIpfsLink] = useState("");
  const [proofText, setProofText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await createTrustline();
      await submitWorkOnChain(Number(queryId), ipfsLink || "text-only");
      
      const res = await fetch("/api/solutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queryId: queryId,
          expert: address, 
          ipfsLink,
          proofText,
        })
      });

      if (res.ok) {
        onClose();
        alert("Solution submitted successfully! The expert reward is now secured in escrow.");
      }
    } catch (err: any) {
      setError(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
          />
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[48px] p-10 pb-16 z-[101] max-w-2xl mx-auto border-t border-slate-200 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-4xl font-black tracking-tight text-slate-900">Provide Solution</h2>
                <p className="text-slate-500 text-lg mt-2 font-medium">For Query: <span className="text-brand-600 font-bold">{queryTitle}</span></p>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 relative">
              {!address && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[4px] z-10 rounded-3xl flex flex-col items-center justify-center text-center p-8">
                  <ShieldAlert size={64} className="text-amber-500 mb-6" />
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Expert Access Required</h3>
                  <p className="text-base text-slate-500 mb-8 max-w-xs">You must connect your Stellar wallet to submit a solution.</p>
                  <button 
                    type="button"
                    onClick={connect}
                    className="soft-button bg-primary-900 text-white px-10 py-4 text-lg"
                  >
                    Connect Wallet
                  </button>
                </div>
              )}
              
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">Detailed Solution / Answer</label>
                <textarea 
                  rows={6}
                  required
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder="Provide your solution, explanation, or results here..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-8 py-6 focus:outline-none focus:border-brand-500 transition-all resize-none text-lg font-medium"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">Supporting Documentation (URL)</label>
                <input 
                  value={ipfsLink}
                  onChange={(e) => setIpfsLink(e.target.value)}
                  placeholder="Link to Github repo, Google Doc, or IPFS CID"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-8 py-6 focus:outline-none focus:border-brand-500 transition-all text-lg font-bold"
                />
              </div>

              <div className="p-6 bg-brand-50 border-2 border-brand-100 rounded-[32px] flex items-start gap-4">
                <Sparkles className="text-brand-600 mt-1 flex-shrink-0" size={24} />
                <p className="text-sm text-brand-700 leading-relaxed font-semibold">
                  Pro Tip: High-quality solutions with clear explanations are 90% more likely to be approved quickly by the Poster.
                </p>
              </div>

              {error && (
                <div className="p-6 bg-red-50 border-2 border-red-100 rounded-[32px] text-red-500 text-sm font-mono break-all">
                  {error}
                </div>
              )}

              <button 
                disabled={loading}
                className="w-full py-6 bg-brand-600 hover:bg-brand-700 text-white rounded-3xl font-black text-xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] disabled:opacity-50 shadow-2xl shadow-emerald-200 mt-4"
              >
                {loading ? (
                  <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={24} />
                    Submit Solution On-Chain
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
