"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, getCookie, eraseCookie } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, GraduationCap, FileText, UserMinus, LogOut, Loader2, Sparkles } from 'lucide-react';

export default function SchoolDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [className, setClassName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentClassId, setStudentClassId] = useState('');
  const [invoiceStudentId, setInvoiceStudentId] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');

  const [classOpen, setClassOpen] = useState(false);
  const [studentOpen, setStudentOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  useEffect(() => {
    const role = getCookie('user_role');
    const name = getCookie('user_name');
    if (!role || (role !== 'SchoolAdmin' && role !== 'SchoolSupervisor' && role !== 'SuperAdmin')) {
      router.push('/login');
      return;
    }
    setUserName(name || '');
    setUserRole(role);
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [classList, studentList, invoiceList] = await Promise.all([
        apiRequest('classes'),
        apiRequest('students'),
        apiRequest('invoices'),
      ]);
      setClasses(classList);
      setStudents(studentList);
      setInvoices(invoiceList);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault();
    if (!className) return;
    setSubmitting(true);
    try {
      await apiRequest('classes', {
        method: 'POST',
        body: JSON.stringify({ name: className }),
      });
      setClassName('');
      setClassOpen(false);
      await fetchData();
    } catch (err) {
      alert('Failed to create class');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!studentName || !studentClassId) return;
    setSubmitting(true);
    try {
      await apiRequest('students', {
        method: 'POST',
        body: JSON.stringify({
          name: studentName,
          email: studentEmail || undefined,
          classId: studentClassId,
        }),
      });
      setStudentName('');
      setStudentEmail('');
      setStudentClassId('');
      setStudentOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create student');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateInvoice(e: React.FormEvent) {
    e.preventDefault();
    if (!invoiceStudentId || !invoiceAmount) return;
    setSubmitting(true);
    try {
      await apiRequest('invoices', {
        method: 'POST',
        body: JSON.stringify({
          studentId: invoiceStudentId,
          amount: parseFloat(invoiceAmount),
        }),
      });
      setInvoiceStudentId('');
      setInvoiceAmount('');
      setInvoiceOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleArchiveStudent(id: string) {
    if (!confirm('Are you sure you want to archive this student?')) return;
    try {
      await apiRequest(`students/${id}`, {
        method: 'DELETE',
      });
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to archive student');
    }
  }

  function handleLogout() {
    eraseCookie('jwt_token');
    eraseCookie('user_role');
    eraseCookie('user_name');
    router.push('/login');
  }

  const isReadOnly = userRole === 'SchoolSupervisor';

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 font-sans p-6 md:p-12 relative overflow-x-hidden selection:bg-indigo-500/30">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <header className="flex items-center justify-between border-b border-zinc-900 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-zinc-50 font-bold">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
              School Admin Dashboard
            </h1>
            <p className="text-xs text-zinc-500">UEFP School Management</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-zinc-200">{userName}</p>
            <p className="text-xs text-zinc-500 capitalize">{userRole}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-zinc-800 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-900/60"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {!isReadOnly && (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <Dialog open={classOpen} onOpenChange={setClassOpen}>
            <DialogTrigger asChild>
              <Button className="h-24 bg-gradient-to-br from-zinc-900 to-zinc-900/80 hover:from-zinc-850 hover:to-zinc-850 border border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all active:scale-[0.98]">
                <PlusCircle className="h-6 w-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-zinc-300 text-sm">Add New Class</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
              <form onSubmit={handleCreateClass}>
                <DialogHeader>
                  <DialogTitle>Add New Class</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Create a new classroom cohort for student assignment.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <Input
                    placeholder="Class Name (e.g. Grade 10-A)"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-zinc-100"
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-500 text-zinc-50">
                    {submitting ? 'Creating...' : 'Create Class'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={studentOpen} onOpenChange={setStudentOpen}>
            <DialogTrigger asChild>
              <Button className="h-24 bg-gradient-to-br from-zinc-900 to-zinc-900/80 hover:from-zinc-850 hover:to-zinc-850 border border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all active:scale-[0.98]">
                <PlusCircle className="h-6 w-6 text-violet-400 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-zinc-300 text-sm">Register Student</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
              <form onSubmit={handleCreateStudent}>
                <DialogHeader>
                  <DialogTitle>Register Student</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Enter the student details and assign them to an active class.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <Input
                    placeholder="Full Name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-zinc-100"
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email Address (Optional)"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-zinc-100"
                  />
                  <select
                    value={studentClassId}
                    onChange={(e) => setStudentClassId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-md text-zinc-150 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select a Class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-500 text-zinc-50">
                    {submitting ? 'Registering...' : 'Register Student'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
            <DialogTrigger asChild>
              <Button className="h-24 bg-gradient-to-br from-zinc-900 to-zinc-900/80 hover:from-zinc-850 hover:to-zinc-850 border border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all active:scale-[0.98]">
                <FileText className="h-6 w-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-zinc-300 text-sm">Issue Invoice</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
              <form onSubmit={handleCreateInvoice}>
                <DialogHeader>
                  <DialogTitle>Issue Student Invoice</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Select a student and write the tuition/fee amount to issue a new invoice.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <select
                    value={invoiceStudentId}
                    onChange={(e) => setInvoiceStudentId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-md text-zinc-150 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select a Student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} ({student.class?.name})
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Invoice Amount ($)"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-zinc-100"
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-500 text-zinc-50">
                    {submitting ? 'Issuing...' : 'Issue Invoice'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </section>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
          <p className="text-zinc-400 text-sm font-light">Loading database records...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 bg-zinc-905/40 border-zinc-900/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-900 pb-4">
              <div>
                <CardTitle className="text-lg font-bold">Active Student Cohort</CardTitle>
                <CardDescription className="text-zinc-500 text-xs">Students registered in the system</CardDescription>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-950/40 border border-indigo-900/30 text-indigo-400 text-xs font-semibold">
                <Sparkles className="h-3 w-3" />
                {students.length} Total
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-zinc-950/30">
                  <TableRow className="hover:bg-transparent border-zinc-900">
                    <TableHead className="text-zinc-400 pl-6">Student Name</TableHead>
                    <TableHead className="text-zinc-400">Class</TableHead>
                    <TableHead className="text-zinc-400">Email</TableHead>
                    {!isReadOnly && <TableHead className="text-zinc-400 text-right pr-6">Action</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length === 0 ? (
                    <TableRow className="hover:bg-transparent border-zinc-900">
                      <TableCell colSpan={4} className="text-center py-10 text-zinc-500 font-light text-sm">
                        No students registered yet. Add a class and register your first student above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    students.map((student) => (
                      <TableRow key={student.id} className="border-zinc-900 hover:bg-zinc-900/20 transition-colors">
                        <TableCell className="font-semibold text-zinc-200 pl-6">{student.name}</TableCell>
                        <TableCell className="text-zinc-400">{student.class?.name || 'Unassigned'}</TableCell>
                        <TableCell className="text-zinc-550 text-sm">{student.email || 'N/A'}</TableCell>
                        {!isReadOnly && (
                          <TableCell className="text-right pr-6">
                            <Button
                              onClick={() => handleArchiveStudent(student.id)}
                              variant="ghost"
                              size="sm"
                              className="text-zinc-500 hover:text-red-400 hover:bg-red-950/20"
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-zinc-905/40 border-zinc-900/80 backdrop-blur-sm">
            <CardHeader className="border-b border-zinc-900 pb-4">
              <CardTitle className="text-lg font-bold">Billing Ledgers</CardTitle>
              <CardDescription className="text-zinc-500 text-xs">Recent tuition & fee invoices issued</CardDescription>
            </CardHeader>
            <CardContent className="p-0 max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-zinc-950/30">
                  <TableRow className="hover:bg-transparent border-zinc-900">
                    <TableHead className="text-zinc-400 pl-6">Student</TableHead>
                    <TableHead className="text-zinc-400">Amount</TableHead>
                    <TableHead className="text-zinc-400 pr-6 text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow className="hover:bg-transparent border-zinc-900">
                      <TableCell colSpan={3} className="text-center py-10 text-zinc-500 font-light text-sm">
                        No billing ledgers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((inv) => (
                      <TableRow key={inv.id} className="border-zinc-900 hover:bg-zinc-900/20 transition-colors">
                        <TableCell className="font-semibold text-zinc-200 pl-6">
                          {inv.student?.name || 'Unknown Student'}
                        </TableCell>
                        <TableCell className="text-zinc-300 font-mono">${inv.amount.toFixed(2)}</TableCell>
                        <TableCell className="pr-6 text-right">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
                              inv.status === 'PAID'
                                ? 'bg-emerald-950/50 border border-emerald-800/40 text-emerald-400'
                                : inv.status === 'CANCELLED'
                                ? 'bg-red-950/50 border border-red-800/40 text-red-400'
                                : 'bg-amber-950/50 border border-amber-800/40 text-amber-400'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
