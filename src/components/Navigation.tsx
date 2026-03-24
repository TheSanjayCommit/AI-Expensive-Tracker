"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, ReceiptText, UserCircle } from "lucide-react";
import { User } from "firebase/auth";

interface NavigationProps {
  user: User;
}

export function Navigation({ user }: NavigationProps) {
  const pathname = usePathname();
  
  const navItems = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Add", href: "/add", icon: PlusCircle },
    { name: "Transactions", href: "/transactions", icon: ReceiptText },
    { name: "Profile", href: "/profile", icon: UserCircle },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 glass dark:glass-dark border-r border-white/5 p-6 z-50">
        <div className="mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
             <span className="text-xl">🎙️</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">AI Expense</h1>
        </div>
        
        <div className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? "bg-primary-500/20 text-primary-500" 
                    : "text-foreground/60 hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-primary-500" : "text-foreground/40"}`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto pt-6 border-t border-white/5 flex items-center gap-3 overflow-hidden">
          {user.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full bg-white/10" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 font-bold">
              {user.displayName?.charAt(0) || "U"}
            </div>
          )}
          <div className="flex flex-col truncate">
            <span className="text-sm font-medium truncate">{user.displayName || "User"}</span>
            <span className="text-xs text-foreground/50 truncate">{user.email}</span>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-20 glass dark:glass-dark border-t border-white/5 z-50 flex justify-around items-center px-2 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
             <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isActive ? "text-primary-500" : "text-foreground/50 hover:text-foreground"
              }`}
            >
              <div className={`p-1.5 rounded-full ${isActive ? "bg-primary-500/20" : "bg-transparent"}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
