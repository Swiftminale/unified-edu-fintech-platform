import { IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';

export class CreateSchoolDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  supervisorName: string;

  @IsEmail()
  @IsNotEmpty()
  supervisorEmail: string;

  @IsString()
  @IsNotEmpty()
  supervisorPassword: string;
}
