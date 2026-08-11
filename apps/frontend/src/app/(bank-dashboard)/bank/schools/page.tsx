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
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 font-sans p-6 md:p-12 relative overflow-x-hidden selection:bg-indigo-500/30">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <header className="flex items-center justify-between border-b border-zinc-900 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push('/bank')} className="text-zinc-400 hover:text-zinc-100">
            <ArrowLeft className="h-5 w-5 mr-1" /> Back
          </Button>
          <div className="w-10 h-10 rounded-lg bg-violet-600 flex items-center justify-center text-zinc-50 font-bold">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
              SuperAdmin Portal
            </h1>
            <p className="text-xs text-zinc-500">Manage Partner Schools</p>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-500 text-zinc-50">
              <Plus className="h-4 w-4 mr-2" />
              Onboard New School
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-md">
            <DialogHeader>
              <DialogTitle>Onboard a New School</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Create a new school tenant and its initial School Supervisor account.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleOnboard} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400">School Details</label>
                <Input placeholder="School Name" required value={name} onChange={e => setName(e.target.value)} className="bg-zinc-900 border-zinc-800" />
                <Input placeholder="Address (Optional)" value={address} onChange={e => setAddress(e.target.value)} className="bg-zinc-900 border-zinc-800" />
                <Input placeholder="Phone (Optional)" value={phone} onChange={e => setPhone(e.target.value)} className="bg-zinc-900 border-zinc-800" />
              </div>
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="text-xs font-semibold text-zinc-400">Supervisor Account</label>
                <Input placeholder="Supervisor Name" required value={supervisorName} onChange={e => setSupervisorName(e.target.value)} className="bg-zinc-900 border-zinc-800" />
                <Input type="email" placeholder="Email Address" required value={supervisorEmail} onChange={e => setSupervisorEmail(e.target.value)} className="bg-zinc-900 border-zinc-800" />
                <Input type="password" placeholder="Initial Password" required value={supervisorPassword} onChange={e => setSupervisorPassword(e.target.value)} className="bg-zinc-900 border-zinc-800" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-violet-600 hover:bg-violet-500">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create School & Account'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <Card className="bg-zinc-900/40 border-zinc-900/80 backdrop-blur-sm max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <SchoolIcon className="h-5 w-5 text-violet-400" /> 
            Active Schools
          </CardTitle>
          <CardDescription className="text-zinc-500">List of all onboarded schools currently using the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 text-violet-500 animate-spin" /></div>
          ) : schools.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 font-light flex flex-col items-center">
              <Building2 className="h-12 w-12 text-zinc-800 mb-4" />
              <p>No schools onboarded yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-zinc-950/30">
                <TableRow className="hover:bg-transparent border-zinc-900">
                  <TableHead className="text-zinc-400">School Name</TableHead>
                  <TableHead className="text-zinc-400">Contact / Address</TableHead>
                  <TableHead className="text-zinc-400 text-right">Date Onboarded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map(school => (
                  <TableRow key={school.id} className="border-zinc-900 hover:bg-zinc-900/50">
                    <TableCell className="font-semibold text-zinc-200">{school.name}</TableCell>
                    <TableCell className="text-zinc-400 text-sm">
                      {school.phone || 'No phone'} <br/> 
                      <span className="text-xs text-zinc-500">{school.address || 'No address'}</span>
                    </TableCell>
                    <TableCell className="text-right text-zinc-500 text-sm font-mono">
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
