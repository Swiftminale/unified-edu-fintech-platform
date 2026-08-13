"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCookie, eraseCookie } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Landmark, ArrowRight, ShieldCheck, LogOut } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const token = getCookie('jwt_token');
    const userRole = getCookie('user_role');
    const userName = getCookie('user_name');
    if (token && userRole) {
      setRole(userRole);
      setName(userName);
    }
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8f9fc] px-4 font-sans text-slate-900 selection:bg-purple-100 selection:text-purple-900 relative overflow-hidden">
      
      {/* Decorative Pastel Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-100 rounded-full blur-[100px] pointer-events-none opacity-60" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-50 rounded-full blur-[120px] pointer-events-none opacity-60" />
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-orange-50 rounded-full blur-[80px] pointer-events-none opacity-60" />
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="w-full max-w-4xl space-y-12 z-10 py-12">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-100 text-purple-600 text-xs font-bold uppercase tracking-wider mx-auto">
            <ShieldCheck className="h-4 w-4" />
            Active Security Monitored Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-800 leading-tight">
            Unified Edu-Fintech <br/><span className="text-purple-600">Platform</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            An elegant bridge linking School Administration Services with strictly reconciled Banking Operations.
          </p>
        </div>

        {role ? (
          <Card className="max-w-md mx-auto border-none">
            <CardHeader className="text-center space-y-1 pt-8 pb-4">
              <CardTitle className="text-2xl font-bold text-slate-800">Welcome Back, {name || 'User'}</CardTitle>
              <CardDescription className="text-slate-500 font-medium">
                You are currently logged in as a <span className="text-purple-600 font-bold">{role}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 flex flex-col gap-4">
              <Button
                onClick={() => router.push(role === 'BankAdmin' ? '/bank' : '/school')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 text-base font-bold group flex items-center justify-center gap-2 shadow-lg"
              >
                Go to Dashboard
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  eraseCookie('jwt_token');
                  eraseCookie('user_role');
                  eraseCookie('user_name');
                  window.location.reload();
                }}
                className="w-full py-6 font-bold text-slate-500 hover:text-slate-800 border-slate-200 hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto pt-4">
            <Card className="bg-white/80 backdrop-blur-xl border-white/60 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-2 group">
              <CardHeader className="space-y-4 pt-8">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 border border-purple-200/50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform shadow-sm">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <div className="space-y-1.5">
                  <CardTitle className="text-2xl font-bold text-slate-800">School Portal</CardTitle>
                  <CardDescription className="text-slate-500 font-medium leading-relaxed">
                    Manage student cohorts, classes, billing records, and track active fee collections.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pb-8 pt-4">
                <Link href="/login">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold group py-6 shadow-md">
                    Access Portal
                    <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-xl border-white/60 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-2 group">
              <CardHeader className="space-y-4 pt-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200/50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shadow-sm">
                  <Landmark className="h-7 w-7" />
                </div>
                <div className="space-y-1.5">
                  <CardTitle className="text-2xl font-bold text-slate-800">Bank Portal</CardTitle>
                  <CardDescription className="text-slate-500 font-medium leading-relaxed">
                    Search outstanding invoices, reconcile deposits, and verify real-time bank ledger transactions.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pb-8 pt-4">
                <Link href="/login">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold group py-6 shadow-md">
                    Access Portal
                    <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
