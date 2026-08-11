import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Role, BillingCycle } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { SisService } from './sis.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class SisController {
  constructor(
    private readonly sisService: SisService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('grades/bulk')
  @Roles(Role.SuperAdmin, Role.SchoolSupervisor, Role.SchoolAdmin)
  async bulkCreateGrades(
    @Body()
    dto: {
      schoolId: string;
      grades: {
        name: string;
        feeName: string;
        feeAmount: number;
        billingCycle: BillingCycle;
      }[];
    },
  ) {
    return this.sisService.bulkCreateGrades(dto);
  }
  @Post('grades')
  @Roles(Role.SuperAdmin, Role.SchoolSupervisor, Role.SchoolAdmin)
  async createGrade(@Body() dto: { name: string; schoolId: string }) {
    return this.prisma.grade.create({
      data: dto,
    });
  }

  @Get('grades')
  async findAllGrades() {
    return this.prisma.grade.findMany({ include: { classes: true } });
  }

  @Post('classes')
  @Roles(Role.SuperAdmin, Role.SchoolSupervisor, Role.SchoolAdmin)
  async createClass(@Body() dto: { name: string; gradeId: string }) {
    return this.prisma.class.create({
      data: dto,
    });
  }

  @Get('classes')
  async findAllClasses() {
    return this.prisma.class.findMany({ include: { grade: true } });
  }

  @Post('students')
  @Roles(Role.SuperAdmin, Role.SchoolSupervisor, Role.SchoolAdmin)
  async create(@Body() dto: CreateStudentDto) {
    return this.sisService.create(dto);
  }

  @Get('students')
  @Roles(Role.SuperAdmin, Role.SchoolSupervisor, Role.SchoolAdmin, Role.BankAdmin)
  async findAll() {
    return this.sisService.findAll();
  }

  @Get('students/:id')
  @Roles(Role.SuperAdmin, Role.SchoolSupervisor, Role.SchoolAdmin, Role.BankAdmin)
  async findOne(@Param('id') id: string) {
    return this.sisService.findOne(id);
  }

  @Patch('students/:id')
  @Roles(Role.SuperAdmin, Role.SchoolSupervisor, Role.SchoolAdmin)
  async update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.sisService.update(id, dto);
  }

  @Delete('students/:id')
  @Roles(Role.SuperAdmin, Role.SchoolSupervisor, Role.SchoolAdmin)
  async remove(@Param('id') id: string) {
    return this.sisService.remove(id);
  }
}
