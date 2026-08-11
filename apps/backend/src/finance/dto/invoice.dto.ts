import { IsNotEmpty, IsNumber, IsPositive, IsString, IsDateString, IsEnum } from 'class-validator';
import { BillingCycle } from '@prisma/client';

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;
  
  @IsString()
  @IsNotEmpty()
  feeName: string;
  
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;
}

export class CreateFeeStructureDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;
  
  @IsEnum(BillingCycle)
  @IsNotEmpty()
  billingCycle: BillingCycle;
  
  @IsString()
  @IsNotEmpty()
  gradeId: string;
}
