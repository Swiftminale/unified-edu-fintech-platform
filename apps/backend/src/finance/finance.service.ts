import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto, CreateFeeStructureDto } from './dto/invoice.dto';
import { ReconcilePaymentDto } from './dto/reconcile.dto';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class FinanceService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('payment-events') private paymentQueue: Queue,
  ) {}

  async createInvoice(dto: CreateInvoiceDto) {
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, isArchived: false },
    });
    if (!student) {
      throw new NotFoundException(`Active student with ID ${dto.studentId} not found`);
    }

    return this.prisma.invoice.create({
      data: {
        studentId: dto.studentId,
        amount: dto.amount,
        feeName: dto.feeName,
        dueDate: new Date(dto.dueDate),
        status: InvoiceStatus.UNPAID,
      },
    });
  }

  async reconcilePayment(dto: ReconcilePaymentDto) {
    const existingLedger = await this.prisma.paymentLedger.findUnique({
      where: { bankTxId: dto.bankTxId },
    });
    if (existingLedger) {
      throw new ConflictException(`Bank transaction ID ${dto.bankTxId} has already been processed`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: dto.invoiceId },
      });

      if (!invoice) {
        throw new NotFoundException(`Invoice with ID ${dto.invoiceId} not found`);
      }

      if (invoice.status === InvoiceStatus.PAID) {
        throw new ConflictException(`Invoice with ID ${dto.invoiceId} is already paid`);
      }

      if (invoice.status === InvoiceStatus.CANCELLED) {
        throw new ConflictException(`Invoice with ID ${dto.invoiceId} has been cancelled`);
      }

      const newPaidAmount = invoice.paidAmount + dto.amount;
      let newStatus: InvoiceStatus = invoice.status;
      
      if (newPaidAmount >= invoice.amount) {
        newStatus = InvoiceStatus.PAID;
      } else if (newPaidAmount > 0) {
        newStatus = InvoiceStatus.PARTIALLY_PAID;
      }

      const updatedInvoice = await tx.invoice.update({
        where: { id: dto.invoiceId },
        data: { 
          status: newStatus,
          paidAmount: newPaidAmount 
        },
      });

      const ledger = await tx.paymentLedger.create({
        data: {
          invoiceId: dto.invoiceId,
          bankTxId: dto.bankTxId,
          amount: dto.amount,
        },
      });

      return { updatedInvoice, ledger };
    });

    await this.paymentQueue.add('payment.reconciled', {
      invoiceId: dto.invoiceId,
      bankTxId: dto.bankTxId,
      amount: dto.amount,
      paymentDate: dto.paymentDate,
    });

    return result;
  }

  async findAllInvoices() {
    return this.prisma.invoice.findMany({
      include: {
        student: true,
      },
    });
  }

  async findInvoiceById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        student: true,
        paymentLedgers: true,
      },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async createFeeStructure(dto: CreateFeeStructureDto) {
    return this.prisma.feeStructure.create({
      data: dto,
    });
  }

  async findAllFeeStructures(gradeId?: string) {
    if (gradeId) {
      return this.prisma.feeStructure.findMany({ where: { gradeId } });
    }
    return this.prisma.feeStructure.findMany();
  }

  async generateBulkInvoices(feeStructureId: string, startDate: string) {
    const feeStructure = await this.prisma.feeStructure.findUnique({
      where: { id: feeStructureId },
      include: { grade: { include: { students: true } } },
    });

    if (!feeStructure) {
      throw new NotFoundException(`Fee structure not found`);
    }

    const students = feeStructure.grade.students.filter(s => !s.isArchived);
    const invoicesData: any[] = [];
    const start = new Date(startDate);
    
    // Determine number of invoices based on billing cycle
    let numInvoices = 1;
    let monthsPerCycle = 12;
    if (feeStructure.billingCycle === 'MONTHLY') {
      numInvoices = 12;
      monthsPerCycle = 1;
    } else if (feeStructure.billingCycle === 'QUARTERLY') {
      numInvoices = 4;
      monthsPerCycle = 3;
    }

    for (const student of students) {
      for (let i = 0; i < numInvoices; i++) {
        const dueDate = new Date(start);
        dueDate.setMonth(start.getMonth() + (i * monthsPerCycle));
        
        invoicesData.push({
          studentId: student.id,
          amount: feeStructure.amount,
          feeName: `${feeStructure.name} - Installment ${i + 1}`,
          dueDate: dueDate,
          status: InvoiceStatus.UNPAID,
        });
      }
    }

    if (invoicesData.length === 0) return { count: 0 };

    await this.prisma.invoice.createMany({
      data: invoicesData,
    });

    return { count: invoicesData.length };
  }
}
