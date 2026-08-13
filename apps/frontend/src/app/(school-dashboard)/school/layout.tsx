"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCookie, eraseCookie } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { GraduationCap, LogOut, Users, BookOpen, CreditCard, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const role = getCookie('user_role');
    const name = getCookie('user_name');
    if (!role || (role !== 'SchoolAdmin' && role !== 'SchoolSupervisor' && role !== 'SuperAdmin')) {
      router.push('/login');
      return;
    }
    setUserName(name || '');
    setUserRole(role);
  }, [router]);

  function handleLogout() {
    eraseCookie('jwt_token');
    eraseCookie('user_role');
    eraseCookie('user_name');
    router.push('/login');
  }

  const navItems = [
    { name: 'Overview', href: '/school/dashboard', icon: LayoutDashboard },
    { name: 'Students', href: '/school/students', icon: Users },
    { name: 'Grades & Classes', href: '/school/grades', icon: BookOpen },
    { name: 'Billing', href: '/school/billing', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen w-full bg-[#f8f9fc] dark:bg-[#0a0a0a] text-slate-900 dark:text-zinc-100 font-sans flex overflow-hidden selection:bg-purple-100 selection:text-purple-900 dark:selection:bg-purple-900/50 dark:selection:text-purple-200">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white dark:bg-zinc-950 shadow-[1px_0_10px_0_rgba(0,0,0,0.02)] dark:shadow-[1px_0_10px_0_rgba(0,0,0,0.5)] dark:border-r dark:border-zinc-800 flex flex-col z-10 hidden md:flex shrink-0 transition-colors duration-300">
        <div className="p-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950 font-bold shrink-0">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-slate-900 dark:text-zinc-100 truncate tracking-tight">
                UEFP
              </h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
        
        <div className="px-8 pb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-1">Signed in as</p>
          <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300 truncate">{userName}</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname === '/school' && item.href === '/school/dashboard');
            return (
              <Link key={item.name} href={item.href}>
                <span className={`flex items-center gap-3 px-5 py-3.5 rounded-full text-[13px] font-bold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-900 dark:text-purple-400' 
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-900'
                }`}>
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-slate-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full py-6 font-medium text-[13px]"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto z-0 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
