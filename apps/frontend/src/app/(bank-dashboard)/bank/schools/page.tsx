"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, getCookie } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Landmark, ArrowLeft, Plus, Loader2, School as SchoolIcon, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function SchoolsDashboard() {
  const router = useRouter();
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [supervisorEmail, setSupervisorEmail] = useState('');
  const [supervisorPassword, setSupervisorPassword] = useState('');

  useEffect(() => {
    const role = getCookie('user_role');
    if (!role || role !== 'SuperAdmin') {
      router.push('/bank'); // Redirect non-superadmins back to Teller portal
      return;
    }
    fetchSchools();
  }, []);

  async function fetchSchools() {
    setLoading(true);
    try {
      const data = await apiRequest('schools');
      setSchools(data);
    } catch (err) {
      console.error('Failed to fetch schools', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleOnboard(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiRequest('schools', {
        method: 'POST',
        body: JSON.stringify({
          name,
          address,
          phone,
          supervisorName,
          supervisorEmail,
          supervisorPassword,
        }),
      });
      setIsOpen(false);
      setName('');
      setAddress('');
      setPhone('');
      setSupervisorName('');
      setSupervisorEmail('');
      setSupervisorPassword('');
      fetchSchools();
    } catch (err) {
      console.error('Onboarding failed', err);
      alert('Failed to onboard school. Check console.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#f8f9fc] text-slate-900 font-sans p-6 md:p-12 relative overflow-x-hidden selection:bg-purple-100 selection:text-purple-900">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[100px] pointer-events-none opacity-60" />
      
      <header className="flex items-center justify-between border-b border-slate-200 pb-6 mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push('/bank')} className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full h-10 px-4">
            <ArrowLeft className="h-5 w-5 mr-1" /> Back
          </Button>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shadow-sm">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">
              SuperAdmin Portal
            </h1>
            <p className="text-xs text-slate-500 font-medium">Manage Partner Schools</p>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-sm px-6 font-semibold h-11">
              <Plus className="h-4 w-4 mr-2" />
              Onboard New School
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-none shadow-2xl text-slate-900 rounded-3xl p-8 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Onboard a New School</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Create a new school tenant and its initial School Supervisor account.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleOnboard} className="space-y-4 mt-4">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">School Details</label>
                <Input placeholder="School Name" required value={name} onChange={e => setName(e.target.value)} className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-emerald-200 py-6" />
                <Input placeholder="Address (Optional)" value={address} onChange={e => setAddress(e.target.value)} className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-emerald-200 py-6" />
                <Input placeholder="Phone (Optional)" value={phone} onChange={e => setPhone(e.target.value)} className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-emerald-200 py-6" />
              </div>
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Supervisor Account</label>
                <Input placeholder="Supervisor Name" required value={supervisorName} onChange={e => setSupervisorName(e.target.value)} className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-emerald-200 py-6" />
                <Input type="email" placeholder="Email Address" required value={supervisorEmail} onChange={e => setSupervisorEmail(e.target.value)} className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-emerald-200 py-6" />
                <Input type="password" placeholder="Initial Password" required value={supervisorPassword} onChange={e => setSupervisorPassword(e.target.value)} className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-emerald-200 py-6" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-6 rounded-full transition-all shadow-md active:scale-[0.98] mt-4">
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create School & Account'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <Card className="bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl max-w-5xl mx-auto overflow-hidden">
        <CardHeader className="border-b border-slate-50 pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <SchoolIcon className="h-4 w-4 text-emerald-500" /> 
            </div>
            Active Schools
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium ml-10">List of all onboarded schools currently using the platform.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 text-emerald-500 animate-spin" /></div>
          ) : schools.length === 0 ? (
            <div className="text-center py-20 text-slate-500 font-medium flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-slate-300" />
              </div>
              <p>No schools onboarded yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="hover:bg-slate-50 border-none">
                  <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-xs pl-8">School Name</TableHead>
                  <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-xs">Contact / Address</TableHead>
                  <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-xs text-right pr-8">Date Onboarded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map(school => (
                  <TableRow key={school.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-bold text-slate-800 text-[15px] pl-8 py-4">{school.name}</TableCell>
                    <TableCell className="text-slate-600 font-medium text-sm">
                      {school.phone || 'No phone'} <br/> 
                      <span className="text-xs text-slate-400 font-semibold">{school.address || 'No address'}</span>
                    </TableCell>
                    <TableCell className="text-right text-slate-500 text-sm font-mono font-semibold pr-8">
                      {new Date(school.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
