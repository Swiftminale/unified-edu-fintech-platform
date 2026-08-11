"use client";

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Users, Plus, UserMinus } from 'lucide-react';

export default function StudentsDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('MALE');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState('');
  const [guardianContact, setGuardianContact] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [classId, setClassId] = useState('');
  const [schoolId, setSchoolId] = useState('');

  // Derived Classes
  const availableClasses = grades.find(g => g.id === gradeId)?.classes || [];

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [studentsData, gradesData, schoolsData] = await Promise.all([
        apiRequest('students'),
        apiRequest('grades'),
        apiRequest('schools')
      ]);
      setStudents(studentsData);
      setGrades(gradesData);
      setSchools(schoolsData);
      if (schoolsData.length > 0) setSchoolId(schoolsData[0].id);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateStudent(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiRequest('students', {
        method: 'POST',
        body: JSON.stringify({
          studentId,
          schoolId,
          name,
          email,
          dateOfBirth,
          gender,
          address,
          phoneNumber,
          guardianName,
          guardianRelationship,
          guardianContact,
          gradeId,
          classId
        }),
      });
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to register student');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleArchiveStudent(id: string) {
    if (!confirm('Are you sure you want to archive this student?')) return;
    try {
      await apiRequest(`students/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      alert('Failed to archive student');
    }
  }

  function resetForm() {
    setStudentId('');
    setName('');
    setEmail('');
    setDateOfBirth('');
    setGender('MALE');
    setAddress('');
    setPhoneNumber('');
    setGuardianName('');
    setGuardianRelationship('');
    setGuardianContact('');
    setGradeId('');
    setClassId('');
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">Students</h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1 font-medium">Manage student profiles, cohorts, and guardian details.</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl shadow-sm px-6 font-semibold h-11">
              <Plus className="h-4 w-4 mr-2" /> Register Student
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-zinc-950 border-none shadow-2xl text-slate-900 dark:text-zinc-100 rounded-3xl p-8 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Register New Student</DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-zinc-400 font-medium">
                Complete the comprehensive profile to enroll a student in the system.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateStudent} className="space-y-6 mt-4">
              
              {/* Profile Block */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Academic Placement</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Manual Student ID (e.g. STU-001)" required value={studentId} onChange={e => setStudentId(e.target.value)} className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-900 focus-visible:border-purple-400 dark:focus-visible:border-purple-700 py-6 rounded-2xl" />
                  <select required value={schoolId} onChange={e => setSchoolId(e.target.value)} className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 border rounded-2xl px-4 py-4 text-sm text-slate-900 dark:text-zinc-100 focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-900 outline-none appearance-none" style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '.65rem auto' }}>
                    <option value="" disabled>Select School...</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select value={gradeId} onChange={e => setGradeId(e.target.value)} className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 border rounded-2xl px-4 py-4 text-sm text-slate-900 dark:text-zinc-100 focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-900 outline-none appearance-none" style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '.65rem auto' }}>
                    <option value="">Select Grade (Optional)</option>
                    {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                  <select value={classId} onChange={e => setClassId(e.target.value)} className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 border rounded-2xl px-4 py-4 text-sm text-slate-900 dark:text-zinc-100 focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-900 outline-none appearance-none" style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '.65rem auto' }}>
                    <option value="">Select Class (Optional)</option>
                    {availableClasses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Personal Details</h4>
                <Input placeholder="Full Legal Name" required value={name} onChange={e => setName(e.target.value)} className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-900 focus-visible:border-purple-400 dark:focus-visible:border-purple-700 py-6 rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-900 focus-visible:border-purple-400 dark:focus-visible:border-purple-700 py-6 rounded-2xl" />
                  <select value={gender} onChange={e => setGender(e.target.value)} className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 border rounded-2xl px-4 py-4 text-sm text-slate-900 dark:text-zinc-100 focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-900 outline-none appearance-none" style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '.65rem auto' }}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <Input placeholder="Email Address (Optional)" value={email} onChange={e => setEmail(e.target.value)} className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-900 focus-visible:border-purple-400 dark:focus-visible:border-purple-700 py-6 rounded-2xl" />
                <Input placeholder="Residential Address" value={address} onChange={e => setAddress(e.target.value)} className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-900 focus-visible:border-purple-400 dark:focus-visible:border-purple-700 py-6 rounded-2xl" />
              </div>

              {/* Guardian Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Guardian Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Guardian Name" value={guardianName} onChange={e => setGuardianName(e.target.value)} className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-900 focus-visible:border-purple-400 dark:focus-visible:border-purple-700 py-6 rounded-2xl" />
                  <Input placeholder="Relationship (e.g. Mother)" value={guardianRelationship} onChange={e => setGuardianRelationship(e.target.value)} className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-900 focus-visible:border-purple-400 dark:focus-visible:border-purple-700 py-6 rounded-2xl" />
                </div>
                <Input placeholder="Guardian Contact (Phone/Email)" value={guardianContact} onChange={e => setGuardianContact(e.target.value)} className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-900 focus-visible:border-purple-400 dark:focus-visible:border-purple-700 py-6 rounded-2xl" />
              </div>

              <Button type="submit" disabled={submitting} className="w-full bg-slate-900 dark:bg-purple-600 hover:bg-slate-800 dark:hover:bg-purple-500 text-white font-semibold py-6 rounded-2xl transition-all shadow-[0_4px_14px_0_rgba(15,23,42,0.15)] dark:shadow-none active:scale-[0.98] mt-4">
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enroll Student'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white dark:bg-zinc-950 border-none shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-zinc-900 pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-zinc-100">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
              <Users className="h-4 w-4 text-purple-500 dark:text-purple-400" /> 
            </div>
            Active Students
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-zinc-400 font-medium ml-10">Total enrolled students: {students.length}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 text-purple-500 animate-spin" /></div>
          ) : students.length === 0 ? (
            <div className="text-center py-20 text-slate-500 dark:text-zinc-500 font-medium flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-slate-300 dark:text-zinc-600" />
              </div>
              <p>No students enrolled yet. Start by registering your first student.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-zinc-900/50">
                <TableRow className="hover:bg-slate-50 dark:hover:bg-transparent border-none">
                  <TableHead className="text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-xs pl-8">ID</TableHead>
                  <TableHead className="text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-xs">Name</TableHead>
                  <TableHead className="text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-xs">Placement</TableHead>
                  <TableHead className="text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-xs">Guardian Contact</TableHead>
                  <TableHead className="text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-xs text-right pr-8">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(student => (
                  <TableRow key={student.id} className="border-slate-100 dark:border-zinc-900 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <TableCell className="font-mono text-slate-400 dark:text-zinc-500 font-semibold text-xs pl-8">{student.studentId}</TableCell>
                    <TableCell className="font-bold text-slate-800 dark:text-zinc-200">
                      {student.name}
                      <div className="text-xs text-slate-400 dark:text-zinc-500 font-semibold">{student.email}</div>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-zinc-300 font-semibold text-sm">
                      <span className="text-purple-500 dark:text-purple-400">{student.grade?.name || 'No Grade'}</span>
                      <span className="text-slate-300 dark:text-zinc-700 mx-1">/</span>
                      {student.class?.name || 'No Class'}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-zinc-300 text-sm font-medium">
                      {student.guardianName ? (
                        <>
                          <span className="font-bold">{student.guardianName}</span> <span className="text-xs text-slate-400 dark:text-zinc-500 font-bold">({student.guardianRelationship})</span>
                          <div className="text-xs text-slate-400 dark:text-zinc-500 font-semibold">{student.guardianContact}</div>
                        </>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <Button
                        onClick={() => handleArchiveStudent(student.id)}
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
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
