import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, ReceiptText, UserCircle, LogOut } from "lucide-react";
import { CustomUser } from "@/lib/firebase";
import { useExpenseContext } from "@/context/ExpenseContext";
import { motion } from "framer-motion";

interface NavigationProps {
  user: CustomUser;
}

export function Navigation({ user }: NavigationProps) {
  const pathname = usePathname();
  const { logout } = useExpenseContext();
  
  const navItems = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Add", href: "/add", icon: PlusCircle },
    { name: "Transactions", href: "/transactions", icon: ReceiptText },
    { name: "Profile", href: "/profile", icon: UserCircle },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-72 h-screen fixed left-0 top-0 glass-premium border-r border-white/5 p-8 z-50">
        <div className="mb-12 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/20 group hover:rotate-6 transition-transform">
             <span className="text-2xl">🎙️</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">AI Expense</h1>
            <p className="text-[10px] uppercase tracking-widest text-primary-400 font-bold">Premium Edition</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-bold text-sm relative group \${
                  isActive 
                    ? "text-primary-400" 
                    : "text-foreground/40 hover:text-foreground/80 hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-primary-500/10 border border-primary-500/20 rounded-2xl shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 \${isActive ? "text-primary-500" : "group-hover:text-foreground"}`} />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto flex flex-col gap-6">
          <button 
            onClick={logout}
            className="flex items-center gap-4 px-5 py-3 rounded-2xl text-foreground/40 hover:text-red-400 hover:bg-red-400/5 transition-all font-bold text-sm group"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            Sign Out
          </button>

          <div className="p-4 rounded-3xl bg-white/5 border border-white/5 flex items-center gap-4 overflow-hidden shadow-inner">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500/20 to-blue-500/20 flex flex-shrink-0 items-center justify-center text-primary-400 font-black shadow-lg border border-white/5">
              {user.name?.charAt(0) || "U"}
            </div>
            <div className="flex flex-col truncate min-w-0">
              <span className="text-sm font-black truncate text-white">{user.name || "User"}</span>
              <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest truncate">{user.profession || "Economy Tier"}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-4 left-6 right-6 h-20 glass-premium border border-white/10 z-50 flex justify-around items-center px-4 rounded-[2.5rem] shadow-2xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
             <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 transition-all relative \${
                isActive ? "text-primary-400" : "text-foreground/30 hover:text-foreground/60"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavMobile"
                  className="absolute -inset-1 bg-primary-500/10 rounded-2xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className="w-6 h-6 relative z-10" />
              <span className="text-[9px] font-black uppercase tracking-widest relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

