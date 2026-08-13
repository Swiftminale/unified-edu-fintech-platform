"use client";

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, DollarSign, Activity, Wallet, TrendingUp } from 'lucide-react';

export default function SchoolOverview() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  async function fetchReport() {
    setLoading(true);
    try {
      const data = await apiRequest('reports/financial'); 
      setReport(data);
    } catch (err) {
      console.error('Failed to fetch report', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
        <p className="text-slate-500 mt-4 text-sm font-medium">Loading financial aggregates...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium">
        Failed to load report data.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Financial Overview</h2>
        <p className="text-slate-500 text-sm mt-1 font-medium">Real-time aggregations of school revenue and outstanding dues.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-orange-50/80 border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-orange-800">Total Expected</CardTitle>
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-orange-900 tracking-tight mt-2">
              ETB {report.summary.totalExpected.toFixed(2)}
            </div>
            <p className="text-[13px] font-semibold text-orange-700/70 mt-2">Across all issued invoices</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50/80 border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-emerald-800">Total Collected</CardTitle>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-emerald-900 tracking-tight mt-2">
              ETB {report.summary.totalCollected.toFixed(2)}
            </div>
            <p className="text-[13px] font-semibold text-emerald-700/70 mt-2">Reconciled via SuperApp & Teller</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50/80 border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-purple-800">Outstanding Dues</CardTitle>
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Activity className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-purple-900 tracking-tight mt-2">
              ETB {report.summary.totalOutstanding.toFixed(2)}
            </div>
            <p className="text-[13px] font-semibold text-purple-700/70 mt-2">Pending student payments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        <Card className="bg-white border-none shadow-sm rounded-3xl p-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
              Collection by Grade
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium ml-10">Breakdown of revenue across academic levels</CardDescription>
          </CardHeader>
          <CardContent className="mt-2">
            <div className="space-y-6">
              {Object.keys(report.byGrade).map((gradeName) => {
                const stat = report.byGrade[gradeName];
                const progress = stat.expected > 0 ? (stat.collected / stat.expected) * 100 : 0;
                return (
                  <div key={gradeName} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-700">{gradeName}</span>
                      <span className="text-slate-500 font-semibold text-xs">
                        ETB {stat.collected.toFixed(2)} / ETB {stat.expected.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-400 rounded-full transition-all duration-1000" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {Object.keys(report.byGrade).length === 0 && (
                 <p className="text-slate-500 text-sm text-center py-8 font-medium">No data available.</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-none shadow-sm rounded-3xl p-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center">
                <Activity className="h-4 w-4 text-pink-500" />
              </div>
              Collection by Month
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium ml-10">Monthly invoice reconciliation status</CardDescription>
          </CardHeader>
          <CardContent className="mt-2">
            <div className="space-y-6">
              {Object.keys(report.byMonth).map((month) => {
                const stat = report.byMonth[month];
                const progress = stat.expected > 0 ? (stat.collected / stat.expected) * 100 : 0;
                return (
                  <div key={month} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-700">{month}</span>
                      <span className="text-slate-500 font-semibold text-xs">
                        ETB {stat.collected.toFixed(2)} / ETB {stat.expected.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-pink-400 rounded-full transition-all duration-1000" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {Object.keys(report.byMonth).length === 0 && (
                 <p className="text-slate-500 text-sm text-center py-8 font-medium">No data available.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
