import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getFinancialReport(schoolId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { student: { schoolId } },
      include: {
        student: { include: { grade: true } },
      }
    });

    let totalExpected = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;

    const byGrade: Record<string, { expected: number; collected: number }> = {};
    const byMonth: Record<string, { expected: number; collected: number }> = {};

    for (const invoice of invoices) {
      totalExpected += invoice.amount;
      totalCollected += invoice.paidAmount;
      totalOutstanding += (invoice.amount - invoice.paidAmount);

      const gradeName = invoice.student.grade?.name || 'Unassigned';
      if (!byGrade[gradeName]) byGrade[gradeName] = { expected: 0, collected: 0 };
      byGrade[gradeName].expected += invoice.amount;
      byGrade[gradeName].collected += invoice.paidAmount;

      const month = new Date(invoice.dueDate).toISOString().slice(0, 7); // YYYY-MM
      if (!byMonth[month]) byMonth[month] = { expected: 0, collected: 0 };
      byMonth[month].expected += invoice.amount;
      byMonth[month].collected += invoice.paidAmount;
    }

    return {
      summary: {
        totalExpected,
        totalCollected,
        totalOutstanding,
      },
      byGrade,
      byMonth,
    };
  }

  async getStudentAcademicReport(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        academicRecords: true,
        attendances: true,
        grade: true,
        class: true,
        school: true,
      }
    });

    if (!student) throw new NotFoundException('Student not found');

    const attendanceSummary = student.attendances.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      studentInfo: {
        id: student.studentId,
        name: student.name,
        school: student.school?.name,
        grade: student.grade?.name,
        class: student.class?.name,
      },
      academicRecords: student.academicRecords,
      attendance: attendanceSummary,
    };
  }
}
