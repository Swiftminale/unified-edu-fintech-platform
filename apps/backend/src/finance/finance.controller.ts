import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { FinanceService } from './finance.service';
import { CreateInvoiceDto } from './dto/invoice.dto';
import { ReconcilePaymentDto } from './dto/reconcile.dto';

@Controller()
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('invoices')
  @Roles(Role.SuperAdmin, Role.SchoolAdmin)
  async createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.financeService.createInvoice(dto);
  }

  @Get('invoices')
  @Roles(Role.SuperAdmin, Role.SchoolAdmin, Role.SchoolSupervisor, Role.BankAdmin)
  async findAllInvoices() {
    return this.financeService.findAllInvoices();
  }

  @Get('invoices/:id')
  @Roles(Role.SuperAdmin, Role.SchoolAdmin, Role.SchoolSupervisor, Role.BankAdmin)
  async findInvoiceById(@Param('id') id: string) {
    return this.financeService.findInvoiceById(id);
  }

  @Post('webhooks/bank/reconcile')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.SuperAdmin, Role.BankAdmin)
  async reconcile(@Body() dto: ReconcilePaymentDto) {
    return this.financeService.reconcilePayment(dto);
  }

  @Post('fee-structures')
  @Roles(Role.SuperAdmin, Role.SchoolSupervisor, Role.SchoolAdmin)
  async createFeeStructure(@Body() dto: any) {
    return this.financeService.createFeeStructure(dto);
  }

  @Get('fee-structures')
  @Roles(Role.SuperAdmin, Role.SchoolSupervisor, Role.SchoolAdmin)
  async findAllFeeStructures() {
    return this.financeService.findAllFeeStructures();
  }

  @Post('fee-structures/:id/generate-invoices')
  @Roles(Role.SuperAdmin, Role.SchoolSupervisor, Role.SchoolAdmin)
  async generateBulkInvoices(
    @Param('id') id: string,
    @Body() dto: { startDate: string }
  ) {
    return this.financeService.generateBulkInvoices(id, dto.startDate);
  }
}
