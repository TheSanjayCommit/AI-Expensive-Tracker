"use client";

import { useState } from "react";
import { Plus, Mic, Camera, PenLine, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function QuickActionHub() {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: <Mic className="w-5 h-5" />, label: "Voice", href: "/add?mode=voice", color: "bg-blue-500" },
    { icon: <Camera className="w-5 h-5" />, label: "Scan", href: "/add?mode=scan", color: "bg-emerald-500" },
    { icon: <PenLine className="w-5 h-5" />, label: "Manual", href: "/add?mode=manual", color: "bg-amber-500" },
  ];

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <div className="absolute bottom-full mb-4 right-0 flex flex-col items-end gap-3">
            {actions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                transition={{ delay: i * 0.1, duration: 0.2 }}
              >
                <Link
                  href={action.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 group"
                >
                  <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 shadow-xl">
                    {action.label}
                  </span>
                  <div className={`${action.color} text-white p-4 rounded-2xl shadow-lg ring-4 ring-white/5 group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-5 rounded-3xl shadow-2xl transition-all duration-300 flex items-center justify-center ${
          isOpen ? 'bg-slate-800 rotate-45 scale-90' : 'bg-primary-600 hover:bg-primary-500 hover:scale-110 glow-primary'
        }`}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <Plus className="w-8 h-8 text-white" />}
      </button>
    </div>
  );
}
