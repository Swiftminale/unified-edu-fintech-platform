"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertCircle, Loader2, GraduationCap } from 'lucide-react';

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(['SuperAdmin', 'SchoolSupervisor', 'SchoolAdmin', 'BankAdmin'], {
    errorMap: () => ({ message: "Please select a valid role" })
  }),
});

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'SchoolAdmin',
    },
  });

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    setLoading(true);
    setError(null);
    try {
      await apiRequest('auth/signup', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8f9fc] px-4 font-sans text-slate-900 selection:bg-purple-100 selection:text-purple-900 relative overflow-hidden py-12">
      
      {/* Decorative Pastel Orbs */}
      <div className="absolute top-[-5%] left-[10%] w-[400px] h-[400px] bg-purple-100 rounded-full blur-[100px] pointer-events-none opacity-60" />
      <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[120px] pointer-events-none opacity-60" />
      <div className="absolute top-[30%] left-[-10%] w-[300px] h-[300px] bg-orange-50 rounded-full blur-[80px] pointer-events-none opacity-60" />

      <div className="mb-6 flex items-center gap-3 z-10">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-800">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">UEFP</h1>
      </div>

      <Card className="w-full max-w-md bg-white/80 backdrop-blur-xl border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden relative group z-10">
        
        <CardHeader className="space-y-2 pt-8 pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight text-center text-slate-800">
            Create Account
          </CardTitle>
          <CardDescription className="text-slate-500 text-center text-sm font-medium">
            Setup a new user for the platform
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-6">
          {error && (
            <div className="flex items-center gap-2 mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-medium">
              Account created successfully! Redirecting to login...
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
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
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john@school.edu"
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

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      System Role
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full bg-white border border-slate-200 text-slate-800 focus-visible:ring-2 focus-visible:ring-purple-200 focus-visible:border-purple-400 px-3 py-3 rounded-2xl shadow-sm transition-all text-sm outline-none appearance-none"
                        style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
                      >
                        <option value="SchoolAdmin">SchoolAdmin (Billing/Invoices)</option>
                        <option value="SchoolSupervisor">SchoolSupervisor (Dashboard Reader)</option>
                        <option value="BankAdmin">BankAdmin (Bank Teller Portal)</option>
                        <option value="SuperAdmin">SuperAdmin (All Powers)</option>
                      </select>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs font-medium" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-6 rounded-2xl transition-all shadow-[0_4px_14px_0_rgba(15,23,42,0.15)] active:scale-[0.98] mt-4"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  'Register Account'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-center pb-8 pt-2">
          <p className="text-sm font-medium text-slate-500 text-center">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-purple-600 hover:text-purple-700 transition-colors underline underline-offset-4 decoration-purple-200 hover:decoration-purple-600"
            >
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
