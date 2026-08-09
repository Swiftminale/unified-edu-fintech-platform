"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCookie } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Landmark, ArrowRight, ShieldCheck } from 'lucide-react';

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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-radial from-slate-900 via-zinc-950 to-black px-4 font-sans text-zinc-100 selection:bg-indigo-500/30 overflow-hidden relative">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-[8s]" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-[10s]" />
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      <div className="w-full max-w-4xl space-y-8 z-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/40 border border-zinc-700/50 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            Active Security Monitored monorepo monolith
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-50 via-zinc-200 to-zinc-400 bg-clip-text text-transparent leading-none py-2">
            Unified Edu-Fintech Platform
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
            An elegant bridge linking School Administration Services with strictly reconciled Banking Operations.
          </p>
        </div>

        {role ? (
          <Card className="max-w-md mx-auto bg-zinc-900/60 border-zinc-800 backdrop-blur-xl shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-violet-500" />
            <CardHeader className="text-center space-y-1 pt-8">
              <CardTitle className="text-2xl font-bold">Welcome Back, {name || 'User'}</CardTitle>
              <CardDescription className="text-zinc-400 text-sm">
                You are currently logged in as a <span className="text-indigo-400 font-semibold">{role}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 flex flex-col gap-4">
              <Button
                onClick={() => router.push(role === 'BankAdmin' ? '/bank' : '/school')}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-zinc-50 py-6 text-base font-semibold group flex items-center justify-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  document.cookie = 'jwt_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                  document.cookie = 'user_role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                  document.cookie = 'user_name=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                  window.location.reload();
                }}
                className="border-zinc-800 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/40"
              >
                Sign Out / Switch Account
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card className="bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700/80 transition-all duration-300 hover:-translate-y-1 shadow-lg backdrop-blur-sm relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <CardHeader className="space-y-4 pt-8">
                <div className="w-12 h-12 rounded-lg bg-indigo-950/50 border border-indigo-800/40 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold text-zinc-200">School Admin Portal</CardTitle>
                  <CardDescription className="text-zinc-500 text-xs font-light">
                    Manage student cohorts, classes, billing records, and track active fee collections.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pb-8">
                <Link href="/login">
                  <Button className="w-full bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium group py-5 flex items-center justify-center gap-2">
                    Access Portal
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700/80 transition-all duration-300 hover:-translate-y-1 shadow-lg backdrop-blur-sm relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <CardHeader className="space-y-4 pt-8">
                <div className="w-12 h-12 rounded-lg bg-violet-950/50 border border-violet-800/40 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                  <Landmark className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold text-zinc-200">Bank Teller Portal</CardTitle>
                  <CardDescription className="text-zinc-500 text-xs font-light">
                    Search outstanding invoices, reconcile deposits, and verify real-time bank ledger transactions.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pb-8">
                <Link href="/login">
                  <Button className="w-full bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium group py-5 flex items-center justify-center gap-2">
                    Access Portal
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
