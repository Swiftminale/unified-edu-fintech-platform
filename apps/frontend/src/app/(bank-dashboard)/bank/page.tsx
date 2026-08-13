"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, getCookie, eraseCookie } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Landmark, Search, CreditCard, LogOut, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function BankDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [outstandingInvoices, setOutstandingInvoices] = useState<any[]>([]);
  const [reconciledLedgers, setReconciledLedgers] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const role = getCookie('user_role');
    const name = getCookie('user_name');
    if (!role || (role !== 'BankAdmin' && role !== 'SuperAdmin')) {
      router.push('/login');
      return;
    }
    setUserName(name || '');
    setUserRole(role);
    fetchReconciledLedgers();
  }, []);

  async function fetchReconciledLedgers() {
    setLoading(true);
    try {
      const invoicesList = await apiRequest('invoices');
      const ledgers: any[] = [];
      invoicesList.forEach((inv: any) => {
        if (inv.paymentLedgers && inv.paymentLedgers.length > 0) {
          inv.paymentLedgers.forEach((pl: any) => {
            ledgers.push({
              ...pl,
              studentName: inv.student?.name,
              invoiceAmount: inv.amount,
            });
          });
        }
      });
      ledgers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReconciledLedgers(ledgers);
    } catch (err) {
      console.error('Error fetching ledgers:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setFeedback(null);
    try {
      const allStudents = await apiRequest('students');
      const matches = allStudents.filter((s: any) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setStudents(matches);
      setSelectedStudent(null);
      setOutstandingInvoices([]);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Student search failed' });
    } finally {
      setSearching(false);
    }
  }

  async function selectStudent(student: any) {
    setSelectedStudent(student);
    setFeedback(null);
    try {
      const allInvoices = await apiRequest('invoices');
      const unpaid = allInvoices.filter((inv: any) =>
        inv.studentId === student.id && inv.status === 'UNPAID'
      );
      setOutstandingInvoices(unpaid);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to fetch student invoices' });
    }
  }

  async function handleReconcile(invoiceId: string, amount: number) {
    setProcessing(true);
    setFeedback(null);
    const bankTxId = `TX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    try {
      await apiRequest('webhooks/bank/reconcile', {
        method: 'POST',
        body: JSON.stringify({
          bankTxId,
          invoiceId,
          amount,
          paymentDate: new Date().toISOString(),
        }),
      });

      setFeedback({
        type: 'success',
        message: `Invoice successfully reconciled! Trans ID: ${bankTxId}`,
      });

      setSelectedStudent(null);
      setOutstandingInvoices([]);
      setStudents([]);
      setSearchQuery('');
      
      await fetchReconciledLedgers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Payment reconciliation failed' });
    } finally {
      setProcessing(false);
    }
  }

  function handleLogout() {
    eraseCookie('jwt_token');
    eraseCookie('user_role');
    eraseCookie('user_name');
    router.push('/login');
  }

  return (
    <div className="min-h-screen w-full bg-[#f8f9fc] text-slate-900 font-sans p-6 md:p-12 relative overflow-x-hidden selection:bg-purple-100 selection:text-purple-900">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[100px] pointer-events-none opacity-60" />
      
      <header className="flex items-center justify-between border-b border-slate-200 pb-6 mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shadow-sm">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">
              Bank Teller Portal
            </h1>
            <p className="text-xs text-slate-500 font-medium">UEFP Financial Reconciliation</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-700">{userName}</p>
            <p className="text-xs text-slate-500 font-semibold capitalize">{userRole}</p>
          </div>
          {userRole === 'SuperAdmin' && (
            <Button
              onClick={() => router.push('/bank/schools')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-sm px-6 font-semibold h-11"
            >
              Manage Schools
            </Button>
          )}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-full font-semibold h-11"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-2">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800">Student Invoice Search</CardTitle>
              <CardDescription className="text-slate-500 font-medium text-xs">
                Lookup students by ID or name to pull outstanding invoice records.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Search student name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-50 border-slate-200 text-slate-900 pl-12 focus-visible:ring-2 focus-visible:ring-emerald-200 h-14"
                  />
                </div>
                <Button type="submit" disabled={searching} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 h-14 rounded-full shadow-md font-bold text-[15px]">
                  {searching ? 'Searching...' : 'Search'}
                </Button>
              </form>

              {students.length > 0 && !selectedStudent && (
                <div className="mt-6 border border-slate-100 rounded-3xl overflow-hidden shadow-sm bg-white">
                  <div className="bg-slate-50 px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Matches Found
                  </div>
                  <ul className="divide-y divide-slate-50">
                    {students.map((student) => (
                      <li key={student.id}>
                        <button
                          onClick={() => selectStudent(student)}
                          className="w-full text-left px-6 py-4 hover:bg-slate-50/80 transition-colors flex justify-between items-center group cursor-pointer"
                        >
                          <div>
                            <p className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors text-[15px]">
                              {student.name}
                            </p>
                            <p className="text-xs font-semibold text-slate-500">{student.class?.name || 'No Class'}</p>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            Select & Pull Bills &rarr;
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {feedback && (
            <div
              className={`flex items-center gap-3 p-5 rounded-3xl border shadow-sm ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  : 'bg-red-50 border-red-100 text-red-700'
              }`}
            >
              {feedback.type === 'success' ? (
               <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              )}
              <span className="text-[15px] font-bold">{feedback.message}</span>
            </div>
          )}

          {selectedStudent && (
            <Card className="bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-2">
              <CardHeader className="border-b border-slate-50 pb-4">
                <CardTitle className="text-lg font-bold text-slate-800">
                  Bills for: <span className="text-emerald-600">{selectedStudent.name}</span>
                </CardTitle>
                <CardDescription className="text-slate-500 font-medium text-xs">
                  Cohort: {selectedStudent.class?.name || 'Unassigned'} | Student ID: {selectedStudent.id}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {outstandingInvoices.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 font-semibold text-sm bg-slate-50 rounded-b-3xl mt-4 mx-4 mb-4">
                    No outstanding unpaid invoices found for this student.
                  </div>
                ) : (
                  <Table className="mt-4">
                    <TableHeader className="bg-slate-50">
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-xs pl-8">Invoice ID</TableHead>
                        <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-xs">Total Amount</TableHead>
                        <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-xs text-right pr-8">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {outstandingInvoices.map((invoice) => (
                        <TableRow key={invoice.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <TableCell className="font-mono text-xs font-semibold text-slate-500 pl-8">
                            {invoice.id}
                          </TableCell>
                          <TableCell className="font-bold text-slate-800 text-[15px]">
                            ETB {invoice.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right pr-8 py-4">
                            <Button
                              onClick={() => handleReconcile(invoice.id, invoice.amount)}
                              disabled={processing}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md flex items-center gap-2 active:scale-[0.98] cursor-pointer rounded-full h-10 px-5"
                            >
                              {processing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CreditCard className="h-4 w-4" />
                              )}
                              Reconcile Deposit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-2 h-fit">
          <CardHeader className="border-b border-slate-50 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800">Real-time Bank Ledger</CardTitle>
            <CardDescription className="text-slate-500 font-medium text-xs">
              Recent verified transaction reconciliations
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 max-h-[550px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
              </div>
            ) : reconciledLedgers.length === 0 ? (
              <div className="text-center py-12 m-4 bg-slate-50 rounded-2xl text-slate-400 font-semibold text-sm">
                No bank transaction entries processed yet.
              </div>
            ) : (
              <ul className="divide-y divide-slate-50 mt-2">
                {reconciledLedgers.map((ledger) => (
                  <li key={ledger.id} className="p-5 space-y-2 hover:bg-slate-50/80 transition-colors">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-800 text-[15px]">
                        {ledger.studentName || 'Student'}
                      </span>
                      <span className="font-mono font-black text-emerald-600 text-[15px]">
                        +ETB {ledger.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-400 font-mono">
                      <span>Tx: {ledger.bankTxId}</span>
                      <span>
                        {new Date(ledger.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
