import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';

@Injectable()
export class SisService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStudentDto) {
    const classExists = await this.prisma.class.findUnique({
      where: { id: dto.classId },
    });
    if (!classExists) {
      throw new NotFoundException(`Class with ID ${dto.classId} not found`);
    }

    return this.prisma.student.create({
      data: {
        name: dto.name,
        email: dto.email,
        classId: dto.classId,
      },
    });
  }

  async findAll() {
    return this.prisma.student.findMany({
      where: { isArchived: false },
      include: {
        class: true,
      },
    });
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, isArchived: false },
      include: {
        class: true,
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
}
