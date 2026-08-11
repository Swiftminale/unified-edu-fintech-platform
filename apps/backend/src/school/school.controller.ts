import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { SchoolService } from './school.service';
import { CreateSchoolDto } from './dto/school.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('schools')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Post()
  @Roles(Role.SuperAdmin, Role.BankAdmin)
  async create(@Body() dto: CreateSchoolDto) {
    return this.schoolService.createSchool(dto);
  }

  @Get()
  @Roles(Role.SuperAdmin, Role.BankAdmin)
  async findAll() {
    return this.schoolService.findAll();
  }

  @Get(':id')
  @Roles(Role.SuperAdmin, Role.BankAdmin)
  async findOne(@Param('id') id: string) {
    return this.schoolService.findOne(id);
  }
}
