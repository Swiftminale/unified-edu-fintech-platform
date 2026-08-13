"use client";

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, BookOpen, Plus, PlusCircle, Trash2, Layers } from 'lucide-react';

export default function GradesAndClasses() {
  const [grades, setGrades] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isBulkGradeModalOpen, setIsBulkGradeModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedGradeId, setSelectedGradeId] = useState('');

  // Form State
  const [gradeName, setGradeName] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [className, setClassName] = useState('');
  
  // Bulk Form State
  const [bulkGrades, setBulkGrades] = useState([
    { name: '', feeName: '', feeAmount: '', billingCycle: 'YEARLY' }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [gradesData, schoolsData] = await Promise.all([
        apiRequest('grades'),
        apiRequest('schools'), // Needed to assign a grade to a school if multi-tenant
      ]);
      setGrades(gradesData);
      setSchools(schoolsData);
      if (schoolsData.length > 0) setSchoolId(schoolsData[0].id);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGrade(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiRequest('grades', {
        method: 'POST',
        body: JSON.stringify({ name: gradeName, schoolId }),
      });
      setIsGradeModalOpen(false);
      setGradeName('');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to create grade');
    } finally {
      setSubmitting(false);
    }
  }

  function addBulkRow() {
    setBulkGrades([...bulkGrades, { name: '', feeName: '', feeAmount: '', billingCycle: 'YEARLY' }]);
  }

  function updateBulkRow(index: number, field: string, value: string) {
    const newGrades = [...bulkGrades];
    newGrades[index] = { ...newGrades[index], [field]: value };
    setBulkGrades(newGrades);
  }

  function removeBulkRow(index: number) {
    if (bulkGrades.length === 1) return;
    setBulkGrades(bulkGrades.filter((_, i) => i !== index));
  }

  async function handleBulkCreateGrades(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiRequest('grades/bulk', {
        method: 'POST',
        body: JSON.stringify({
          schoolId,
          grades: bulkGrades.map(g => ({
            name: g.name,
            feeName: g.feeName,
            feeAmount: parseFloat(g.feeAmount) || 0,
            billingCycle: g.billingCycle
          }))
        }),
      });
      setIsBulkGradeModalOpen(false);
      setBulkGrades([{ name: '', feeName: '', feeAmount: '', billingCycle: 'YEARLY' }]);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to bulk create grades');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiRequest('classes', {
        method: 'POST',
        body: JSON.stringify({ name: className, gradeId: selectedGradeId }),
      });
      setIsClassModalOpen(false);
      setClassName('');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to create class');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Grades & Classes</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage academic levels and physical class groupings.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog open={isBulkGradeModalOpen} onOpenChange={setIsBulkGradeModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-500 text-white shadow-sm px-6">
                <Layers className="h-4 w-4 mr-2" /> Bulk Add Grades
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-none shadow-2xl text-slate-900 rounded-3xl p-8 max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Bulk Add Grades & Fees</DialogTitle>
                <DialogDescription className="text-slate-500 font-medium">
                  Create multiple grades and configure their fee structures simultaneously.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBulkCreateGrades} className="space-y-6 mt-4">
                <div className="w-64">
                  <select
                    required
                    value={schoolId}
                    onChange={e => setSchoolId(e.target.value)}
                    className="w-full bg-slate-50 border-slate-200 border rounded-2xl px-4 py-3 text-sm text-slate-900 focus-visible:ring-2 focus-visible:ring-purple-200 outline-none appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '.65rem auto' }}
                  >
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                
                <div className="space-y-4">
                  {bulkGrades.map((row, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <Input 
                        placeholder="Grade Name (e.g. Grade 1)" 
                        required 
                        value={row.name} 
                        onChange={e => updateBulkRow(idx, 'name', e.target.value)} 
                        className="bg-white border-slate-200 text-slate-900" 
                      />
                      <Input 
                        placeholder="Fee Name (e.g. Tuition)" 
                        required 
                        value={row.feeName} 
                        onChange={e => updateBulkRow(idx, 'feeName', e.target.value)} 
                        className="bg-white border-slate-200 text-slate-900" 
                      />
                      <Input 
                        type="number"
                        min="0"
                        placeholder="Amount" 
                        required 
                        value={row.feeAmount} 
                        onChange={e => updateBulkRow(idx, 'feeAmount', e.target.value)} 
                        className="bg-white border-slate-200 text-slate-900 w-full sm:w-32" 
                      />
                      <select
                        required
                        value={row.billingCycle}
                        onChange={e => updateBulkRow(idx, 'billingCycle', e.target.value)}
                        className="w-full sm:w-40 bg-white border-slate-200 border rounded-2xl px-3 py-2 text-sm text-slate-900 outline-none appearance-none h-12"
                        style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '.65rem auto' }}
                      >
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                        <option value="YEARLY">Yearly</option>
                      </select>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => removeBulkRow(idx)}
                        disabled={bulkGrades.length === 1}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 px-3"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addBulkRow} className="w-full border-dashed border-2 text-slate-500 font-bold rounded-2xl h-12">
                    <Plus className="h-4 w-4 mr-2" /> Add Another Row
                  </Button>
                </div>
                
                <Button type="submit" disabled={submitting} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-6 rounded-full transition-all shadow-md active:scale-[0.98]">
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : `Create ${bulkGrades.length} Grade${bulkGrades.length !== 1 ? 's' : ''}`}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isGradeModalOpen} onOpenChange={setIsGradeModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm px-6">
                <Plus className="h-4 w-4 mr-2" /> Add Single Grade
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-none shadow-2xl text-slate-900 rounded-3xl p-8 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Add New Grade</DialogTitle>
                <DialogDescription className="text-slate-500 font-medium">
                  Create a new academic level (e.g. Grade 10).
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateGrade} className="space-y-5 mt-4">
                <Input 
                  placeholder="Grade Name (e.g. Grade 10)" 
                  required 
                  value={gradeName} 
                  onChange={e => setGradeName(e.target.value)} 
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-purple-200 focus-visible:border-purple-400 py-6" 
                />
                <select
                  required
                  value={schoolId}
                  onChange={e => setSchoolId(e.target.value)}
                  className="w-full bg-slate-50 border-slate-200 border rounded-2xl px-4 py-4 text-sm text-slate-900 focus-visible:ring-2 focus-visible:ring-purple-200 outline-none appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '.65rem auto' }}
                >
                  {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <Button type="submit" disabled={submitting} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-6 rounded-full transition-all shadow-md active:scale-[0.98]">
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Grade'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 text-purple-500 animate-spin" /></div>
      ) : grades.length === 0 ? (
        <div className="text-center py-20 text-slate-500 font-medium flex flex-col items-center bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-slate-300" />
          </div>
          <p>No grades found. Create your first grade to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grades.map(grade => (
            <Card key={grade.id} className="bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-2">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-50">
                <CardTitle className="text-xl font-bold text-slate-800">{grade.name}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-full font-semibold"
                  onClick={() => {
                    setSelectedGradeId(grade.id);
                    setIsClassModalOpen(true);
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2 text-purple-500" /> Add Class
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                {grade.classes && grade.classes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {grade.classes.map((cls: any) => (
                      <div key={cls.id} className="p-4 rounded-3xl bg-slate-50 border-none flex flex-col gap-1 group hover:shadow-sm transition-all duration-300">
                        <span className="font-bold text-slate-800 text-lg">{cls.name}</span>
                        <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">ID: {cls.id.slice(-6)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm font-medium italic text-center py-4 bg-slate-50 rounded-3xl">No classes added to this grade yet.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Class Modal */}
      <Dialog open={isClassModalOpen} onOpenChange={setIsClassModalOpen}>
        <DialogContent className="bg-white border-none shadow-2xl text-slate-900 rounded-3xl p-8 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add New Class</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Create a physical grouping of students (e.g. Grade 10-A).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateClass} className="space-y-5 mt-4">
            <Input 
              placeholder="Class Name (e.g. 10-A)" 
              required 
              value={className} 
              onChange={e => setClassName(e.target.value)} 
              className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-purple-200 focus-visible:border-purple-400 py-6" 
            />
            <Button type="submit" disabled={submitting} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-6 rounded-full transition-all shadow-md active:scale-[0.98]">
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Class'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
