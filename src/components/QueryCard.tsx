"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Clock, Coins, Briefcase, ChevronRight } from "lucide-react";

interface QueryProps {
  title: string;
  reward: string;
  deadline: string;
  poster: string;
  status: string;
  category?: string;
  onSolve?: () => void;
}

export default function QueryCard({ title, reward, deadline, poster, status, category, onSolve }: QueryProps) {
  const isApproved = status === "Approved";
  
  // Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSolve}
      className="soft-card p-7 flex flex-col justify-between h-full bg-white group cursor-pointer border-2 border-slate-100 hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-100/20 transition-colors"
    >
      <div style={{ transform: "translateZ(50px)" }} className="accelerate">
        <div className="flex justify-between items-start mb-5">
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
            isApproved 
              ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
              : "bg-indigo-50 text-indigo-600 border border-indigo-100"
          }`}>
            {isApproved ? "Completed" : "Expert Needed"}
          </div>
          {category && (
            <div className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-100">
              <Briefcase size={12} />
              {category}
            </div>
          )}
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-extrabold text-slate-900 leading-tight group-hover:text-brand-600 transition-colors">
            {title}
          </h3>
          <p className="text-xs text-slate-400 mt-3 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-200"></span>
            Posted by {poster.slice(0, 6)}...{poster.slice(-4)}
          </p>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Expert Reward</span>
            <div className="flex items-center gap-2">
              <Coins size={16} className="text-emerald-500" />
              <span className="text-lg font-black text-slate-900">{reward} BNTY</span>
            </div>
          </div>

          <div className="flex flex-col items-end text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Urgency</span>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              <span className="font-bold text-slate-700 text-sm">{deadline}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
