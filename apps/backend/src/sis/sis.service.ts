import { Injectable, NotFoundException } from '@nestjs/common';
import { BillingCycle } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';

@Injectable()
export class SisService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStudentDto) {
    if (dto.classId) {
      const classExists = await this.prisma.class.findUnique({
        where: { id: dto.classId },
      });
      if (!classExists) {
        throw new NotFoundException(`Class with ID ${dto.classId} not found`);
      }
    }

    if (dto.gradeId) {
      const gradeExists = await this.prisma.grade.findUnique({
        where: { id: dto.gradeId },
      });
      if (!gradeExists) {
        throw new NotFoundException(`Grade with ID ${dto.gradeId} not found`);
      }
    }

    return this.prisma.student.create({
      data: {
        studentId: dto.studentId,
        schoolId: dto.schoolId,
        name: dto.name,
        email: dto.email,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        gender: dto.gender,
        address: dto.address,
        phoneNumber: dto.phoneNumber,
        guardianName: dto.guardianName,
        guardianRelationship: dto.guardianRelationship,
        guardianContact: dto.guardianContact,
        classId: dto.classId,
        gradeId: dto.gradeId,
      },
    });
  }

  async findAll() {
    return this.prisma.student.findMany({
      where: { isArchived: false },
      include: {
        class: true,
        grade: true,
      },
    });
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, isArchived: false },
      include: {
        class: true,
        grade: true,
      },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async update(id: string, dto: UpdateStudentDto) {
    await this.findOne(id);

    if (dto.classId) {
      const classExists = await this.prisma.class.findUnique({
        where: { id: dto.classId },
      });
      if (!classExists) {
        throw new NotFoundException(`Class with ID ${dto.classId} not found`);
      }
    }

    return this.prisma.student.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.student.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async bulkCreateGrades(dto: {
    schoolId: string;
    grades: {
      name: string;
      feeName: string;
      feeAmount: number;
      billingCycle: BillingCycle;
    }[];
  }) {
    // We can use a transaction to ensure all grades and fee structures are created successfully
    return this.prisma.$transaction(async (tx) => {
      const results: any[] = [];
      for (const gradeReq of dto.grades) {
        // Create the grade
        const grade = await tx.grade.create({
          data: {
            name: gradeReq.name,
            schoolId: dto.schoolId,
          },
        });

        // Create the associated fee structure
        const feeStructure = await tx.feeStructure.create({
          data: {
            name: gradeReq.feeName,
            amount: gradeReq.feeAmount,
            billingCycle: gradeReq.billingCycle,
            gradeId: grade.id,
          },
        });

        results.push({ grade, feeStructure });
      }
      return results;
    });
  }
}
