import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;
}
