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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-radial from-slate-900 via-zinc-950 to-black px-4 font-sans text-zinc-100 selection:bg-indigo-500/30 overflow-hidden relative py-12">
      
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-[8s]" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-[10s]" />
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      <div className="mb-6 flex items-center gap-3 z-10">
        <div className="w-12 h-12 bg-indigo-950/50 border border-indigo-800/40 rounded-2xl flex items-center justify-center text-indigo-400 shadow-lg">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-zinc-50 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">UEFP</h1>
      </div>

      <Card className="w-full max-w-md bg-zinc-900/60 border-zinc-800 backdrop-blur-xl shadow-2xl rounded-[2rem] overflow-hidden relative group z-10">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-violet-500" />
        
        <CardHeader className="space-y-2 pt-8 pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight text-center text-zinc-200">
            Create Account
          </CardTitle>
          <CardDescription className="text-zinc-500 text-center text-sm font-medium">
            Setup a new user for the platform
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-6">
          {error && (
            <div className="flex items-center gap-2 mb-6 p-4 rounded-2xl bg-red-950/50 border border-red-900/50 text-red-400 text-sm font-medium">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 text-sm font-medium">
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
                    <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 py-6 rounded-2xl shadow-sm transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs font-medium" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john@school.edu"
                        {...field}
                        className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 py-6 rounded-2xl shadow-sm transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs font-medium" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 py-6 rounded-2xl shadow-sm transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs font-medium" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      System Role
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full bg-zinc-800/50 border border-zinc-700 text-zinc-100 focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 px-3 py-3 rounded-2xl shadow-sm transition-all text-sm outline-none appearance-none"
                        style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2371717a%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
                      >
                        <option value="SchoolAdmin" className="bg-zinc-800">SchoolAdmin (Billing/Invoices)</option>
                        <option value="SchoolSupervisor" className="bg-zinc-800">SchoolSupervisor (Dashboard Reader)</option>
                        <option value="BankAdmin" className="bg-zinc-800">BankAdmin (Bank Teller Portal)</option>
                        <option value="SuperAdmin" className="bg-zinc-800">SuperAdmin (All Powers)</option>
                      </select>
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs font-medium" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-zinc-50 font-semibold py-6 rounded-2xl transition-all shadow-lg active:scale-[0.98] mt-4"
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
          <p className="text-sm font-medium text-zinc-500 text-center">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4 decoration-indigo-500/30 hover:decoration-indigo-400"
            >
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
