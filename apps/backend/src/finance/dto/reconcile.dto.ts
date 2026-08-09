import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class ReconcilePaymentDto {
  @IsString()
  @IsNotEmpty()
  bankTxId: string;

  @IsString()
  @IsNotEmpty()
  invoiceId: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  paymentDate: string;
}
