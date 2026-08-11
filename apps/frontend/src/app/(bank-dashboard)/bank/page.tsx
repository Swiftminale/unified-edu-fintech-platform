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
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 font-sans p-6 md:p-12 relative overflow-x-hidden selection:bg-indigo-500/30">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <header className="flex items-center justify-between border-b border-zinc-900 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-600 flex items-center justify-center text-zinc-50 font-bold">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
              Bank Teller Portal
            </h1>
            <p className="text-xs text-zinc-500">UEFP Financial Reconciliation</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-zinc-200">{userName}</p>
            <p className="text-xs text-zinc-500 capitalize">{userRole}</p>
          </div>
          {userRole === 'SuperAdmin' && (
            <Button
              onClick={() => router.push('/bank/schools')}
              variant="default"
              className="bg-violet-600 hover:bg-violet-500 text-zinc-50"
            >
              Manage Schools
            </Button>
          )}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-zinc-900/40 border-zinc-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Student Invoice Search</CardTitle>
              <CardDescription className="text-zinc-500 text-xs">
                Lookup students by ID or name to pull outstanding invoice records.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    placeholder="Search student name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-zinc-150 pl-10 focus-visible:ring-1 focus-visible:ring-violet-500"
                  />
                </div>
                <Button type="submit" disabled={searching} className="bg-violet-600 hover:bg-violet-500 text-zinc-50 px-6">
                  {searching ? 'Searching...' : 'Search'}
                </Button>
              </form>

              {students.length > 0 && !selectedStudent && (
                <div className="mt-6 border border-zinc-800 rounded-lg overflow-hidden">
                  <div className="bg-zinc-950/40 px-4 py-2 border-b border-zinc-800 text-xs font-semibold text-zinc-400">
                    Matches Found
                  </div>
                  <ul className="divide-y divide-zinc-800">
                    {students.map((student) => (
                      <li key={student.id}>
                        <button
                          onClick={() => selectStudent(student)}
                          className="w-full text-left px-4 py-3 hover:bg-zinc-900/40 transition-colors flex justify-between items-center group cursor-pointer"
                        >
                          <div>
                            <p className="font-semibold text-zinc-200 group-hover:text-violet-400 transition-colors">
                              {student.name}
                            </p>
                            <p className="text-xs text-zinc-550">{student.class?.name || 'No Class'}</p>
                          </div>
                          <span className="text-xs text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
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
              className={`flex items-center gap-2 p-4 rounded-lg border ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400'
                  : 'bg-red-950/40 border-red-800/50 text-red-400'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle className="h-5 w-5 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0" />
              )}
              <span className="text-sm">{feedback.message}</span>
            </div>
          )}

          {selectedStudent && (
            <Card className="bg-zinc-900/40 border-zinc-900/80 backdrop-blur-sm">
              <CardHeader className="border-b border-zinc-900 pb-4">
                <CardTitle className="text-lg font-bold text-zinc-200">
                  Bills for: <span className="text-violet-400">{selectedStudent.name}</span>
                </CardTitle>
                <CardDescription className="text-zinc-550 text-xs">
                  Cohort: {selectedStudent.class?.name || 'Unassigned'} | Student ID: {selectedStudent.id}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {outstandingInvoices.length === 0 ? (
                  <div className="text-center py-12 text-zinc-550 font-light text-sm">
                    No outstanding unpaid invoices found for this student.
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-zinc-950/30">
                      <TableRow className="hover:bg-transparent border-zinc-900">
                        <TableHead className="text-zinc-400 pl-6">Invoice ID</TableHead>
                        <TableHead className="text-zinc-400">Total Amount</TableHead>
                        <TableHead className="text-zinc-400 text-right pr-6">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {outstandingInvoices.map((invoice) => (
                        <TableRow key={invoice.id} className="border-zinc-900 hover:bg-transparent">
                          <TableCell className="font-mono text-xs text-zinc-500 pl-6">
                            {invoice.id}
                          </TableCell>
                          <TableCell className="font-bold text-zinc-100 font-mono">
                            ${invoice.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button
                              onClick={() => handleReconcile(invoice.id, invoice.amount)}
                              disabled={processing}
                              className="bg-emerald-600 hover:bg-emerald-500 text-zinc-50 font-medium shadow-md flex items-center gap-1.5 active:scale-[0.98] cursor-pointer"
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

        <Card className="bg-zinc-900/40 border-zinc-900/80 backdrop-blur-sm">
          <CardHeader className="border-b border-zinc-900 pb-4">
            <CardTitle className="text-lg font-bold">Real-time Bank Ledger</CardTitle>
            <CardDescription className="text-zinc-550 text-xs">
              Recent verified transaction reconciliations
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 max-h-[550px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
              </div>
            ) : reconciledLedgers.length === 0 ? (
              <div className="text-center py-20 text-zinc-500 font-light text-sm">
                No bank transaction entries processed yet.
              </div>
            ) : (
              <ul className="divide-y divide-zinc-900">
                {reconciledLedgers.map((ledger) => (
                  <li key={ledger.id} className="p-4 space-y-1.5 hover:bg-zinc-900/20 transition-colors">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-zinc-200 text-sm">
                        {ledger.studentName || 'Student'}
                      </span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        +${ledger.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-zinc-500 font-mono">
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
