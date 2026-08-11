import { Controller, Get, Param, Query } from '@nestjs/common';
import { ReportService } from './report.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('financial')
  @Roles(Role.SuperAdmin, Role.SchoolSupervisor, Role.SchoolAdmin, Role.BankAdmin)
  async getFinancialReport(@Query('schoolId') schoolId: string) {
    // In a real app, schoolId should be derived from the logged-in user's token if they are a SchoolAdmin/Supervisor.
    // For SuperAdmin/BankAdmin, they can query any school.
    return this.reportService.getFinancialReport(schoolId);
  }

  @Get('academic/:studentId')
  @Roles(Role.SuperAdmin, Role.SchoolSupervisor, Role.SchoolAdmin)
  async getStudentAcademicReport(@Param('studentId') studentId: string) {
    return this.reportService.getStudentAcademicReport(studentId);
  }
}
