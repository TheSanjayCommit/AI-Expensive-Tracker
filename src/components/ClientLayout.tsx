"use client";

import { loginWithGoogle } from "@/lib/firebase";
import { Navigation } from "./Navigation";
import { useExpenseContext } from "@/context/ExpenseContext";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useExpenseContext();

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-foreground/50">Loading AI Expense Tracker...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen relative p-6 sm:p-12 flex flex-col items-center justify-center overflow-hidden bg-black text-white">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] translate-x-1/3" />
        
        <div className="glass dark:glass-dark rounded-3xl p-12 text-center shadow-2xl relative z-10 max-w-md w-full border border-white/10 animate-in zoom-in-95 duration-700">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-blue-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-primary-500/30 mb-8 border border-white/20">
             <span className="text-4xl">🎙️</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 tracking-tight bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent">AI Expense</h1>
          <p className="text-foreground/60 mb-10 leading-relaxed font-medium">Log your expenses with just your voice. Cloud synced across all your devices seamlessly.</p>
          <button 
            onClick={loginWithGoogle}
            className="w-full py-4 px-6 rounded-2xl bg-white text-black font-bold text-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:-translate-y-1"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </main>
    );
  }

  // Authenticated Layout
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans selection:bg-primary-500/30">
      <Navigation user={user!} />
      <main className="flex-1 h-screen overflow-y-auto w-full md:pl-64 pb-24 md:pb-0 relative">
        {/* Subtle global background blobs */}
        <div className="fixed top-0 left-64 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="fixed top-1/2 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] translate-x-1/3 pointer-events-none" />
        
        <div className="p-6 md:p-10 max-w-6xl mx-auto relative z-10 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
