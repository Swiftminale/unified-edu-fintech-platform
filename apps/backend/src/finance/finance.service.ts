import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/invoice.dto';
import { ReconcilePaymentDto } from './dto/reconcile.dto';
import { InvoiceStatus } from '../generated/prisma';

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

      const updatedInvoice = await tx.invoice.update({
        where: { id: dto.invoiceId },
        data: { status: InvoiceStatus.PAID },
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
}
