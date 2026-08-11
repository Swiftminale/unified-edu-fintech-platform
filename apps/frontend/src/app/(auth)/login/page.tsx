"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiRequest, setCookie } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertCircle, Loader2, GraduationCap } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest('auth/login', {
        method: 'POST',
        body: JSON.stringify(values),
      });

      setCookie('jwt_token', data.accessToken, 1);
      setCookie('user_role', data.user.role, 1);
      setCookie('user_name', data.user.name, 1);

      if (data.user.role === 'BankAdmin') {
        router.push('/bank');
      } else {
        router.push('/school');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8f9fc] px-4 font-sans text-slate-900 selection:bg-purple-100 selection:text-purple-900 relative overflow-hidden">
      
      {/* Decorative Pastel Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-100 rounded-full blur-[100px] pointer-events-none opacity-60" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-50 rounded-full blur-[120px] pointer-events-none opacity-60" />
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-orange-50 rounded-full blur-[80px] pointer-events-none opacity-60" />

      <div className="mb-8 flex items-center gap-3 z-10">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-800">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">UEFP</h1>
      </div>

      <Card className="w-full max-w-md bg-white/80 backdrop-blur-xl border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden relative group z-10">
        
        <CardHeader className="space-y-2 pt-8 pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight text-center text-slate-800">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-slate-500 text-center text-sm font-medium">
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-6">
          {error && (
            <div className="flex items-center gap-2 mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm animate-shake font-medium">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@school.edu"
                        {...field}
                        className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-purple-200 focus-visible:border-purple-400 py-6 rounded-2xl shadow-sm transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs font-medium" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-purple-200 focus-visible:border-purple-400 py-6 rounded-2xl shadow-sm transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs font-medium" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-6 rounded-2xl transition-all shadow-[0_4px_14px_0_rgba(15,23,42,0.15)] active:scale-[0.98] mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col items-center justify-center pb-8 pt-2">
          <p className="text-sm font-medium text-slate-500 text-center">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="text-purple-600 hover:text-purple-700 transition-colors underline underline-offset-4 decoration-purple-200 hover:decoration-purple-600"
            >
              Create Demo Account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
