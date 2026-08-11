import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSchoolDto } from './dto/school.dto';
import { Role } from '@prisma/client';

@Injectable()
export class SchoolService {
  constructor(private readonly prisma: PrismaService) {}

  async createSchool(dto: CreateSchoolDto) {
    const existingSupervisor = await this.prisma.user.findUnique({
      where: { email: dto.supervisorEmail },
    });

    if (existingSupervisor) {
      throw new ConflictException('A user with that email already exists.');
    }

    const hashedPassword = await bcrypt.hash(dto.supervisorPassword, 10);

    return this.prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          name: dto.name,
          address: dto.address,
          phone: dto.phone,
        },
      });

      const supervisor = await tx.user.create({
        data: {
          email: dto.supervisorEmail,
          password: hashedPassword,
          name: dto.supervisorName,
          role: Role.SchoolSupervisor,
          schoolId: school.id,
        },
      });

      return {
        school,
        supervisor: {
          id: supervisor.id,
          name: supervisor.name,
          email: supervisor.email,
        }
      };
    });
  }

  async findAll() {
    return this.prisma.school.findMany();
  }

  async findOne(id: string) {
    return this.prisma.school.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
      }
    });
  }
}
