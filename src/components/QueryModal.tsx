"use client";

import { useWallet } from "@/context/WalletContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Briefcase, Check, ArrowRight, CreditCard, Lock, HelpCircle } from "lucide-react";
import { useState } from "react";
import { useFaucet, simulateSwapXlmToBnty, approveEscrow, createQueryOnChain, createTrustline } from "@/lib/stellar";

interface QueryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QueryModal({ isOpen, onClose }: QueryModalProps) {
  const { address, connect } = useWallet();
  const [step, setStep] = useState(0); // 0: Form, 1: Trustline, 2: Swap, 3: Approve, 4: Deploying
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [reward, setReward] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technical");
  const [error, setError] = useState<string | null>(null);

  const handleNextStep = async () => {
    setLoading(true);
    try {
      if (step === 1) {
        await createTrustline();
        await useFaucet();
        setStep(2);
      } else if (step === 2) {
        await simulateSwapXlmToBnty(reward);
        setStep(3);
      } else if (step === 3) {
        await approveEscrow(reward);
        setStep(4);
      } else if (step === 4) {
        const { id, xdr } = await createQueryOnChain(reward, deadline, title, description);
        
        const res = await fetch("/api/queries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            queryId: id,
            poster: address, 
            title,
            category,
            reward,
            deadline: `${deadline} days left`,
            description,
            status: "Active",
            creationTxHash: xdr
          })
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to save query to database");
        }

        if (res.ok) {
          onClose();
          window.location.reload();
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitInitial = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(1);
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
              <h2 className="text-4xl font-black tracking-tight text-slate-900">
                {step === 0 && "Post a Query"}
                {step === 1 && "Network Trust"}
                {step === 2 && "Secure Reward"}
                {step === 3 && "Expert Escrow"}
                {step === 4 && "Publishing"}
              </h2>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X size={28} />
              </button>
            </div>

            {step === 0 ? (
              <form onSubmit={handleSubmitInitial} className="space-y-8 relative">
                {!address && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-[4px] z-10 rounded-3xl flex flex-col items-center justify-center text-center p-8">
                    <HelpCircle size={64} className="text-indigo-500 mb-6" />
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Connect for Work</h3>
                    <p className="text-base text-slate-500 mb-8 max-w-xs">Connect your Stellar wallet to post queries and find experts.</p>
                    <button 
                      type="button"
                      onClick={connect}
                      className="soft-button bg-primary-900 text-white px-10 py-4 text-lg"
                    >
                      Connect Now
                    </button>
                  </div>
                )}
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">What do you need help with?</label>
                  <input 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Need a Python expert for data scraping"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-8 py-5 focus:outline-none focus:border-brand-500 focus:ring-8 focus:ring-brand-500/5 transition-all text-lg font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">Expertise Area</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-8 py-5 focus:outline-none focus:border-brand-500 transition-all appearance-none font-bold text-slate-700 text-lg cursor-pointer"
                    >
                      <option value="Technical">Technical</option>
                      <option value="Creative">Creative</option>
                      <option value="Research">Research</option>
                      <option value="Business">Business</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">Expert Reward (WRKC)</label>
                    <input 
                      type="number"
                      required
                      value={reward}
                      onChange={(e) => setReward(e.target.value)}
                      placeholder="5000"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-8 py-5 focus:outline-none focus:border-brand-500 transition-all text-lg font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">Urgency (Days)</label>
                  <input 
                    type="number"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    placeholder="3"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-8 py-5 focus:outline-none focus:border-brand-500 transition-all text-lg font-bold"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">Query Details</label>
                  <textarea 
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide specific details about the work required..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-8 py-5 focus:outline-none focus:border-brand-500 transition-all resize-none text-lg font-medium"
                  />
                </div>

                <button 
                  disabled={loading}
                  className="w-full py-6 bg-brand-600 hover:bg-brand-700 text-white rounded-3xl font-black text-xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] disabled:opacity-50 shadow-2xl shadow-emerald-200 mt-4"
                >
                  <ArrowRight size={24} />
                  Proceed to Payment Setup
                </button>
              </form>
            ) : (
              <div className="space-y-10">
                <div className="flex justify-between px-4">
                  <StepIndicator current={step} target={1} icon={<Check />} label="Network" />
                  <StepIndicator current={step} target={2} icon={<CreditCard />} label="Reward" />
                  <StepIndicator current={step} target={3} icon={<Lock />} label="Escrow" />
                  <StepIndicator current={step} target={4} icon={<Send />} label="Publish" />
                </div>

                <div className="text-center p-10 bg-slate-50 rounded-[40px] border-2 border-slate-100">
                  <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-8 text-brand-600">
                    {step === 1 && <Check size={48} />}
                    {step === 2 && <CreditCard size={48} />}
                    {step === 3 && <Lock size={48} />}
                    {step === 4 && <Send size={48} />}
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-3">
                    {step === 1 && "Confirm Network Access"}
                    {step === 2 && "Secure Reward Tokens"}
                    {step === 3 && "Authorize Expert Escrow"}
                    {step === 4 && "Publishing Query"}
                  </h3>
                  <p className="text-slate-500 text-lg mb-10 max-w-md mx-auto">
                    {step === 1 && "Sign a transaction to enable work-related token transfers in your wallet."}
                    {step === 2 && `Converting XLM to ${reward} WRKC to secure the expert's reward.`}
                    {step === 3 && "Setting up a trustless escrow to hold the reward until the work is approved."}
                    {step === 4 && "Registering your work query on the Stellar network..."}
                  </p>

                  {error && (
                    <div className="mb-8 p-6 bg-red-50 border-2 border-red-100 rounded-[32px] text-red-500 text-sm font-mono break-all">
                      {error}
                    </div>
                  )}

                  <button 
                    disabled={loading}
                    onClick={handleNextStep}
                    className="w-full py-6 bg-brand-600 hover:bg-brand-700 text-white rounded-3xl font-black text-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-xl"
                  >
                    {loading ? (
                      <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={24} />
                        {step === 4 ? "Finalize & Publish" : "Authenticate Transaction"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StepIndicator({ current, target, icon, label }: any) {
  const active = current >= target;
  const pulse = current === target;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
        active ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-400"
      } ${pulse ? "ring-8 ring-brand-500/10 scale-110" : ""}`}>
        {active && current > target ? <Check size={28} /> : icon}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${active ? "text-slate-900" : "text-slate-400"}`}>{label}</span>
    </div>
  );
}
