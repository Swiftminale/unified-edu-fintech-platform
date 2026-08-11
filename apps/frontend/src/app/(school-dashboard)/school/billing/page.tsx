"use client";

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Receipt, Plus, Settings2, PlayCircle, CheckCircle } from 'lucide-react';

export default function BillingDashboard() {
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [generateResult, setGenerateResult] = useState<{ id: string, count: number } | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const [gradeId, setGradeId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [feesData, gradesData] = await Promise.all([
        apiRequest('fee-structures'),
        apiRequest('grades')
      ]);
      setFeeStructures(feesData);
      setGrades(gradesData);
      if (gradesData.length > 0) setGradeId(gradesData[0].id);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateFeeStructure(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiRequest('fee-structures', {
        method: 'POST',
        body: JSON.stringify({ name, amount: parseFloat(amount), billingCycle, gradeId }),
      });
      setIsFeeModalOpen(false);
      setName('');
      setAmount('');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to create fee structure');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGenerateInvoices(id: string) {
    setGeneratingFor(id);
    setGenerateResult(null);
    try {
      const result = await apiRequest(`fee-structures/${id}/generate-invoices`, {
        method: 'POST',
        body: JSON.stringify({ startDate: new Date().toISOString() }),
      });
      setGenerateResult({ id, count: result.count });
    } catch (err) {
      console.error(err);
      alert('Failed to generate bulk invoices.');
    } finally {
      setGeneratingFor(null);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">Billing & Invoicing</h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1 font-medium">Configure tuition fees and generate bulk invoices for grades.</p>
        </div>
        
        <Dialog open={isFeeModalOpen} onOpenChange={setIsFeeModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl shadow-sm px-6 font-semibold h-11">
              <Plus className="h-4 w-4 mr-2" /> New Fee Structure
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-zinc-950 border-none shadow-2xl text-slate-900 dark:text-zinc-100 rounded-3xl p-8 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Create Fee Structure</DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-zinc-400 font-medium">
                Define how much students in a specific grade will be billed.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateFeeStructure} className="space-y-5 mt-4">
              <Input 
                placeholder="Fee Name (e.g. 2026 Tuition)" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-900 focus-visible:border-purple-400 dark:focus-visible:border-purple-700 py-6 rounded-2xl" 
              />
              <Input 
                type="number" 
                step="0.01" 
                placeholder="Amount ($)" 
                required 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-900 focus-visible:border-purple-400 dark:focus-visible:border-purple-700 py-6 rounded-2xl" 
              />
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Billing Cycle</label>
                <select
                  required
                  value={billingCycle}
                  onChange={e => setBillingCycle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 border rounded-2xl px-4 py-4 text-sm text-slate-900 dark:text-zinc-100 focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-900 outline-none appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '.65rem auto' }}
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Target Grade</label>
                <select
                  required
                  value={gradeId}
                  onChange={e => setGradeId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 border rounded-2xl px-4 py-4 text-sm text-slate-900 dark:text-zinc-100 focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-900 outline-none appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '.65rem auto' }}
                >
                  {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>

              <Button type="submit" disabled={submitting} className="w-full bg-slate-900 dark:bg-purple-600 hover:bg-slate-800 dark:hover:bg-purple-500 text-white font-semibold py-6 rounded-2xl transition-all shadow-[0_4px_14px_0_rgba(15,23,42,0.15)] dark:shadow-none active:scale-[0.98]">
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Fee Structure'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white dark:bg-zinc-950 border-none shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-zinc-900 pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-zinc-100">
            <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
              <Settings2 className="h-4 w-4 text-orange-500 dark:text-orange-400" />
            </div>
            Defined Fee Structures
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-zinc-400 font-medium ml-10">List of active billing definitions.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 text-purple-500 animate-spin" /></div>
          ) : feeStructures.length === 0 ? (
            <div className="text-center py-20 text-slate-500 dark:text-zinc-500 font-medium flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-4">
                <Receipt className="h-8 w-8 text-slate-300 dark:text-zinc-600" />
              </div>
              <p>No fee structures defined yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-zinc-900/50">
                <TableRow className="hover:bg-slate-50 dark:hover:bg-transparent border-none">
                  <TableHead className="text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-xs">Name</TableHead>
                  <TableHead className="text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-xs">Amount</TableHead>
                  <TableHead className="text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-xs">Cycle</TableHead>
                  <TableHead className="text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeStructures.map(fee => (
                  <TableRow key={fee.id} className="border-slate-100 dark:border-zinc-900 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <TableCell className="font-bold text-slate-800 dark:text-zinc-200">{fee.name}</TableCell>
                    <TableCell className="text-slate-900 dark:text-white font-bold">${fee.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                        {fee.billingCycle}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {generateResult?.id === fee.id ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-bold border dark:border-emerald-900/50">
                          <CheckCircle className="h-4 w-4" />
                          Generated {generateResult?.count} Invoices
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleGenerateInvoices(fee.id)}
                          disabled={generatingFor === fee.id}
                          className="bg-purple-600 dark:bg-purple-700 hover:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-xl shadow-sm dark:shadow-none font-semibold transition-all active:scale-95"
                        >
                          {generatingFor === fee.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <PlayCircle className="h-4 w-4 mr-2" />
                          )}
                          Bulk Generate Invoices
                        </Button>
                      )}
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
